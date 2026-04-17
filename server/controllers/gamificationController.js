import mongoose from 'mongoose';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { isDbConnected } from '../index.js';

// Centralised logic to calculate Level based on XP
// Level 1 per 100 XP
const calculateLevel = (xp) => {
  return Math.floor(xp / 100) + 1;
};

// Centralised logic to determine if new badges are unlocked
const calculateBadges = (user) => {
  const newBadges = [...user.badges];
  if (user.level >= 5 && !newBadges.includes('Scholar')) newBadges.push('Scholar');
  if (user.level >= 10 && !newBadges.includes('Master')) newBadges.push('Master');
  // Helper badge is awarded via specific teaching actions
  return newBadges;
};

// Generic routine to add XP to a user
export const processUserXp = async (userId, xpAmount) => {
  if (!isDbConnected()) {
    console.log(`[MOCK GAMIFICATION] Adding ${xpAmount} XP to User ${userId}`);
    return null;
  }

  try {
    const user = await User.findById(userId);
    if (!user) return null;

    user.xp += xpAmount;
    user.level = calculateLevel(user.xp);
    user.badges = calculateBadges(user);

    await user.save();
    return user;
  } catch (error) {
    console.error('Error processing user XP:', error);
    return null;
  }
};

export const addXpEvent = async (req, res) => {
  const { userId, xpAmount, reason } = req.body;

  if (!isDbConnected()) {
    return res.status(200).json({ 
      message: `XP added for ${reason} (Mock Mode)`, 
      added: xpAmount 
    });
  }

  try {
    const user = await processUserXp(userId, xpAmount);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
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

export const getGamificationStats = async (req, res) => {
  const { id } = req.params;

  if (!isDbConnected()) {
    return res.status(200).json({
      xp: 250,
      level: 3,
      streak: 5,
      badges: ['Quick Learner', 'Helper']
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json({
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      badges: user.badges
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDashboardStats = async (req, res) => {
  const { id } = req.params;

  if (!isDbConnected()) {
    return res.status(200).json({
      activeSessionsCount: 3,
      weeklyLearningTime: 4.5,
      recommendedSkills: [
        { id: 1, title: 'Advanced Python Programming', category: 'Programming', difficulty: 'Intermediate', matchScore: 95, image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 2, title: 'Data Visualization with D3.js', category: 'Data Science', difficulty: 'Advanced', matchScore: 87, image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { id: 3, title: 'Introduction to Machine Learning', category: 'AI', difficulty: 'Beginner', matchScore: 82, image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600' }
      ],
      teachingOpportunities: [
        { id: 1, title: 'Web Development Basics', requests: 8, earnings: '$240', students: 12 },
        { id: 2, title: 'JavaScript Fundamentals', requests: 5, earnings: '$180', students: 7 },
        { id: 3, title: 'Responsive Design', requests: 3, earnings: '$90', students: 4 }
      ],
      teachingStats: { students: 23, rating: 4.8, earnings: '$510' }
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Calculate active sessions count
    const sessions = await Session.find({
      $or: [{ learnerId: id }, { teacherId: id }],
      status: { $in: ['scheduled', 'completed'] }
    });
    
    const activeSessionsCount = sessions.length;
    const weeklyLearningTime = activeSessionsCount * 1.5;

    // Derived Recommended Skills based on user strengths
    const recommendedSkills = user.strengths.map((str, index) => ({
      id: index + 1,
      title: `Advanced ${str}`,
      category: 'Specialization',
      difficulty: 'Intermediate',
      matchScore: 85 + (index * 2),
      image: index % 2 === 0 
        ? 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=600'
        : 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600'
    }));
    
    if (recommendedSkills.length === 0) {
      recommendedSkills.push({
        id: 1, title: 'Introduction to Web Dev', category: 'General', difficulty: 'Beginner', matchScore: 80, image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=600'
      });
    }

    const teachingSessionsCount = sessions.filter(s => s.teacherId === id).length;
    const teachingOpportunities = user.customSkills.map((skill, index) => ({
      id: index + 1,
      title: `Teach ${skill.name}`,
      requests: Math.floor(Math.random() * 10) + 1,
      earnings: `$${skill.level * 2}`,
      students: teachingSessionsCount
    }));

    if (teachingOpportunities.length === 0) {
      teachingOpportunities.push({
         id: 1, title: 'Basic Mentoring', requests: 1, earnings: '$50', students: teachingSessionsCount
      });
    }

    const teachingStats = {
      students: teachingSessionsCount * 2,
      rating: 4.8,
      earnings: `$${teachingSessionsCount * 45}`
    };

    res.status(200).json({
      activeSessionsCount,
      weeklyLearningTime,
      recommendedSkills,
      teachingOpportunities,
      teachingStats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
