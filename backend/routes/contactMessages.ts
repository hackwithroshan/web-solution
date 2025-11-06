import express, { Request, Response, NextFunction } from 'express';
import ContactMessage from '../models/ContactMessage.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

// @desc    Submit a contact form message
// @route   POST /api/contact
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, subject, message } = req.body;
    try {
        if (!name || !email || !subject || !message) {
            throw new ApiError(400, 'All fields are required.');
        }

        const contactMessage = new ContactMessage({ name, email, subject, message });
        await contactMessage.save();

        // Notify all admins
        const admins = await User.find({ role: 'admin' });
        if (admins.length > 0) {
            const notificationTitle = `New Contact Message from ${name}`;
            const notificationMessage = `Subject: ${subject}`;
            const notifications = admins.map(admin => ({
                user: admin._id,
                type: 'support' as const,
                title: notificationTitle,
                message: notificationMessage,
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ message: "Message sent successfully. We will get back to you shortly." });

    } catch (error) {
        next(error);
    }
});

export default router;