import express, { Request, Response, NextFunction } from 'express';
import { protect, admin } from '../middleware/auth.js';
import FAQ from '../models/FAQ.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

// ADMIN ROUTES
router.use('/admin', protect, admin);

// @desc    Get all FAQs
// @route   GET /api/faqs/admin
router.get('/admin', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const faqs = await FAQ.find({}).sort({ category: 1, createdAt: 1 });
        res.json(faqs);
    } catch (error) {
        next(error);
    }
});

// @desc    Create a new FAQ
// @route   POST /api/faqs/admin
router.post('/admin', async (req: Request, res: Response, next: NextFunction) => {
    const { question, answer, category } = req.body;
    try {
        const faq = new FAQ({ question, answer, category });
        const createdFaq = await faq.save();
        res.status(201).json(createdFaq);
    } catch (error) {
        next(error);
    }
});

// @desc    Update an FAQ
// @route   PUT /api/faqs/admin/:id
router.put('/admin/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { question, answer, category } = req.body;
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) throw new ApiError(404, 'FAQ not found');

        faq.question = question;
        faq.answer = answer;
        faq.category = category;

        const updatedFaq = await faq.save();
        res.json(updatedFaq);
    } catch (error) {
        next(error);
    }
});

// @desc    Delete an FAQ
// @route   DELETE /api/faqs/admin/:id
router.delete('/admin/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) throw new ApiError(404, 'FAQ not found');

        await faq.deleteOne();
        res.json({ message: 'FAQ removed' });
    } catch (error) {
        next(error);
    }
});


export default router;