import express, { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// FIX: Add explicit Request and Response types to the route handler.
router.post('/register', async (req: Request, res: Response) => {
    const { name, email, password, phone, address, companyName, gstNumber } = req.body;
    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            address,
            companyName,
            gstNumber,
        });

        if (user) {
             const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
                expiresIn: '1d',
            });
            res.status(201).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    companyName: user.companyName,
                    gstNumber: user.gstNumber,
                    role: user.role,
                    status: user.status,
                    twoFactorEnabled: user.twoFactorEnabled
                },
                token
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
// FIX: Add explicit Request and Response types to the route handler.
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
                expiresIn: '1d',
            });

            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during authentication' });
    }
});

export default router;