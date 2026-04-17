import mongoose from 'mongoose';
import Session from '../models/Session.js';
import { processUserXp } from './gamificationController.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const createSession = async (req, res) => {
  const { learnerId, learnerName, teacherId, teacherName, topic, date, time, duration } = req.body;

  if (!isDbConnected()) {
    return res.status(201).json({
      message: 'Session booked (Mock Mode)',
      session: { learnerId, learnerName, teacherId, teacherName, topic, date, time, duration, status: 'scheduled', createdAt: new Date() }
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
    return res.status(200).json({
      sessions: [
        { id: '1', learnerId: userId, learnerName: 'You', teacherId: '2', teacherName: 'Alex Johnson', topic: 'Python Data Structures', date: 'Oct 15, 2025', time: '3:00 PM', duration: '60 min', status: 'scheduled' },
        { id: '2', learnerId: userId, learnerName: 'You', teacherId: '3', teacherName: 'Maria Garcia', topic: 'React Hooks in Depth', date: 'Oct 18, 2025', time: '5:30 PM', duration: '45 min', status: 'scheduled' }
      ]
    });
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
    return res.status(200).json({ message: `Session ${status} (Mock Mode)`, session: { id, status } });
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
