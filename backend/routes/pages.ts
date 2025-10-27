import express, { Request, Response, NextFunction } from 'express';
import { protect, admin } from '../middleware/auth.js';
import Page from '../models/Page.js';
import ApiError from '../utils/ApiError.js';

const adminRouter = express.Router();
const publicRouter = express.Router();

// Admin Routes
adminRouter.use(protect, admin);

adminRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pages = await Page.find({}).sort({ title: 1 });
        res.json(pages);
    } catch (error) { next(error); }
});

adminRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = new Page(req.body);
        const createdPage = await page.save();
        res.status(201).json(createdPage);
    } catch (error) { next(error); }
});

adminRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!page) throw new ApiError(404, 'Page not found');
        res.json(page);
    } catch (error) { next(error); }
});

adminRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = await Page.findByIdAndDelete(req.params.id);
        if (!page) throw new ApiError(404, 'Page not found');
        res.json({ message: 'Page deleted' });
    } catch (error) { next(error); }
});

// Public Routes
publicRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug, status: 'published' });
        if (!page) throw new ApiError(404, 'Page not found');
        res.json(page);
    } catch (error) { next(error); }
});

export { adminRouter as adminPageRouter, publicRouter as publicPageRouter };