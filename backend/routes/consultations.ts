import express, { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import Consultation from '../models/Consultation.js';
import { protect, admin } from '../middleware/auth.js';

const publicRouter = express.Router();
const adminRouter = express.Router();

// --- Public Routes ---

// @desc    Request a consultation
// @route   POST /api/consultations/request
publicRouter.post('/request', async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, message } = req.body;
    try {
        if (!name || !email || !phone || !message) {
            throw new ApiError(400, 'All fields are required.');
        }

        // Save consultation to DB
        await Consultation.create({ name, email, phone, message });

        const admins = await User.find({ role: 'admin' });
        if (admins.length > 0) {
            const notificationTitle = `New Consultation Request from ${name}`;
            const notificationMessage = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n"${message}"`;
            const notifications = admins.map(admin => ({
                user: admin._id,
                type: 'support' as const,
                title: notificationTitle,
                message: notificationMessage,
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ message: "Consultation request sent successfully. We will be in touch soon!" });
    } catch (error) {
        next(error);
    }
});


// --- Admin Routes ---
adminRouter.use(protect, admin);

// @desc    Get all consultations
// @route   GET /api/admin/consultations
adminRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const consultations = await Consultation.find({}).sort({ createdAt: -1 });
        res.json(consultations);
    } catch (error) {
        next(error);
    }
});

// @desc    Update consultation status
// @route   PUT /api/admin/consultations/:id
adminRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        if (!status || !['pending', 'contacted'].includes(status)) {
            throw new ApiError(400, 'Invalid status provided.');
        }
        const consultation = await Consultation.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!consultation) {
            throw new ApiError(404, 'Consultation not found.');
        }
        res.json(consultation);
    } catch (error) {
        next(error);
    }
});

export { adminRouter as adminConsultationRouter, publicRouter as publicConsultationRouter };