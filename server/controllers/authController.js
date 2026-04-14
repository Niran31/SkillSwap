import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// Helper to check if DB is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!isDbConnected()) {
    // Graceful fallback to mock data
    return res.status(200).json({
      token: generateToken('mock-user-1'),
      user: {
        id: '1',
        name: 'Demo User',
        email,
        learningStyle: 'Visual',
        strengths: ['Logical-Mathematical'],
        xp: 250,
        level: 3,
        streak: 5,
        badges: ['Quick Learner', 'Helper']
      }
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update streak logic
    const now = new Date();
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    if (lastLogin) {
      const diffHours = (now - lastLogin) / (1000 * 60 * 60);
      if (diffHours >= 20 && diffHours <= 48) {
        user.streak += 1;
      } else if (diffHours > 48) {
        user.streak = 1;
      }
    }
    user.lastLogin = now;
    await user.save();

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        learningStyle: user.learningStyle,
        strengths: user.strengths,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const signup = async (req, res) => {
  const { name, email, password, learningStyle, strengths } = req.body;

  if (!isDbConnected()) {
    return res.status(201).json({
      token: generateToken('mock-' + Math.random().toString(36).substring(2, 9)),
      user: {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        learningStyle: learningStyle || 'Visual',
        strengths: strengths || [],
        xp: 0,
        level: 1,
        streak: 0,
        badges: ['Newcomer']
      }
    });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });
    
    const newUser = new User({ 
      name, 
      email, 
      password, // Will be auto-hashed by pre-save hook
      learningStyle: learningStyle || 'Visual',
      strengths: strengths || []
    });
    await newUser.save();
    
    res.status(201).json({
      token: generateToken(newUser._id),
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        learningStyle: newUser.learningStyle,
        strengths: newUser.strengths,
        xp: newUser.xp,
        level: newUser.level,
        streak: newUser.streak,
        badges: newUser.badges
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  const { id } = req.params;

  if (!isDbConnected()) {
    return res.status(200).json({
      user: {
        id,
        name: 'Demo User',
        email: 'demo@example.com',
        learningStyle: 'Visual',
        strengths: ['Logical-Mathematical'],
        xp: 250,
        level: 3,
        streak: 5,
        badges: ['Quick Learner', 'Helper']
      }
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        learningStyle: user.learningStyle,
        strengths: user.strengths,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addXp = async (req, res) => {
  const { userId, xpAmount } = req.body;
  
  if (!isDbConnected()) {
    return res.status(200).json({ message: 'XP added (Mock Mode)', added: xpAmount });
  }
  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.xp += xpAmount;
    
    // Level up calculation (every 100 XP is a level)
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
      if (user.level === 5 && !user.badges.includes('Scholar')) user.badges.push('Scholar');
      if (user.level === 10 && !user.badges.includes('Master')) user.badges.push('Master');
    }
    
    await user.save();
    
    res.status(200).json({
      message: 'XP Added successfully',
      user: {
        id: user._id,
        xp: user.xp,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
