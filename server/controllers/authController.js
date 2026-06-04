import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { processUserXp } from './gamificationController.js';
import { mockUsers, initializeMockUserData } from '../mockDb.js';

// Helper to check if DB is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!isDbConnected()) {
    let foundUser = Array.from(mockUsers.values()).find(u => u.email === email);
    if (!foundUser) {
      if (email === 'demo@example.com') {
        foundUser = mockUsers.get('1');
      } else if (email === 'teacher@example.com') {
        foundUser = mockUsers.get('teacher-1');
      } else if (email === 'management@example.com') {
        foundUser = mockUsers.get('manager-1');
      } else {
        const mockId = 'mock-' + Math.random().toString(36).substring(2, 9);
        foundUser = {
          id: mockId,
          name: email.split('@')[0],
          email,
          learningStyle: 'Visual',
          strengths: ['Logical-Mathematical'],
          xp: 250,
          level: 3,
          streak: 5,
          badges: ['Quick Learner', 'Helper'],
          bio: "I'm a passionate learner on SkillSwap!",
          customSkills: [],
          role: 'user',
          academyId: null,
          courseProgress: []
        };
        mockUsers.set(mockId, foundUser);
      }
    }
    initializeMockUserData(foundUser.id, foundUser.name);
    return res.status(200).json({
      token: generateToken(foundUser.id),
      user: foundUser
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
        badges: user.badges,
        role: user.role,
        academyId: user.academyId,
        courseProgress: user.courseProgress
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const signup = async (req, res) => {
  const { name, email, password, learningStyle, strengths, role, inviteCode, academyName } = req.body;

  if (!isDbConnected()) {
    const mockId = 'mock-' + Math.random().toString(36).substring(2, 9);
    const mockUser = {
      id: mockId,
      name,
      email,
      learningStyle: learningStyle || 'Visual',
      strengths: strengths || [],
      xp: 0,
      level: 1,
      streak: 0,
      badges: ['Newcomer'],
      bio: "I'm a passionate learner on SkillSwap!",
      customSkills: [],
      role: role || 'user',
      academyId: null,
      courseProgress: []
    };

    // If signing up as Management and creating an academy
    if (mockUser.role === 'management' && academyName) {
      const { mockOrganizations } = await import('../mockDb.js');
      const newOrg = {
        _id: 'org-' + Math.random().toString(36).substring(2, 9),
        id: 'org-' + Math.random().toString(36).substring(2, 9),
        name: academyName,
        description: `Welcome to ${academyName}!`,
        manager: mockId,
        inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        teachers: [],
        students: []
      };
      mockOrganizations.push(newOrg);
      mockUser.academyId = newOrg._id;
    }

    // If joining an academy via invite code
    if (inviteCode && (mockUser.role === 'student' || mockUser.role === 'teacher')) {
      const { mockOrganizations } = await import('../mockDb.js');
      const org = mockOrganizations.find(o => o.inviteCode === inviteCode.trim().toUpperCase());
      if (org) {
        mockUser.academyId = org._id;
        if (mockUser.role === 'teacher') {
          org.teachers.push(mockId);
        } else {
          org.students.push(mockId);
        }
      }
    }

    mockUsers.set(mockId, mockUser);
    initializeMockUserData(mockId, name);
    return res.status(201).json({
      token: generateToken(mockId),
      user: mockUser
    });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });
    
    const userRole = role || 'user';
    let academyId = null;

    const newUser = new User({ 
      name, 
      email, 
      password, // Will be auto-hashed by pre-save hook
      learningStyle: learningStyle || 'Visual',
      strengths: strengths || [],
      role: userRole
    });

    if (userRole === 'management' && academyName) {
      const Organization = (await import('../models/Organization.js')).default;
      const orgCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const org = await Organization.create({
        name: academyName,
        description: `Welcome to ${academyName}!`,
        manager: newUser._id,
        inviteCode: orgCode,
        teachers: [],
        students: []
      });
      newUser.academyId = org._id;
    }

    if (inviteCode && (userRole === 'student' || userRole === 'teacher')) {
      const Organization = (await import('../models/Organization.js')).default;
      const org = await Organization.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
      if (org) {
        newUser.academyId = org._id;
        if (userRole === 'teacher') {
          org.teachers.push(newUser._id);
        } else {
          org.students.push(newUser._id);
        }
        await org.save();
      }
    }

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
        badges: newUser.badges,
        role: newUser.role,
        academyId: newUser.academyId,
        courseProgress: newUser.courseProgress
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
    const user = mockUsers.get(id) || mockUsers.get('1');
    return res.status(200).json({ user });
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
        badges: user.badges,
        role: user.role,
        academyId: user.academyId,
        courseProgress: user.courseProgress
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { bio, customSkills, learningStyle, strengths } = req.body;

  if (!isDbConnected()) {
    const user = mockUsers.get(id) || mockUsers.get('1');
    if (bio !== undefined) user.bio = bio;
    if (customSkills !== undefined) user.customSkills = customSkills;
    if (learningStyle !== undefined) user.learningStyle = learningStyle;
    if (strengths !== undefined) user.strengths = strengths;
    
    user.xp += 10;
    user.level = Math.floor(user.xp / 100) + 1;
    if (user.level >= 5 && !user.badges.includes('Scholar')) user.badges.push('Scholar');
    if (user.level >= 10 && !user.badges.includes('Master')) user.badges.push('Master');
    
    mockUsers.set(user.id, user);
    return res.status(200).json({ message: 'Profile updated (Mock Mode)', user });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (bio !== undefined) user.bio = bio;
    if (customSkills !== undefined) user.customSkills = customSkills;
    if (learningStyle !== undefined) user.learningStyle = learningStyle;
    if (strengths !== undefined) user.strengths = strengths;

    await user.save();
    
    // Process +10 XP for updating the profile
    await processUserXp(user._id, 10);
    
    // Reload user to retrieve updated gamification stats
    const updatedUser = await User.findById(id);

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        learningStyle: updatedUser.learningStyle,
        strengths: updatedUser.strengths,
        xp: updatedUser.xp,
        level: updatedUser.level,
        streak: updatedUser.streak,
        badges: updatedUser.badges,
        bio: updatedUser.bio,
        customSkills: updatedUser.customSkills,
        role: updatedUser.role,
        academyId: updatedUser.academyId,
        courseProgress: updatedUser.courseProgress
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
