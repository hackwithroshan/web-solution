import express, { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

// @desc    Request a consultation
// @route   POST /api/consultations/request
router.post('/request', async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, message } = req.body;
    try {
        if (!name || !email || !phone || !message) {
            throw new ApiError(400, 'All fields are required.');
        }

        // Find all admins to notify them
        const admins = await User.find({ role: 'admin' });
        if (admins.length === 0) {
            // This is a server configuration issue. The request is valid, but we can't process it.
            throw new ApiError(500, 'No administrators found to handle the request.');
        }
        
        const notificationTitle = `New Consultation Request from ${name}`;
        const notificationMessage = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n"${message}"`;

        const notifications = admins.map(admin => ({
            user: admin._id,
            type: 'support' as const, // Use the 'support' type for this
            title: notificationTitle,
            message: notificationMessage,
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({ message: "Consultation request sent successfully. We will be in touch soon!" });

    } catch (error) {
        next(error);
    }
});

export default router;