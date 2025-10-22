import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { protect, admin } from '../middleware/auth.js';
import Ticket from '../models/Ticket.js';
import Message from '../models/Message.js';
import ApiError from '../utils/ApiError.js';
import upload from '../middleware/upload.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';


const router = express.Router();

// All ticket routes require a logged-in user.
router.use(protect);

// --- USER ROUTES ---

// @desc    Get the current user's tickets
// @route   GET /api/tickets
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ApiError(401, "Not authorized");
        }
        const tickets = await Ticket.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.json(tickets);
    } catch (error) {
        next(error);
    }
});

// @desc    Create a new ticket
// @route   POST /api/tickets
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const { subject, message } = req.body;
    try {
        if (!req.user) {
            throw new ApiError(401, "Not authorized");
        }

        const ticket = new Ticket({
            subject,
            user: req.user._id,
        });

        const firstMessage = new Message({
            ticket: ticket._id,
            sender: req.user._id,
            text: message,
        });
        await firstMessage.save();

        ticket.messages.push(firstMessage._id as any);
        const createdTicket = await ticket.save();

        res.status(201).json(createdTicket);
    } catch (error) {
        next(error);
    }
});

// @desc    Request a callback
// @route   POST /api/tickets/request-callback
router.post('/request-callback', async (req: Request, res: Response, next: NextFunction) => {
    const { phone, message } = req.body;
    try {
        if (!req.user) throw new ApiError(401, 'Not authorized');
        if (!phone || !message) throw new ApiError(400, 'Phone and message are required.');

        // Find all admins and support staff
        const supportTeam = await User.find({ role: { $in: ['admin', 'support'] } });
        if (supportTeam.length === 0) {
            // Failsafe, shouldn't happen in a configured system
            throw new ApiError(500, 'No support team members found to route the request.');
        }

        const notifications = supportTeam.map(teamMember => ({
            user: teamMember._id,
            type: 'support' as const,
            title: `Callback Request from ${req.user!.name}`,
            message: `User: ${req.user!.name} (${req.user!.email})\nPhone: ${phone}\nMessage: "${message}"`,
        }));

        await Notification.insertMany(notifications);

        res.status(200).json({ message: "Callback request received. We will contact you shortly." });
    } catch (error) {
        next(error);
    }
});


// --- ADMIN & SHARED ROUTES ---

// IMPORTANT: Route Order Matters.
// The specific route '/all' must be defined BEFORE the dynamic route '/:id'.
// This ensures that Express matches a request to '/api/tickets/all' correctly,
// instead of mistakenly treating 'all' as a parameter for the '/:id' route,
// which causes the "Cast to ObjectId failed" error.

// @desc    Get all tickets (admin)
// @route   GET /api/tickets/all
router.get('/all', admin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tickets = await Ticket.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'populatedUser'
                }
            },
            {
                $unwind: {
                    path: '$populatedUser',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1, subject: 1, status: 1, priority: 1, createdAt: 1, updatedAt: 1,
                    user: {
                        _id: '$populatedUser._id',
                        name: '$populatedUser.name',
                        email: '$populatedUser.email' // Also populate email for context
                    }
                }
            },
            { $sort: { updatedAt: -1 } }
        ]);

        const validTickets = tickets.filter(ticket => ticket.user && ticket.user._id);
        res.json(validTickets);
    } catch (error) {
        next(error);
    }
});

// @desc    Get a single ticket by ID (for admin or ticket owner)
// @route   GET /api/tickets/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            throw new ApiError(404, 'The requested resource could not be found. The ID may be incorrect.');
        }
        if (!req.user) {
            throw new ApiError(401, 'Not authorized');
        }

        const ticketId = new mongoose.Types.ObjectId(req.params.id);

        const ticketAggregation = await Ticket.aggregate([
            { $match: { _id: ticketId } },
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'users', localField: 'assignedTo', foreignField: '_id', as: 'assignedTo' } },
            { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'messages', localField: 'messages', foreignField: '_id', as: 'messages' } },
            { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'users', localField: 'messages.sender', foreignField: '_id', as: 'messages.sender' } },
            { $unwind: { path: '$messages.sender', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    messages: { $push: '$messages' }
                }
            },
            { $replaceRoot: { newRoot: { $mergeObjects: ['$doc', { messages: '$messages' }] } } },
            {
                $project: {
                    _id: 1, subject: 1, status: 1, priority: 1, createdAt: 1, updatedAt: 1,
                    user: { _id: '$user._id', name: '$user.name', email: '$user.email' },
                    assignedTo: { _id: '$assignedTo._id', name: '$assignedTo.name' },
                    messages: {
                        $filter: {
                            input: '$messages',
                            as: 'msg',
                            cond: { $ifNull: ['$$msg._id', false] }
                        }
                    }
                }
            }
        ]);
        
        const ticket = ticketAggregation[0];

        if (!ticket) throw new ApiError(404, 'Ticket not found');

        
        if (req.user.role !== 'admin' && ticket.user?._id?.toString() !== req.user.id) {
            throw new ApiError(403, 'Not authorized to view this ticket');
        }
        res.json(ticket);
    } catch (error) {
        next(error);
    }
});

// @desc    Send a message in a ticket
// @route   POST /api/tickets/:id/messages
router.post('/:id/messages', async (req: Request, res: Response, next: NextFunction) => {
    const { text } = req.body;
    try {
        if (!req.user) {
            throw new ApiError(401, "Not authorized");
        }
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) throw new ApiError(404, 'Ticket not found');

        const message = new Message({
            ticket: ticket._id,
            sender: req.user._id,
            text,
        });
        await message.save();

        ticket.messages.push(message._id as any);
        ticket.updatedAt = new Date();
        ticket.status = req.user.role === 'user' ? 'open' : 'in_progress';

        await ticket.save();
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name role');
        res.status(201).json(populatedMessage);
    } catch (error) {
        next(error);
    }
});

// @desc    Upload an attachment to a ticket
// @route   POST /api/tickets/:id/upload
router.post('/:id/upload', upload.single('attachment'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw new ApiError(400, 'Please upload a file');
        if (!req.user) {
            throw new ApiError(401, "Not authorized");
        }
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) throw new ApiError(404, 'Ticket not found');
        
        const attachmentType = req.file.mimetype.startsWith('image') ? 'image' : 'file';

        const message = new Message({
            ticket: req.params.id,
            sender: req.user._id,
            text: req.body.text || '',
            attachmentUrl: `/uploads/${req.file.filename}`,
            attachmentType,
        });
        await message.save();
        
        ticket.messages.push(message._id as any);
        ticket.updatedAt = new Date();
        await ticket.save();

        const populatedMessage = await Message.findById(message._id).populate('sender', 'name role');
        res.status(201).json(populatedMessage);
    } catch (error) {
        next(error);
    }
});

// @desc    Update ticket status, assignment, priority (admin)
// @route   PUT /api/tickets/:id
router.put('/:id', admin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) throw new ApiError(404, 'Ticket not found');

        const { status, assignedTo, priority } = req.body;
        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;
        if (assignedTo !== undefined) ticket.assignedTo = assignedTo || undefined;

        await ticket.save();
        const populatedTicket = await Ticket.findById(ticket._id)
            .populate('user', 'name email')
            .populate('assignedTo', 'name')
            .populate({
                path: 'messages',
                populate: { path: 'sender', select: '_id name role' }
            });
        res.json(populatedTicket);
    } catch (error) {
        next(error);
    }
});


export default router;
