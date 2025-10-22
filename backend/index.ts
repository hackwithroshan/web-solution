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

// --- Live Chat State (In-memory, reset on server restart) ---
interface LiveChatUser {
    socketId: string;
    user: { _id: string; name: string; };
    history: any[];
}
const waitingUsers: LiveChatUser[] = [];
const activeSessions: Record<string, { userSocketId: string; adminSocketId: string }> = {};
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

  // --- Live Chat Logic ---
  const emitQueueUpdate = () => {
      adminSockets.forEach(adminSocketId => {
          io.to(adminSocketId).emit('liveChatQueueUpdate', waitingUsers);
      });
  }

  socket.on('adminConnected', () => {
      logger.info(`Admin connected for live chat: ${socket.id}`);
      adminSockets.add(socket.id);
      emitQueueUpdate(); // Send initial queue state
  });

  socket.on('requestLiveChat', ({ user, history }) => {
      // Avoid duplicate requests
      if (!waitingUsers.some(u => u.user._id === user._id)) {
          logger.info(`User ${user.name} requesting live chat.`);
          waitingUsers.push({ socketId: socket.id, user, history });
          emitQueueUpdate();
      }
  });

  socket.on('adminAcceptsChat', (userSocketId) => {
      const userIndex = waitingUsers.findIndex(u => u.socketId === userSocketId);
      if (userIndex === -1 || !adminSockets.has(socket.id)) {
          return; // User no longer waiting or not a valid admin
      }

      const [userInfo] = waitingUsers.splice(userIndex, 1);
      const sessionId = `${socket.id}-${userSocketId}`;
      
      activeSessions[sessionId] = { userSocketId: userInfo.socketId, adminSocketId: socket.id };

      // Join both sockets to a room for this session
      socket.join(sessionId);
      io.sockets.sockets.get(userInfo.socketId)?.join(sessionId);

      // Notify both parties that the chat has started
      const sessionData = { id: sessionId, user: userInfo.user, history: userInfo.history };
      io.to(socket.id).emit('chatSessionStarted', sessionData); // To admin
      io.to(userInfo.socketId).emit('chatSessionStarted', sessionData); // To user

      logger.info(`Admin ${socket.id} accepted chat with user ${userInfo.socketId}. Session: ${sessionId}`);
      emitQueueUpdate(); // Update queue for other admins
  });

  socket.on('liveChatMessage', ({ sessionId, message }) => {
      const session = activeSessions[sessionId];
      if (session) {
          // Send message to the other person in the room/session
          socket.to(sessionId).emit('liveChatMessage', message);
      }
  });

  // Typing indicator events
  socket.on('startTyping', (sessionId) => {
    const session = activeSessions[sessionId];
    if (session) {
      socket.to(sessionId).emit('isTyping');
    }
  });

  socket.on('stopTyping', (sessionId) => {
    const session = activeSessions[sessionId];
    if (session) {
      socket.to(sessionId).emit('hasStoppedTyping');
    }
  });
  
  socket.on('endLiveChat', (sessionId) => {
      const session = activeSessions[sessionId];
      if (session) {
          io.to(sessionId).emit('chatSessionEnded');
          io.sockets.sockets.get(session.userSocketId)?.leave(sessionId);
          io.sockets.sockets.get(session.adminSocketId)?.leave(sessionId);
          delete activeSessions[sessionId];
          logger.info(`Session ${sessionId} ended.`);
      }
  });


  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
    
    // Live Chat Cleanup
    if (adminSockets.has(socket.id)) {
        adminSockets.delete(socket.id);
    } else {
        const userIndex = waitingUsers.findIndex(u => u.socketId === socket.id);
        if (userIndex !== -1) {
            waitingUsers.splice(userIndex, 1);
            emitQueueUpdate();
        }
    }
    // Also need to handle disconnections from active sessions...
    for (const sessionId in activeSessions) {
        const session = activeSessions[sessionId];
        if (session.userSocketId === socket.id || session.adminSocketId === socket.id) {
            io.to(sessionId).emit('hasStoppedTyping'); // Clear typing indicator for the other user
            io.to(sessionId).emit('chatSessionEnded'); // Notify other user
            delete activeSessions[sessionId];
             logger.info(`Session ${sessionId} ended due to disconnect.`);
        }
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