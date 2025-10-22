import express, { Request, Response, NextFunction } from 'express';
import { protect, admin } from '../middleware/auth.js';
import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

router.use(protect, admin);

// @desc    Get all announcements
// @route   GET /api/announcements
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const announcements = await Announcement.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name');
        res.json(announcements);
    } catch (error) {
        next(error);
    }
});

// @desc    Create a new announcement and send notifications
// @route   POST /api/announcements
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const { title, message } = req.body;
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');

        const announcement = new Announcement({
            title,
            message,
            createdBy: req.user._id
        });
        const createdAnnouncement = await announcement.save();

        // Fan-out notifications to all users
        const users = await User.find({ role: 'user' });
        const notifications = users.map(user => ({
            user: user._id,
            type: 'announcement' as const,
            title,
            message,
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json(createdAnnouncement);
    } catch (error) {
        next(error);
    }
});

export default router;
