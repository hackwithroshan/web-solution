import express, { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';
import speakeasy from 'speakeasy';
import { sendWelcomeEmail, sendPasswordResetEmail, sendRegistrationOtpEmail } from '../utils/sendEmail.js';

const router = express.Router();

// In-memory store for registration OTPs. In a production environment,
// a more persistent store like Redis would be preferable.
const otpStore = new Map<string, { otp: string; expires: number }>();


// A utility function to generate JWT
const generateToken = (id: any, expiresIn: string | number = '1d') => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new ApiError(500, 'Server configuration error: JWT Secret not found.');
    }
    return jwt.sign({ id }, secret as Secret, { expiresIn } as SignOptions);
};

// @desc    Send a verification OTP to a new user's email
// @route   POST /api/auth/send-verification-otp
router.post('/send-verification-otp', async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    try {
        if (!email) {
            throw new ApiError(400, 'Email is required.');
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new ApiError(400, 'An account with this email already exists.');
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store the OTP with a 5-minute expiration
        otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

        // Send the email and wait for it to complete
        await sendRegistrationOtpEmail(email, otp);

        res.status(200).json({ message: 'A verification code has been sent to your email.' });

    } catch (error) {
        next(error);
    }
});


// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, phone, address, companyName, gstNumber, otp } = req.body;
    try {
        // --- OTP Verification ---
        const storedOtpData = otpStore.get(email);
        if (!storedOtpData) {
            throw new ApiError(400, 'Please request a verification code first.');
        }
        if (storedOtpData.expires < Date.now()) {
            otpStore.delete(email); // Clean up expired OTP
            throw new ApiError(400, 'Your verification code has expired. Please request a new one.');
        }
        if (storedOtpData.otp !== otp) {
            throw new ApiError(400, 'The verification code is incorrect.');
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new ApiError(400, 'User already exists');
        }

        const user = await User.create({
            name, email, password, phone, address, companyName, gstNumber,
        });

        if (user) {
            // OTP is valid, clean it up
            otpStore.delete(email);
            
            const token = generateToken(user._id);
            
            // Send welcome email (fire and forget)
            sendWelcomeEmail(user.email, user.name);

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
    const genericSuccessMessage = 'If an account with that email exists, a password reset link has been sent.';

    try {
        const user = await User.findOne({ email });

        // If a user is found, attempt to send the email.
        // Any errors inside this block will be caught by the catch block below.
        if (user) {
            const resetToken = crypto.randomBytes(20).toString('hex');
            
            // Hashed token to store in DB
            const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        resetPasswordToken,
                        resetPasswordExpire,
                    },
                }
            );
            
            // Construct reset URL and send email
            const frontendUrl = process.env.FRONTEND_URL || req.headers.origin;
            if (!frontendUrl) {
                throw new ApiError(500, "Server configuration error: Frontend URL not set and origin header not available.");
            }
            
            const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
            
            // Await the email sending. If it throws, the catch block will handle it.
            await sendPasswordResetEmail(user.email, resetUrl);
        }

        // To prevent user enumeration attacks, always return the same success message
        // whether the user was found or not. The catch block handles actual failures.
        res.status(200).json({ message: genericSuccessMessage });
        
    } catch (error) {
        // Pass any failures (DB error, email service error, etc.) to the error handler.
        // The user will receive a specific error message about the failure.
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