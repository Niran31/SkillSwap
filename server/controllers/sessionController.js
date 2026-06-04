import mongoose from 'mongoose';
import Session from '../models/Session.js';
import { processUserXp } from './gamificationController.js';
import { mockSessions } from '../mockDb.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const createSession = async (req, res) => {
  const { learnerId, learnerName, teacherId, teacherName, topic, date, time, duration } = req.body;

  if (!isDbConnected()) {
    const mockId = 'session-' + Math.random().toString(36).substring(2, 9);
    const session = { id: mockId, learnerId, learnerName, teacherId, teacherName, topic, date, time, duration, status: 'scheduled', createdAt: new Date() };
    mockSessions.push(session);
    return res.status(201).json({
      message: 'Session booked (Mock Mode)',
      session
    });
  }

  try {
    const session = new Session({ learnerId, learnerName, teacherId, teacherName, topic, date, time, duration });
    await session.save();
    res.status(201).json({ message: 'Session booked successfully', session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserSessions = async (req, res) => {
  const { userId } = req.params;

  if (!isDbConnected()) {
    const sessions = mockSessions.filter(s => s.learnerId === userId || s.teacherId === userId);
    return res.status(200).json({ sessions });
  }

  try {
    const sessions = await Session.find({
      $or: [{ learnerId: userId }, { teacherId: userId }],
      status: 'scheduled'
    }).sort({ createdAt: -1 });
    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSessionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isDbConnected()) {
    const session = mockSessions.find(s => s.id === id);
    if (session) {
      session.status = status;
      if (status === 'completed') {
        await processUserXp(session.learnerId, 50);
        await processUserXp(session.teacherId, 75);
      }
    }
    return res.status(200).json({ message: `Session ${status} (Mock Mode)`, session });
  }

  try {
    const session = await Session.findByIdAndUpdate(id, { status }, { new: true });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    // Award XP when completed!
    if (status === 'completed') {
      try {
        await processUserXp(session.learnerId, 50); // Student gets 50 XP
        await processUserXp(session.teacherId, 75); // Teacher gets 75 XP (teaching bonus)
      } catch (err) {
        console.error('Failed to process gamification XP:', err);
      }
    }
    
    res.status(200).json({ message: `Session ${status} successfully`, session });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
