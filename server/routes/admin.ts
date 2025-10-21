import express from 'express';
import { protect, admin } from '../middleware/auth';
import User from '../models/User';
import Service from '../models/Service';

const router = express.Router();

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req: express.Request, res: express.Response) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const activeServices = await Service.countDocuments({ status: 'active' });
        
        const activeServiceDocs = await Service.find({ status: 'active' });
        const monthlyRevenue = activeServiceDocs.reduce((acc, service) => acc + service.price, 0);

        res.json({
            totalUsers,
            activeServices,
            monthlyRevenue,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req: express.Request, res: express.Response) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

export default router;