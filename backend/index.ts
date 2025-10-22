import './config.js'; // Must be the first import to load environment variables
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

import logger from './logger.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import LiveChatSession from './models/LiveChatSession.js';

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';
import servicePlanRoutes from './routes/servicePlans.js';
import ticketRoutes from './routes/tickets.js';
import paymentRoutes from './routes/payment.js';
import configRoutes from './routes/config.js';
import chatRoutes from './routes/chat.js';
import { publicFaqRouter, adminFaqRouter } from './routes/faq.js';
import notificationRoutes from './routes/notifications.js';
import announcementRoutes from './routes/announcements.js';
import performanceRoutes from './routes/performance.js';

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for simplicity, tighten in production
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/service-plans', servicePlanRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/config', configRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/faqs', publicFaqRouter);
app.use('/api/admin/faqs', adminFaqRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/announcements', announcementRoutes);
app.use('/api/performance', performanceRoutes);


// --- Live Chat State (Persistent) ---
const adminSockets = new Set<string>();

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // --- Ticket System Logic ---
  socket.on('joinTicket', (ticketId) => {
    socket.join(ticketId);
    logger.info(`Socket ${socket.id} joined room for ticket ${ticketId}`);
  });
  socket.on('sendMessage', ({ ticketId, message }) => {
    socket.to(ticketId).emit('newMessage', message);
  });

  // --- Live Chat Logic (DB-backed) ---
  const emitQueueUpdate = async () => {
    try {
        const queue = await LiveChatSession.find({ status: 'waiting' })
            .select('user userSocketId')
            .lean();
        
        const queueData = queue.map(session => ({
            socketId: session.userSocketId,
            user: { _id: session.user._id.toString(), name: session.user.name },
            history: []
        }));
        
        adminSockets.forEach(adminSocketId => {
            io.to(adminSocketId).emit('liveChatQueueUpdate', queueData);
        });
    } catch (error) {
        logger.error({ err: error }, "Failed to emit live chat queue update");
    }
  };

  socket.on('adminConnected', () => {
      logger.info(`Admin connected for live chat: ${socket.id}`);
      adminSockets.add(socket.id);
      emitQueueUpdate();
  });

  socket.on('requestLiveChat', async ({ user, history }) => {
    try {
        const existingSession = await LiveChatSession.findOne({ 'user._id': user._id, status: 'waiting' });
        if (existingSession) {
            existingSession.userSocketId = socket.id;
            await existingSession.save();
            logger.info(`User ${user.name} reconnected to waiting queue.`);
        } else {
            logger.info(`User ${user.name} requesting live chat.`);
            await LiveChatSession.create({
                user: { _id: user._id, name: user.name },
                userSocketId: socket.id,
                history,
                status: 'waiting',
            });
        }
        await emitQueueUpdate();
    } catch (error) {
        logger.error({ err: error }, "Failed to handle live chat request");
    }
  });

  socket.on('adminAcceptsChat', async (userSocketId) => {
    try {
        if (!adminSockets.has(socket.id)) return;

        const session = await LiveChatSession.findOneAndUpdate(
            { userSocketId, status: 'waiting' },
            { 
                adminSocketId: socket.id,
                status: 'active',
            },
            { new: true }
        ).populate('user._id');

        if (!session) {
            logger.warn(`Admin ${socket.id} tried to accept a chat for user ${userSocketId} that is no longer available.`);
            socket.emit('chatSessionEnded');
            await emitQueueUpdate();
            return;
        }

        const sessionId = session._id.toString();
        
        socket.join(sessionId);
        io.sockets.sockets.get(userSocketId)?.join(sessionId);

        const sessionData = {
            id: sessionId,
            user: session.user,
            history: session.history
        };
        
        io.to(socket.id).emit('chatSessionStarted', sessionData);
        io.to(userSocketId).emit('chatSessionStarted', sessionData);
        
        logger.info(`Admin ${socket.id} accepted chat with user ${userSocketId}. Session: ${sessionId}`);
        await emitQueueUpdate();
    } catch (error) {
        logger.error({ err: error }, "Failed to handle admin accepting chat");
    }
  });

  socket.on('liveChatMessage', async ({ sessionId, message }) => {
    try {
        const session = await LiveChatSession.findByIdAndUpdate(
            sessionId,
            { $push: { history: message as any } },
            { new: true }
        );

        if (session && session.status === 'active') {
            socket.to(sessionId).emit('liveChatMessage', message);
        }
    } catch (error) {
        logger.error({ err: error }, "Failed to process live chat message");
    }
  });

  socket.on('startTyping', (sessionId) => {
    socket.to(sessionId).emit('isTyping');
  });

  socket.on('stopTyping', (sessionId) => {
    socket.to(sessionId).emit('hasStoppedTyping');
  });
  
  socket.on('endLiveChat', async (sessionId) => {
    try {
        const session = await LiveChatSession.findByIdAndUpdate(sessionId, { status: 'closed' });
        if (session) {
            io.to(sessionId).emit('chatSessionEnded');
            io.sockets.sockets.get(session.userSocketId)?.leave(sessionId);
            if(session.adminSocketId) {
                io.sockets.sockets.get(session.adminSocketId)?.leave(sessionId);
            }
            logger.info(`Session ${sessionId} ended by a user.`);
        }
    } catch (error) {
        logger.error({ err: error }, "Failed to end live chat session");
    }
  });

  socket.on('disconnect', async () => {
    logger.info(`Socket disconnected: ${socket.id}`);
    
    if (adminSockets.has(socket.id)) {
        adminSockets.delete(socket.id);
    }

    try {
        const session = await LiveChatSession.findOneAndUpdate(
            { 
                status: { $in: ['waiting', 'active'] },
                $or: [{ userSocketId: socket.id }, { adminSocketId: socket.id }]
            },
            { status: 'closed' },
            { new: true }
        );

        if (session) {
            const sessionId = session._id.toString();
            const otherSocketId = session.userSocketId === socket.id ? session.adminSocketId : session.userSocketId;
            if (otherSocketId) {
                io.to(otherSocketId).emit('chatSessionEnded');
            }
            logger.info(`Session ${sessionId} closed due to disconnect of ${socket.id}.`);
            await emitQueueUpdate();
        }
    } catch (error) {
        logger.error({ err: error }, `Error during disconnect cleanup for socket ${socket.id}`);
    }
  });
});

// Serve frontend static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In dev, __dirname is '.../backend'. In prod, it's '.../backend/dist'.
// The frontend build is always in '.../' relative to the project root.
const frontendDistPath = path.resolve(__dirname, __dirname.endsWith('dist') ? '../../' : '../');

app.use(express.static(frontendDistPath));

// Serve files from Vercel's temporary /tmp directory
app.use('/uploads', express.static('/tmp/uploads'));


// Fallback for Single Page Application (SPA)
// FIX: Add explicit types to the route handler to ensure correct type inference for req and res.
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  // Avoid API routes from being served the index.html
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/uploads/')) {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  } else {
    next();
  }
});


// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  if (!MONGO_URI) {
    logger.error("FATAL: MONGO_URI is not defined in the environment variables.");
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Successfully connected to MongoDB.");
    httpServer.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    process.exit(1);
  }
};

startServer();

// Graceful Shutdown
process.on('unhandledRejection', (err: Error) => {
  logger.fatal({ err }, 'Unhandled Rejection! Shutting down...');
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err }, 'Uncaught Exception! Shutting down...');
  process.exit(1);
});