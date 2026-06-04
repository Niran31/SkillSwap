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
      } else {
        const { mockMessages } = await import('./mockDb.js');
        mockMessages.push(data);

        // Chatbot Auto-responder logic
        const parts = data.room.split('_');
        const peerId = parts.find(id => id !== data.author);
        if (peerId) {
          let peerName = 'David Chen';
          if (peerId === '2') peerName = 'Alex Johnson';
          else if (peerId === '3') peerName = 'Maria Garcia';
          else if (peerId === '4') peerName = 'Emily Chang';
          else if (peerId === '5') peerName = 'James Wilson';
          else if (peerId === '6') peerName = 'Sofia Martinez';

          const msgText = data.message.toLowerCase();
          let replyText = `Hi! Thanks for reaching out. I'd love to connect and talk about learning together. Let's schedule a session on my calendar!`;
          
          if (msgText.includes('react') || msgText.includes('hook') || msgText.includes('state')) {
            replyText = `Hey! I saw you asked about React. I specialize in React patterns, hooks, and state management. Let's set up a session soon!`;
          } else if (msgText.includes('python') || msgText.includes('structure') || msgText.includes('algorithm')) {
            replyText = `Hi there! Python is one of my favorite languages. I can definitely help you with data structures and time complexity. Check my availability!`;
          } else if (msgText.includes('hello') || msgText.includes('hi') || msgText.includes('hey')) {
            replyText = `Hello! Great to connect with you. What skills are you working on right now?`;
          } else if (msgText.includes('time') || msgText.includes('schedule') || msgText.includes('when')) {
            replyText = `I'm generally free on weekdays after 5 PM and on weekends. Go ahead and select a quick-book slot on my profile!`;
          }

          setTimeout(async () => {
            const now = new Date();
            const replyData = {
              room: data.room,
              author: peerId,
              authorName: peerName,
              message: replyText,
              time: now.getHours() + ":" + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes(),
            };
            
            mockMessages.push(replyData);
            io.to(data.room).emit('receive_message', replyData);

            const { mockNotifications } = await import('./mockDb.js');
            mockNotifications.push({
              id: 'notif-' + Math.random().toString(36).substring(2, 9),
              userId: data.author,
              type: 'message',
              title: `New Message from ${peerName}`,
              message: replyText.substring(0, 60) + '...',
              read: false,
              createdAt: new Date()
            });
          }, 1500);
        }
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
import notificationRoutes from './routes/notificationRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import orgRoutes from './routes/orgRoutes.js';
import studyCircleRoutes from './routes/studyCircleRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

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
app.use('/api/notifications', notificationRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/study-circles', studyCircleRoutes);
app.use('/api/analytics', analyticsRoutes);


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
