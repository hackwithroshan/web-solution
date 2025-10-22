import express, { Request, Response, NextFunction } from 'express';
import { protect, admin } from '../middleware/auth.js';
import FAQ from '../models/FAQ.js';
import ApiError from '../utils/ApiError.js';

const publicFaqRouter = express.Router();
const adminFaqRouter = express.Router();

// --- Public Routes ---

// @desc    Get all FAQs (public)
// @route   GET /api/faqs
publicFaqRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const faqs = await FAQ.find({}).sort({ category: 1, createdAt: 1 });
        res.json(faqs);
    } catch (error) {
        next(error);
    }
});

// @desc    Get a few popular FAQs (public)
// @route   GET /api/faqs/public
publicFaqRouter.get('/public', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const faqs = await FAQ.find({}).sort({ createdAt: -1 }).limit(3);
        res.json(faqs);
    } catch (error) {
        next(error);
    }
});


// --- Admin Routes ---
adminFaqRouter.use(protect, admin);

// @desc    Get all FAQs (for admin management)
// @route   GET /api/admin/faqs
adminFaqRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const faqs = await FAQ.find({}).sort({ category: 1, createdAt: -1 });
        res.json(faqs);
    } catch (error) {
        next(error);
    }
});

// @desc    Create a new FAQ
// @route   POST /api/admin/faqs
adminFaqRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const faq = new FAQ(req.body);
        const createdFaq = await faq.save();
        res.status(201).json(createdFaq);
    } catch (error) {
        next(error);
    }
});

// @desc    Update an FAQ
// @route   PUT /api/admin/faqs/:id
adminFaqRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!faq) {
            throw new ApiError(404, 'FAQ not found');
        }
        res.json(faq);
    } catch (error) {
        next(error);
    }
});

// @desc    Delete an FAQ
// @route   DELETE /api/admin/faqs/:id
adminFaqRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            throw new ApiError(404, 'FAQ not found');
        }
        await faq.deleteOne();
        res.json({ message: 'FAQ removed' });
    } catch (error) {
        next(error);
    }
});

export { publicFaqRouter, adminFaqRouter };