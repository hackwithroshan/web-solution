import express, { Request, Response } from 'express';
import { protect } from '../middleware/auth';
import Service from '../models/Service';

const router = express.Router();

// @desc    Get services for a specific user
// @route   GET /api/users/:id/services
// @access  Private
// FIX: Add explicit Request and Response types to the route handler.
router.get('/:id/services', protect, async (req: Request, res: Response) => {
    try {
        const services = await Service.find({ user: req.params.id });
        if (services) {
            res.json(services);
        } else {
            res.status(404).json({ message: 'Services not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;