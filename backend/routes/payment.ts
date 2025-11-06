import express, { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Service from '../models/Service.js';
import ServicePlan from '../models/ServicePlan.js';
import ApiError from '../utils/ApiError.js';
import logger from '../logger.js';
import { IService } from '../models/Service.js';

const router = express.Router();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    logger.warn("Razorpay credentials are not configured. Payment routes will not work.");
}
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});


// All payment routes are protected
router.use(protect);

// @desc    Create a new order from cart items
// @route   POST /api/payment/create-cart-order
router.post('/create-cart-order', async (req: Request, res: Response, next: NextFunction) => {
    const { cartData } = req.body; // Expects an array of { planId: string, domainName?: string }

    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');
        if (!cartData || !Array.isArray(cartData) || cartData.length === 0) {
            throw new ApiError(400, 'Cart data is required and must be a non-empty array.');
        }

        const planIds = cartData.map(item => item.planId);
        const plans = await ServicePlan.find({ '_id': { $in: planIds } });

        if (plans.length !== planIds.length) {
            throw new ApiError(404, 'One or more service plans not found.');
        }

        let totalAmount = 0;
        const orderItems = cartData.map(cartItem => {
            const plan = plans.find(p => p._id.toString() === cartItem.planId);
            if (!plan) throw new ApiError(500, 'Internal error processing cart item.'); // Should not happen
            totalAmount += plan.price;
            return {
                plan: plan._id,
                itemType: 'new_purchase' as const,
                price: plan.price,
                domainName: cartItem.domainName,
            };
        });

        const newOrder = new Order({
            user: req.user._id,
            items: orderItems,
            totalAmount: totalAmount,
            status: 'pending',
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100, // Amount in paise
            currency: 'INR',
            receipt: newOrder._id.toString(),
        });
        
        newOrder.razorpayOrderId = razorpayOrder.id;
        await newOrder.save();
        
        res.json({ orderId: newOrder._id, razorpayOrder });

    } catch (error) {
        next(error);
    }
});

// @desc    Verify payment for a cart order and activate services
// @route   POST /api/payment/verify-cart-payment
router.post('/verify-cart-payment', async (req: Request, res: Response, next: NextFunction) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');

        const order = await Order.findById(orderId).populate('items.plan');
        if (!order || order.user.toString() !== req.user._id.toString()) {
            throw new ApiError(404, 'Order not found.');
        }
        if (order.status !== 'pending') {
            throw new ApiError(400, 'This order has already been processed.');
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment is authentic
            order.status = 'completed';
            await order.save();

            await Payment.create({
                user: req.user._id,
                order: order._id,
                amount: order.totalAmount,
                transactionId: razorpay_payment_id,
                status: 'completed',
            });

            // Activate services
            for (const item of order.items) {
                const plan = item.plan as any; // Populated
                if (item.itemType === 'new_purchase' && plan) {
                    const renewalDate = new Date();
                    // Assuming yearly plans for simplicity
                    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                    
                    await Service.create({
                        user: req.user._id,
                        planName: plan.name,
                        price: plan.price,
                        status: 'active',
                        startDate: new Date(),
                        renewalDate: renewalDate,
                        domainName: item.domainName
                    });
                }
            }
            res.status(200).json({ message: 'Payment successful and services activated.' });
        } else {
            throw new ApiError(400, 'Payment verification failed. Invalid signature.');
        }

    } catch (error) {
        next(error);
    }
});


// @desc    Create a renewal order for existing services
// @route   POST /api/payment/create-renewal-order
router.post('/create-renewal-order', async (req: Request, res: Response, next: NextFunction) => {
    const { serviceIds } = req.body;
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');
        if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
            throw new ApiError(400, 'Service IDs are required.');
        }

        const services = await Service.find({
            '_id': { $in: serviceIds },
            'user': req.user._id
        });
        
        if (services.length !== serviceIds.length) {
            throw new ApiError(404, 'One or more services not found or do not belong to you.');
        }

        let totalAmount = 0;
        const orderItems = services.map(service => {
            totalAmount += service.price;
            return {
                service: service._id,
                itemType: 'renewal' as const,
                price: service.price
            };
        });

        const newOrder = new Order({
            user: req.user._id,
            items: orderItems,
            totalAmount: totalAmount,
            status: 'pending',
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: newOrder._id.toString(),
        });
        
        newOrder.razorpayOrderId = razorpayOrder.id;
        await newOrder.save();

        res.json({ orderId: newOrder._id, razorpayOrder });
    } catch (error) {
        next(error);
    }
});

// @desc    Verify payment for a renewal order
// @route   POST /api/payment/verify-renewal-payment
router.post('/verify-renewal-payment', async (req: Request, res: Response, next: NextFunction) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');

        const order = await Order.findById(orderId);
        if (!order || order.user.toString() !== req.user._id.toString()) {
            throw new ApiError(404, 'Order not found.');
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            order.status = 'completed';
            await order.save();
            
            await Payment.create({
                user: req.user._id,
                order: order._id,
                amount: order.totalAmount,
                transactionId: razorpay_payment_id,
                status: 'completed',
            });

            // Renew services
            for (const item of order.items) {
                if (item.itemType === 'renewal' && item.service) {
                    // FIX: Removed unnecessary and incorrect type assertion `as IService | null`.
                    // The type inferred from `Service.findById` is correct and includes the `save` method.
                    const service = await Service.findById(item.service);
                    if (service) {
                        const newRenewalDate = new Date(service.renewalDate);
                        newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
                        service.renewalDate = newRenewalDate;
                        service.status = 'active'; // Reactivate if expired
                        await service.save();
                    }
                }
            }
            res.status(200).json({ message: 'Payment successful and services renewed.' });
        } else {
            throw new ApiError(400, 'Payment verification failed. Invalid signature.');
        }

    } catch (error) {
        next(error);
    }
});


export default router;