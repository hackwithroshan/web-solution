import express, { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';
import speakeasy from 'speakeasy';

const router = express.Router();

// A utility function to generate JWT
const generateToken = (id: any, expiresIn: string | number = '1d') => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new ApiError(500, 'Server configuration error: JWT Secret not found.');
    }
    return jwt.sign({ id }, secret as Secret, { expiresIn } as SignOptions);
};

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, phone, address, companyName, gstNumber } = req.body;
    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            throw new ApiError(400, 'User already exists');
        }

        const user = await User.create({
            name, email, password, phone, address, companyName, gstNumber,
        });

        if (user) {
            const token = generateToken(user._id);
            res.status(201).json({
                user, // send full user object
                token
            });
        } else {
            throw new ApiError(400, 'Invalid user data');
        }
    } catch (error) {
        next(error);
    }
});

// @desc    Auth user & get token (Step 1)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.twoFactorEnabled) {
                const twoFactorToken = generateToken(user._id, '5m');
                res.json({ twoFactorRequired: true, twoFactorToken });
            } else {
                const token = generateToken(user._id);
                res.json({ user, token });
            }
        } else {
            throw new ApiError(401, 'Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
});

// @desc    Verify 2FA code and complete login (Step 2)
// @route   POST /api/auth/login/verify-2fa
// @access  Public
router.post('/login/verify-2fa', async (req: Request, res: Response, next: NextFunction) => {
    const { token: twoFactorToken, code } = req.body;
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new ApiError(500, 'Server configuration error: JWT Secret not found.');
        }
        const decoded: any = jwt.verify(twoFactorToken, secret as Secret);
        const user = await User.findById(decoded.id);

        if (!user || !user.twoFactorSecret) {
            throw new ApiError(401, 'Invalid 2FA request.');
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
        });

        if (verified) {
            const token = generateToken(user._id);
            res.json({ user, token });
        } else {
            throw new ApiError(401, 'Invalid authentication code.');
        }
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
             next(new ApiError(401, 'Invalid or expired 2FA session.'));
        } else {
            next(error);
        }
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            const resetToken = crypto.randomBytes(20).toString('hex');
            user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await user.save();
            // In a real app, you would email this token to the user.
            // For this example, we just confirm the process started.
        }
        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        next(error);
    }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', async (req: Request, res: Response, next: NextFunction) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            throw new ApiError(400, 'Invalid or expired token');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
});

export default router;
