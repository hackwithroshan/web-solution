import express, { Request, Response, NextFunction } from 'express';
import EmailSubscriber from '../models/EmailSubscriber.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

// @desc    Subscribe to newsletter
// @route   POST /api/subscribe
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    try {
        if (!email) {
            throw new ApiError(400, 'Email address is required.');
        }

        const existingSubscriber = await EmailSubscriber.findOne({ email });
        if (existingSubscriber) {
            throw new ApiError(400, 'This email is already subscribed.');
        }

        await EmailSubscriber.create({ email });

        res.status(201).json({ message: 'Thank you for subscribing to our newsletter!' });
    } catch (error) {
        next(error);
    }
});

export default router;
