import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ override: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 5000;

// Socket.io messaging logic
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_room', (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on('send_message', async (data) => {
    socket.to(data.room).emit('receive_message', data);
    // Save to database
    try {
      if (isDbConnected()) {
        const Message = (await import('./models/Message.js')).default;
        await Message.create(data);
      }
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes import
import authRoutes from './routes/authRoutes.js';
import peerRoutes from './routes/peerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Setup Routes
app.use('/api/auth', authRoutes);
app.use('/api/peers', peerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/gamification', gamificationRoutes);

// Serve static frontend in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

let dbStatus = false;
export const isDbConnected = () => dbStatus;

// Mock DB connection if URI is placeholder or invalid
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri === 'your_mongodb_atlas_connection_string_here') {
      console.log('MongoDB URI is not set. Running in MOCK API mode.');
      return false;
    }
    
    await mongoose.connect(uri);
    console.log('MongoDB Connected Successfully');
    dbStatus = true;
    return true;
  } catch (err) {
    console.error('MongoDB Connection Error: ', err.message);
    return false;
  }
};

// Start Server
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});
