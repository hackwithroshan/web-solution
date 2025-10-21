import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Ticket from '../models/Ticket.js';
import Payment from '../models/Payment.js';
import ServicePlan from '../models/ServicePlan.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import ChatbotKnowledge from '../models/ChatbotKnowledge.js';

const router = express.Router();

// All routes in this file are protected and for admins only
router.use(protect, admin);

// Helper function to format aggregated monthly data for the last 6 months
const processMonthlyData = (aggResult: any[], dataKey: 'count' | 'total') => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dataMap = new Map();

    aggResult.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`;
        dataMap.set(key, item[dataKey]);
    });

    const result = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthName = monthNames[date.getMonth()];
        const key = `${year}-${month}`;
        
        result.push({ month: monthName, value: dataMap.get(key) || 0 });
    }
    return result;
};


// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
router.get('/stats', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // 1. Basic Stats
        const totalUsers = await User.countDocuments({});
        const activeServices = await Service.countDocuments({ status: 'active' });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyPayments = await Payment.find({ date: { $gte: thirtyDaysAgo } });
        const monthlyRevenue = monthlyPayments.reduce((acc, payment) => acc + payment.amount, 0);

        // 2. User Growth Data (last 6 months)
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 3. Revenue Trend Data (last 6 months)
        const revenueTrend = await Payment.aggregate([
             { $match: { date: { $gte: sixMonthsAgo } } },
             { $group: { _id: { year: { $year: "$date" }, month: { $month: "$date" } }, total: { $sum: "$amount" } } },
             { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 4. Ticket Stats
        const ticketStatsAgg = await Ticket.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        
        // 5. Recent Activities
        const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(3).select('name createdAt');
        const recentServices = await Service.find({}).sort({ createdAt: -1 }).limit(3).populate('user', 'name');

        const userGrowthData = processMonthlyData(userGrowth, 'count');
        const revenueTrendData = processMonthlyData(revenueTrend, 'total');
        
        const ticketStats = {
            open: ticketStatsAgg.find(s => s._id === 'open')?.count || 0,
            in_progress: ticketStatsAgg.find(s => s._id === 'in_progress')?.count || 0,
            closed: ticketStatsAgg.find(s => s._id === 'closed')?.count || 0,
        };
        
        const recentActivities = [
            ...recentUsers.map(u => ({ type: 'new_user' as const, text: `${u.name} registered.`, date: u.createdAt })),
            ...recentServices.map(s => ({ type: 'new_service' as const, text: `${s.planName} purchased by ${(s.user as any)?.name || 'a user'}.`, date: s.createdAt }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        res.json({
            totalUsers,
            activeServices,
            monthlyRevenue,
            userGrowthData,
            revenueTrendData,
            ticketStats,
            recentActivities
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Get all users
// @route   GET /api/admin/users
router.get('/users', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        next(error);
    }
});

// @desc    Create a new user by admin
// @route   POST /api/admin/users
router.post('/users', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { name, email, password, role } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) throw new ApiError(400, 'User already exists');
        const user = await User.create({ name, email, password, role, phone: 'N/A', address: 'N/A' });
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});


// @desc    Get user by ID
// @route   GET /api/admin/users/:id
router.get('/users/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) throw new ApiError(404, 'User not found');
        res.json(user);
    } catch (error) {
        next(error);
    }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
router.put('/users/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) throw new ApiError(404, 'User not found');

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.status = req.body.status || user.status;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) throw new ApiError(404, 'User not found');
        
        await Service.deleteMany({ user: user._id });
        await user.deleteOne();

        res.json({ message: 'User and all associated services removed' });
    } catch (error) {
        next(error);
    }
});

// @desc    Get a user's services
// @route   GET /api/admin/users/:id/services
router.get('/users/:id/services', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const services = await Service.find({ user: req.params.id });
        res.json(services);
    } catch (error) {
        next(error);
    }
});

// @desc    Add a service to a user
// @route   POST /api/admin/users/:id/services
router.post('/users/:id/services', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) throw new ApiError(404, 'User not found');
        const service = new Service({ ...req.body, user: user._id });
        const createdService = await service.save();
        res.status(201).json(createdService);
    } catch (error) {
        next(error);
    }
});

// @desc    Delete a user's service
// @route   DELETE /api/admin/users/:userId/services/:serviceId
router.delete('/users/:userId/services/:serviceId', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const service = await Service.findById(req.params.serviceId);
        if (!service) throw new ApiError(404, 'Service not found');
        
        if (service.user.toString() !== req.params.userId) {
            throw new ApiError(400, 'Service does not belong to this user');
        }

        await service.deleteOne();
        res.json({ message: 'Service removed from user' });
    } catch (error) {
        next(error);
    }
});

// @desc    Get all services
// @route   GET /api/admin/services
router.get('/services', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const services = await Service.find({}).populate('user', 'name email').sort({ renewalDate: 1 });
        res.json(services);
    } catch (error) {
        next(error);
    }
});

// @desc    Get service by ID
// @route   GET /api/admin/services/:id
router.get('/services/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const service = await Service.findById(req.params.id).populate('user', 'name email');
        if (!service) throw new ApiError(404, 'Service not found');
        res.json(service);
    } catch (error) {
        next(error);
    }
});

// @desc    Update service
// @route   PUT /api/admin/services/:id
router.put('/services/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) throw new ApiError(404, 'Service not found');

        service.status = req.body.status || service.status;
        if (req.body.renewalDate) {
            service.renewalDate = new Date(req.body.renewalDate);
        }
        
        const updatedService = await service.save();
        res.json(updatedService);
    } catch (error) {
        next(error);
    }
});

// @desc    Get all service plans (admin)
// @route   GET /api/admin/service-plans
router.get('/service-plans', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const plans = await ServicePlan.find({}).populate('category').sort({ name: 1 });
        res.json(plans);
    } catch (error) {
        next(error);
    }
});

// @desc    Create service plan
// @route   POST /api/admin/service-plans
router.post('/service-plans', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const plan = new ServicePlan(req.body);
        const createdPlan = await plan.save();
        res.status(201).json(createdPlan);
    } catch (error) {
        next(error);
    }
});

// @desc    Update service plan
// @route   PUT /api/admin/service-plans/:id
router.put('/service-plans/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const plan = await ServicePlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!plan) throw new ApiError(404, 'Service plan not found');
        res.json(plan);
    } catch (error) {
        next(error);
    }
});

// @desc    Delete service plan
// @route   DELETE /api/admin/service-plans/:id
router.delete('/service-plans/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const plan = await ServicePlan.findById(req.params.id);
        if (!plan) throw new ApiError(404, 'Service plan not found');
        await plan.deleteOne();
        res.json({ message: 'Service plan removed' });
    } catch (error) {
        next(error);
    }
});


// @desc    Get all categories (admin)
// @route   GET /api/admin/categories
router.get('/categories', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

// @desc    Create category
// @route   POST /api/admin/categories
router.post('/categories', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const category = new Category({ name: req.body.name });
        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        next(error);
    }
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
router.put('/categories/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) throw new ApiError(404, 'Category not found');
        category.name = req.body.name || category.name;
        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        next(error);
    }
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) throw new ApiError(404, 'Category not found');
        
        const plansInCategory = await ServicePlan.countDocuments({ category: category._id });
        if (plansInCategory > 0) {
            throw new ApiError(400, 'Cannot delete category with active service plans.');
        }
        
        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } catch (error) {
        next(error);
    }
});

// @desc Get support team members (admin or support role)
// @route GET /api/admin/team
router.get('/team', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const team = await User.find({ role: { $in: ['admin', 'support'] } }).select('name');
        res.json(team);
    } catch (error) {
        next(error);
    }
});

// --- Chatbot Knowledge Routes ---
router.get('/chatbot/knowledge', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const knowledge = await ChatbotKnowledge.find({}).sort({ question: 1 });
        res.json(knowledge);
    } catch (error) {
        next(error);
    }
});

router.post('/chatbot/knowledge', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const entry = new ChatbotKnowledge(req.body);
        const createdEntry = await entry.save();
        res.status(201).json(createdEntry);
    } catch (error) {
        next(error);
    }
});

router.put('/chatbot/knowledge/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const entry = await ChatbotKnowledge.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!entry) throw new ApiError(404, 'Knowledge entry not found');
        res.json(entry);
    } catch (error) {
        next(error);
    }
});

router.delete('/chatbot/knowledge/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const entry = await ChatbotKnowledge.findByIdAndDelete(req.params.id);
        if (!entry) throw new ApiError(404, 'Knowledge entry not found');
        res.json({ message: 'Knowledge entry deleted' });
    } catch (error) {
        next(error);
    }
});


export default router;