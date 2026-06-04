import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { isDbConnected } from '../index.js';
import { mockOrganizations, mockUsers, mockCourses } from '../mockDb.js';

// Helper to generate a random 8-character invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Create a new organization
export const createOrganization = async (req, res) => {
  const { name, description } = req.body;
  const managerId = req.userId;

  const inviteCode = generateInviteCode();

  if (!isDbConnected()) {
    const managerUser = mockUsers.get(managerId);
    if (!managerUser) return res.status(404).json({ message: 'User not found' });

    const newOrg = {
      _id: 'org-' + Math.random().toString(36).substring(2, 9),
      name,
      description: description || 'Welcome to our Academy!',
      manager: managerId,
      inviteCode,
      teachers: [],
      students: []
    };

    mockOrganizations.push(newOrg);
    managerUser.academyId = newOrg._id;
    managerUser.role = 'management'; // force make sure they have role
    mockUsers.set(managerId, managerUser);

    return res.status(201).json({ 
      message: 'Academy created successfully (Mock Mode)', 
      organization: newOrg,
      user: managerUser
    });
  }

  try {
    const org = await Organization.create({
      name,
      description,
      manager: managerId,
      inviteCode,
      teachers: [],
      students: []
    });

    const user = await User.findById(managerId);
    if (user) {
      user.academyId = org._id;
      user.role = 'management';
      await user.save();
    }

    res.status(201).json({ 
      message: 'Academy created successfully', 
      organization: org,
      user
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Server error creating academy' });
  }
};

// Join organization using invite code
export const joinOrganization = async (req, res) => {
  const { inviteCode } = req.body;
  const userId = req.userId;

  if (!isDbConnected()) {
    const org = mockOrganizations.find(o => o.inviteCode === inviteCode.trim().toUpperCase());
    if (!org) return res.status(404).json({ message: 'Invalid invite code' });

    const user = mockUsers.get(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.academyId = org._id;
    
    // Add to org rosters based on role
    if (user.role === 'teacher') {
      if (!org.teachers.includes(userId)) org.teachers.push(userId);
    } else {
      // Default to student if joining via code
      user.role = 'student';
      if (!org.students.includes(userId)) org.students.push(userId);
    }

    mockUsers.set(userId, user);
    return res.status(200).json({ 
      message: `Successfully joined ${org.name} (Mock Mode)`, 
      organization: org,
      user 
    });
  }

  try {
    const org = await Organization.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!org) return res.status(404).json({ message: 'Invalid invite code' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.academyId = org._id;

    if (user.role === 'teacher') {
      if (!org.teachers.includes(userId)) {
        org.teachers.push(userId);
      }
    } else {
      user.role = 'student';
      if (!org.students.includes(userId)) {
        org.students.push(userId);
      }
    }

    await user.save();
    await org.save();

    res.status(200).json({ 
      message: `Successfully joined ${org.name}`, 
      organization: org,
      user 
    });
  } catch (error) {
    console.error('Error joining academy:', error);
    res.status(500).json({ message: 'Server error joining academy' });
  }
};

// Get organization details and dashboard stats
export const getOrgDashboard = async (req, res) => {
  const { orgId } = req.params;
  const managerId = req.userId;

  if (!isDbConnected()) {
    const org = mockOrganizations.find(o => o._id === orgId || o.id === orgId);
    if (!org) return res.status(404).json({ message: 'Academy not found' });
    if (org.manager !== managerId) return res.status(403).json({ message: 'Not authorized to view dashboard' });

    // Fetch lists
    const teachersList = Array.from(mockUsers.values()).filter(u => u.academyId === orgId && u.role === 'teacher');
    const studentsList = Array.from(mockUsers.values()).filter(u => u.academyId === orgId && u.role === 'student');
    const coursesList = mockCourses.filter(c => c.academy === orgId);

    // Compute stats
    let totalLessonsCompleted = 0;
    let quizSum = 0;
    let quizCount = 0;

    studentsList.forEach(student => {
      if (student.courseProgress) {
        student.courseProgress.forEach(progress => {
          totalLessonsCompleted += progress.completedLessons?.length || 0;
          if (progress.quizScores) {
            progress.quizScores.forEach(qs => {
              quizSum += qs.score;
              quizCount += 1;
            });
          }
        });
      }
    });

    const averageQuizScore = quizCount > 0 ? Math.round(quizSum / quizCount) : 85; // default fallback

    return res.status(200).json({
      organization: org,
      stats: {
        totalStudents: studentsList.length,
        totalTeachers: teachersList.length,
        activeCourses: coursesList.length,
        totalLessonCompletions: totalLessonsCompleted,
        averageQuizScore
      },
      teachers: teachersList,
      students: studentsList,
      courses: coursesList
    });
  }

  try {
    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: 'Academy not found' });
    if (org.manager.toString() !== managerId) return res.status(403).json({ message: 'Not authorized to view dashboard' });

    const teachersList = await User.find({ academyId: orgId, role: 'teacher' }).select('-password');
    const studentsList = await User.find({ academyId: orgId, role: 'student' }).select('-password');
    const coursesList = await Course.find({ academy: orgId });

    let totalLessonsCompleted = 0;
    let quizSum = 0;
    let quizCount = 0;

    studentsList.forEach(student => {
      if (student.courseProgress) {
        student.courseProgress.forEach(progress => {
          totalLessonsCompleted += progress.completedLessons?.length || 0;
          if (progress.quizScores) {
            progress.quizScores.forEach(qs => {
              quizSum += qs.score;
              quizCount += 1;
            });
          }
        });
      }
    });

    const averageQuizScore = quizCount > 0 ? Math.round(quizSum / quizCount) : 0;

    res.status(200).json({
      organization: org,
      stats: {
        totalStudents: studentsList.length,
        totalTeachers: teachersList.length,
        activeCourses: coursesList.length,
        totalLessonCompletions: totalLessonsCompleted,
        averageQuizScore
      },
      teachers: teachersList,
      students: studentsList,
      courses: coursesList
    });
  } catch (error) {
    console.error('Error fetching org dashboard:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard analytics' });
  }
};

// Check invite code
export const verifyInviteCode = async (req, res) => {
  const { code } = req.params;

  if (!isDbConnected()) {
    const org = mockOrganizations.find(o => o.inviteCode === code.trim().toUpperCase());
    if (!org) return res.status(404).json({ message: 'Academy not found with this invite code' });
    return res.status(200).json({ name: org.name, valid: true });
  }

  try {
    const org = await Organization.findOne({ inviteCode: code.trim().toUpperCase() });
    if (!org) return res.status(404).json({ message: 'Academy not found with this invite code' });
    res.status(200).json({ name: org.name, valid: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying invite code' });
  }
};
