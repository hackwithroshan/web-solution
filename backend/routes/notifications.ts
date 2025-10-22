import express, { Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

router.use(protect);

// @desc    Get user's notifications
// @route   GET /api/notifications
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        next(error);
    }
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
router.put('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');
        const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });

        if (!notification) throw new ApiError(404, 'Notification not found');

        notification.isRead = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } catch (error) {
        next(error);
    }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
router.put('/read-all', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
});

export default router;