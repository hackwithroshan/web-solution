import express from 'express';
import { protect } from '../middleware/auth.js';
import Service from '../models/Service.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import speakeasy from 'speakeasy';
import crypto from 'crypto';

const router = express.Router();

// All routes in this file are for logged-in users
router.use(protect);

// @desc    Get services for a specific user
// @route   GET /api/users/:id/services
router.get('/:id/services', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'Not authorized');
        }
        // Ensure user is requesting their own services
        if (req.user.id !== req.params.id) {
            throw new ApiError(403, "Not authorized to access this resource");
        }
        const services = await Service.find({ user: req.params.id });
        res.json(services);
    } catch (error) {
        next(error);
    }
});

// @desc    Get payment history for a user
// @route   GET /api/users/:id/payments
router.get('/:id/payments', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'Not authorized');
        }
        if (req.user.id !== req.params.id) {
            throw new ApiError(403, "Not authorized to access this resource");
        }
        const payments = await Payment.find({ user: req.params.id })
            .populate({
                path: 'order',
                populate: [
                    { path: 'items.plan', model: 'ServicePlan' },
                    { path: 'items.service', model: 'Service' }
                ]
            })
            .sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        next(error);
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
router.put('/profile', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'Not authorized');
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.companyName = req.body.companyName || user.companyName;
        user.gstNumber = req.body.gstNumber || user.gstNumber;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
});

// @desc    Update user password
// @route   PUT /api/users/profile/password
router.put('/profile/password', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');

        const user = await User.findById(req.user._id);
        if (!user) throw new ApiError(404, 'User not found');

        const { currentPassword, newPassword } = req.body;
        if (!(await user.matchPassword(currentPassword))) {
            throw new ApiError(401, 'Invalid current password');
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
});

// @desc    Generate 2FA secret
// @route   POST /api/users/profile/2fa/generate
router.post('/profile/2fa/generate', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');

        const user = await User.findById(req.user._id);
        if (!user) throw new ApiError(404, 'User not found');

        const secret = speakeasy.generateSecret({
            name: `ApexNucleus:${user.email}`
        });

        user.twoFactorSecret = secret.base32;
        await user.save();

        res.json({ secret: secret.base32, qrCodeUrl: secret.otpauth_url });
    } catch (error) {
        next(error);
    }
});

// @desc    Enable 2FA
// @route   POST /api/users/profile/2fa/enable
router.post('/profile/2fa/enable', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { token } = req.body;
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');

        const user = await User.findById(req.user._id);
        if (!user || !user.twoFactorSecret) throw new ApiError(400, '2FA not generated');

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
        });

        if (verified) {
            user.twoFactorEnabled = true;

            // Generate recovery codes
            const recoveryCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
            user.twoFactorRecoveryCodes = recoveryCodes;

            await user.save();
            res.json({ recoveryCodes });
        } else {
            throw new ApiError(400, 'Invalid authentication code');
        }
    } catch (error) {
        next(error);
    }
});

// @desc    Disable 2FA
// @route   POST /api/users/profile/2fa/disable
router.post('/profile/2fa/disable', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { password, token } = req.body;
     try {
        if (!req.user) throw new ApiError(401, 'Not authorized');

        const user = await User.findById(req.user._id);
        if (!user || !user.twoFactorSecret) throw new ApiError(400, '2FA is not enabled');

        if (!(await user.matchPassword(password))) {
            throw new ApiError(401, 'Invalid password');
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
        });

        if (verified) {
            user.twoFactorEnabled = false;
            user.twoFactorSecret = undefined;
            user.twoFactorRecoveryCodes = [];
            await user.save();
            res.json({ message: 'Two-factor authentication has been disabled.' });
        } else {
            throw new ApiError(400, 'Invalid authentication code');
        }
    } catch (error) {
        next(error);
    }
});


export default router;