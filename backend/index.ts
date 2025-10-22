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

  // --- MODIFIED Live Chat Logic ---
  socket.on('requestLiveChat', async ({ user, history }, callback) => {
    try {
        logger.info(`User ${user.name} requesting live chat.`);
        
        let session = await LiveChatSession.findOne({ 
            'user._id': user._id, 
            status: 'active',
            adminSocketId: { $exists: false } 
        });

        if (!session) {
             session = await LiveChatSession.create({
                user: { _id: user._id, name: user.name },
                userSocketId: socket.id,
                history,
                status: 'active', // Status is 'active' immediately
            });
        } else {
            session.userSocketId = socket.id;
            await session.save();
        }

        const sessionData = {
            id: session._id.toString(),
            user: session.user,
            history: session.history,
            adminSocketId: session.adminSocketId
        };

        socket.join(sessionData.id);

        if (callback && typeof callback === 'function') {
            callback(sessionData);
        }
        
    } catch (error) {
        logger.error({ err: error }, "Failed to handle live chat request");
    }
  });

  socket.on('adminJoinsChat', async (sessionId) => {
    try {
        const session = await LiveChatSession.findById(sessionId);

        if (!session || session.status !== 'active') {
            logger.warn(`Admin ${socket.id} tried to join a non-existent or inactive session ${sessionId}.`);
            socket.emit('chatSessionEnded');
            return;
        }

        if (session.adminSocketId) {
            logger.warn(`Admin ${socket.id} tried to join an already assigned session ${sessionId}.`);
            return;
        }

        session.adminSocketId = socket.id;
        
        const systemMessage = {
            id: `system-join-${Date.now()}`,
            sender: 'bot' as const,
            text: "An agent has joined the chat.",
            timestamp: new Date().toISOString()
        };
        session.history.push(systemMessage as any);

        await session.save();
        socket.join(sessionId);

        io.to(session.userSocketId).emit('liveChatMessage', systemMessage);

        const sessionDataForAdmin = {
            id: sessionId,
            user: session.user,
            history: session.history
        };
        
        io.to(socket.id).emit('chatSessionStarted', sessionDataForAdmin);
        
        logger.info(`Admin ${socket.id} joined chat with user ${session.userSocketId}. Session: ${sessionId}`);
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