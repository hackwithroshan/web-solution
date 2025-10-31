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
import { adminPageRouter, publicPageRouter } from './routes/pages.js';
import { adminBlogRouter, publicBlogRouter } from './routes/blog.js';
import feedbackRoutes from './routes/feedback.js';
import consultationRoutes from './routes/consultations.js';


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
// FIX: Add explicit types to middleware to fix overload error.
app.use(express.json() as (req: Request, res: Response, next: NextFunction) => void);

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
app.use('/api/admin/pages', adminPageRouter);
app.use('/api/pages', publicPageRouter);
app.use('/api/admin/blog', adminBlogRouter);
app.use('/api/blog', publicBlogRouter);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/consultations', consultationRoutes);


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

  // --- Live Chat Logic ---
  socket.on('adminJoinSupport', () => {
    socket.join('admin_support_room');
    logger.info(`Socket ${socket.id} joined admin support room.`);
  });

  socket.on('requestLiveChat', async ({ user, history }, callback) => {
    try {
        logger.info(`User ${user.name} requesting live chat.`);
        
        // Find an existing session for this user that is still waiting for an admin
        let session = await LiveChatSession.findOne({ 
            'user._id': user._id, 
            status: 'waiting',
        });

        if (!session) {
             // If no waiting session, create a new one. Status will default to 'waiting'.
             session = await LiveChatSession.create({
                user: { _id: user._id, name: user.name },
                userSocketId: socket.id,
                history,
            });
        } else {
            // If a waiting session exists, just update the socket ID for the reconnecting user
            session.userSocketId = socket.id;
            await session.save();
        }

        const sessionData = {
            id: session._id.toString(),
            user: session.user,
            history: session.history,
            adminSocketId: session.adminSocketId,
            createdAt: session.createdAt,
        };

        socket.join(sessionData.id);

        // Notify admins about the new/updated waiting chat request
        io.to('admin_support_room').emit('newLiveChatRequest', { ...sessionData, _id: sessionData.id });

        if (callback && typeof callback === 'function') {
            callback(sessionData);
        }
        
    } catch (error) {
        logger.error({ err: error }, "Failed to handle live chat request");
    }
  });

  socket.on('adminJoinsChat', async ({ sessionId, adminUser }) => {
    try {
        const session = await LiveChatSession.findById(sessionId);

        // Admin should only join a session that is currently 'waiting'
        if (!session || session.status !== 'waiting') {
            logger.warn(`Admin ${socket.id} tried to join a non-existent or non-waiting session ${sessionId}.`);
            // Maybe the user disconnected or another admin joined. Inform this admin.
            socket.emit('chatSessionEnded'); 
            return;
        }

        if (session.adminSocketId) {
            logger.warn(`Admin ${socket.id} tried to join an already assigned session ${sessionId}.`);
            return; // Maybe emit an error message to this admin
        }

        // Update session: assign admin and change status to 'active'
        session.adminSocketId = socket.id;
        session.status = 'active';
        
        const agentName = adminUser && adminUser.role === 'admin' ? 'Roshan pandey' : adminUser?.name || 'a support agent';

        const systemMessage = {
            id: `system-join-${Date.now()}`,
            sender: 'bot' as const,
            text: `Hi! You are now connected with ${agentName}.`,
            timestamp: new Date().toISOString()
        };
        session.history.push(systemMessage as any);

        await session.save();
        socket.join(sessionId);

        // Notify user that an agent has joined
        io.to(session.userSocketId).emit('liveChatMessage', systemMessage);
        
        const adminSystemMessage = {
            ...systemMessage,
            text: `You have joined the chat with ${session.user.name}. The user's previous chat history is below.`
        };

        const sessionDataForAdmin = {
            id: sessionId,
            user: session.user,
            history: [...session.history.slice(0, -1), adminSystemMessage]
        };
        
        // Send the full session data to the joining admin
        io.to(socket.id).emit('chatSessionStarted', sessionDataForAdmin);
        // Notify all other admins that this chat is now taken
        io.to('admin_support_room').emit('chatSessionTaken', { sessionId, adminName: agentName });
        
        logger.info(`Admin ${adminUser?.name} (${socket.id}) joined chat with user ${session.userSocketId}. Session: ${sessionId}`);
    } catch (error) {
        logger.error({ err: error }, "Failed to handle admin joining chat");
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
            io.to('admin_support_room').emit('chatSessionClosed', sessionId);
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
    
    try {
        const session = await LiveChatSession.findOne({ 
            status: 'active',
            $or: [{ userSocketId: socket.id }, { adminSocketId: socket.id }]
        });

        if (session) {
            const isUser = session.userSocketId === socket.id;

            const systemMessage = {
                id: `system-disconnect-${Date.now()}`,
                sender: 'bot' as const,
                text: `${isUser ? 'The user' : 'The agent'} has disconnected. The chat has ended.`,
                timestamp: new Date().toISOString()
            };

            session.status = 'closed';
            session.history.push(systemMessage as any);
            await session.save();

            const otherSocketId = isUser ? session.adminSocketId : session.userSocketId;
            if (otherSocketId) {
                 io.to(otherSocketId).emit('liveChatMessage', systemMessage);
                 io.to(otherSocketId).emit('chatSessionEnded');
            }
            io.to('admin_support_room').emit('chatSessionClosed', session._id.toString());
            logger.info(`Session ${session._id} closed due to disconnect of ${socket.id}.`);
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

// FIX: Add explicit types to middleware to fix overload error.
app.use(express.static(frontendDistPath) as (req: Request, res: Response, next: NextFunction) => void);

// Serve files from Vercel's temporary /tmp directory
// FIX: Add explicit types to middleware to fix overload error.
app.use('/uploads', express.static('/tmp/uploads') as (req: Request, res: Response, next: NextFunction) => void);


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