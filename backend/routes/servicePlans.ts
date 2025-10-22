import express, { Request, Response, NextFunction } from 'express';
import ServicePlan from '../models/ServicePlan.js';
import Category from '../models/Category.js';

const router = express.Router();

// PUBLIC ROUTES

// @desc    Fetch all service plans
// @route   GET /api/service-plans
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const plans = await ServicePlan.find({}).populate('category');
        res.json(plans);
    } catch (error) {
        next(error);
    }
});

// @desc    Fetch all categories
// @route   GET /api/service-plans/categories
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

export default router;
