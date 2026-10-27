import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

let io: Server;

// Map to store connected users: userId -> socketId
export const connectedUsers = new Map<string, string>();

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust this in production
      methods: ['GET', 'POST']
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, env.jwtSecret) as any;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.id;
    console.log(`User connected via Socket.IO: ${userId}`);
    
    // Store user connection
    connectedUsers.set(userId, socket.id);

    // Join a room specific to this user for targeted notifications
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      connectedUsers.delete(userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const sendNotificationToUser = (userId: string, notificationData: any) => {
  if (io) {
    io.to(`user:${userId}`).emit('new_notification', notificationData);
  }
};
