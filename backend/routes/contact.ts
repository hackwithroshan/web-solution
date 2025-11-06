import express, { Request, Response, NextFunction } from 'express';
import { protect, admin } from '../middleware/auth.js';
import ApiError from '../utils/ApiError.js';
import ContactSubmission from '../models/ContactSubmission.js';

const publicContactRouter = express.Router();
const adminContactRouter = express.Router();

// --- Public Route ---
// @desc    Submit a contact form message
// @route   POST /api/contact
publicContactRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, subject, message } = req.body;
    try {
        if (!name || !email || !subject || !message) {
            throw new ApiError(400, 'All fields are required.');
        }
        await ContactSubmission.create({ name, email, subject, message });
        res.status(201).json({ message: 'Your message has been sent successfully. We will get back to you shortly.' });
    } catch (error) {
        next(error);
    }
});

// --- Admin Routes ---
adminContactRouter.use(protect, admin);

// @desc    Get all contact submissions
// @route   GET /api/admin/contact-submissions
adminContactRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const submissions = await ContactSubmission.find({}).sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        next(error);
    }
});

// @desc    Update a contact submission's status
// @route   PUT /api/admin/contact-submissions/:id
adminContactRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        if (!status || !['new', 'read', 'archived'].includes(status)) {
            throw new ApiError(400, 'Invalid status provided.');
        }
        const submission = await ContactSubmission.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!submission) {
            throw new ApiError(404, 'Submission not found.');
        }
        res.json(submission);
    } catch (error) {
        next(error);
    }
});

export { publicContactRouter, adminContactRouter };