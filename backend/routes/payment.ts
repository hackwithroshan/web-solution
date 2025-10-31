import express, { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect } from '../middleware/auth.js';
import ServicePlan, { IServicePlan } from '../models/ServicePlan.js';
import Service from '../models/Service.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured.');
}

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.use(protect);

// @desc    Create an order for new service purchases from cart
// @route   POST /api/payment/create-cart-order
router.post('/create-cart-order', async (req: Request, res: Response, next: NextFunction) => {
    const { cartData } = req.body;
    try {
        if (!req.user) {
            throw new ApiError(401, 'Not authorized');
        }
        if (!Array.isArray(cartData) || cartData.length === 0) {
            throw new ApiError(400, 'Cart data is invalid or empty.');
        }

        const planIds = cartData.map((item: any) => item.planId);
        const plans = await ServicePlan.find({ '_id': { $in: planIds } });
        if (plans.length !== planIds.length) throw new ApiError(404, 'One or more service plans not found.');
        
        const plansMap = new Map(plans.map(p => [p._id.toString(), p]));

        // FIX: Add explicit type for 'item' to improve type safety.
        const totalAmount = cartData.reduce((acc: number, item: { planId: string }) => {
            const plan = plansMap.get(item.planId);
            return acc + (plan?.price || 0);
        }, 0);

        // FIX: Add explicit type for 'item' to improve type safety and prevent potential errors.
        const items = cartData.map((item: { planId: string; domainName?: string; }) => {
             const plan = plansMap.get(item.planId);
             if (!plan) throw new ApiError(404, `Plan with id ${item.planId} not found.`);
             return {
                plan: plan._id,
                itemType: 'new_purchase' as const,
                price: plan.price,
                domainName: item.domainName
             }
        });

        const order = new Order({
            user: req.user._id,
            items,
            totalAmount,
            status: 'pending',
        });

        const razorpayOrder = await razorpayInstance.orders.create({
            amount: order.totalAmount * 100, // Amount in smallest currency unit
            currency: "INR",
            receipt: order.id,
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.json({ orderId: order._id, razorpayOrder });
    } catch (error) {
        next(error);
    }
});

// @desc    Verify payment for new service purchases
// @route   POST /api/payment/verify-cart-payment
router.post('/verify-cart-payment', async (req: Request, res: Response, next: NextFunction) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    try {
        if (!req.user) {
            throw new ApiError(401, 'Not authorized');
        }
        
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
                                    .update(body.toString())
                                    .digest('hex');

        if (expectedSignature === razorpay_signature) {
            const order = await Order.findById(orderId).populate('items.plan');
            if (!order) throw new ApiError(404, 'Order not found');

            order.status = 'completed';
            await order.save();
            
            // Create new services for the user
            const newServices = order.items.map(item => {
                // FIX: Add a type guard to ensure item.plan is a populated document before accessing its properties.
                // This resolves the error "Property 'price' does not exist on type 'unknown'".
                if (!item.plan || typeof item.plan !== 'object' || !('_id' in item.plan)) {
                    throw new ApiError(500, 'Order plan data is missing or not populated.');
                }
                const plan = item.plan as IServicePlan;
                return {
                    user: req.user!._id,
                    planName: plan.name,
                    status: 'active' as const,
                    startDate: new Date(),
                    renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Assuming 1 year for now
                    price: plan.price,
                    domainName: item.domainName,
                }
            });

            await Service.insertMany(newServices);
            
            // Create a payment record
            const payment = new Payment({
                user: req.user!._id,
                order: order._id,
                amount: order.totalAmount,
                transactionId: razorpay_payment_id,
                status: 'completed',
            });
            await payment.save();

            res.json({ success: true, message: 'Payment verified and services activated.' });
        } else {
            throw new ApiError(400, 'Payment verification failed.');
        }
    } catch (error) {
        next(error);
    }
});

// @desc    Create an order for renewing existing services
// @route   POST /api/payment/create-renewal-order
router.post('/create-renewal-order', async (req: Request, res: Response, next: NextFunction) => {
    const { serviceIds } = req.body;
    try {
        if (!req.user) {
            throw new ApiError(401, 'Not authorized');
        }

        const services = await Service.find({ '_id': { $in: serviceIds }, user: req.user._id });
        if (services.length !== serviceIds.length) throw new ApiError(404, 'One or more services not found or do not belong to you.');

        const totalAmount = services.reduce((acc, service) => acc + service.price, 0);
        const items = services.map(service => ({
            service: service._id,
            itemType: 'renewal' as const,
            price: service.price
        }));

        const order = new Order({
            user: req.user._id,
            items,
            totalAmount,
            status: 'pending',
        });

        const razorpayOrder = await razorpayInstance.orders.create({
            amount: order.totalAmount * 100,
            currency: "INR",
            receipt: order.id,
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.json({ orderId: order._id, razorpayOrder });
    } catch (error) {
        next(error);
    }
});

// @desc    Verify payment for service renewals
// @route   POST /api/payment/verify-renewal-payment
router.post('/verify-renewal-payment', async (req: Request, res: Response, next: NextFunction) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
     try {
        if (!req.user) {
            throw new ApiError(401, 'Not authorized');
        }
        
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
                                    .update(body.toString())
                                    .digest('hex');
        
        if (expectedSignature === razorpay_signature) {
            const order = await Order.findById(orderId);
            if (!order) throw new ApiError(404, 'Order not found');

            order.status = 'completed';
            await order.save();

            // Update renewal dates for existing services
            for (const item of order.items) {
                const service = await Service.findById(item.service);
                if (service) {
                    const currentRenewal = new Date(service.renewalDate);
                    // Extend by 1 year from the *current* expiry date, not from today
                    service.renewalDate = new Date(currentRenewal.setFullYear(currentRenewal.getFullYear() + 1));
                    await service.save();
                }
            }
            
            const payment = new Payment({
                user: req.user!._id,
                order: order._id,
                amount: order.totalAmount,
                transactionId: razorpay_payment_id,
                status: 'completed',
            });
            await payment.save();
            
            res.json({ success: true, message: 'Payment verified and services renewed.' });
        } else {
            throw new ApiError(400, 'Payment verification failed.');
        }
    } catch (error) {
        next(error);
    }
});

export default router;