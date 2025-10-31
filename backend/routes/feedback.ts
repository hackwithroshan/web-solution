import express, { Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth.js';
import Feedback from '../models/Feedback.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

router.use(protect);

// @desc    Submit feedback for a chat session
// @route   POST /api/feedback
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const { chatType, rating, comment, sessionId } = req.body;
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');
        if (!chatType || !rating) throw new ApiError(400, 'Chat type and rating are required.');

        const feedback = new Feedback({
            chatType,
            rating,
            comment,
            sessionId,
            user: req.user._id,
        });

        await feedback.save();

        res.status(201).json({ message: 'Feedback submitted successfully.' });
    } catch (error) {
        next(error);
    }
});

export default router;