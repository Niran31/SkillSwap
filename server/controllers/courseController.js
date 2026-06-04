import Course from '../models/Course.js';
import User from '../models/User.js';
import { isDbConnected } from '../index.js';
import { mockCourses, mockUsers } from '../mockDb.js';
import { processUserXp } from './gamificationController.js';

// Create a new course
export const createCourse = async (req, res) => {
  const { title, description, category, difficulty, image, modules } = req.body;
  const instructor = req.userId; // injected by verifyToken

  if (!isDbConnected()) {
    const instructorUser = mockUsers.get(instructor);
    const newCourse = {
      _id: 'course-' + Math.random().toString(36).substring(2, 9),
      title,
      description,
      instructor,
      instructorName: instructorUser ? instructorUser.name : 'Unknown Instructor',
      academy: instructorUser ? instructorUser.academyId : null,
      enrolledStudents: [],
      modules: modules || [],
      category: category || 'General',
      difficulty: difficulty || 'Beginner',
      image: image || 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=300',
      createdAt: new Date()
    };
    mockCourses.push(newCourse);
    return res.status(201).json({ message: 'Course created successfully (Mock Mode)', course: newCourse });
  }

  try {
    const user = await User.findById(instructor);
    const course = await Course.create({
      title,
      description,
      instructor,
      academy: user ? user.academyId : null,
      modules: modules || [],
      category,
      difficulty,
      image
    });
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error creating course' });
  }
};

// Edit a course
export const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { title, description, category, difficulty, image, modules } = req.body;
  const instructor = req.userId;

  if (!isDbConnected()) {
    const course = mockCourses.find(c => c._id === courseId || c.id === courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor !== instructor) return res.status(403).json({ message: 'Not authorized' });

    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (difficulty) course.difficulty = difficulty;
    if (image) course.image = image;
    if (modules) course.modules = modules;

    return res.status(200).json({ message: 'Course updated (Mock Mode)', course });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== instructor) return res.status(403).json({ message: 'Not authorized' });

    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (difficulty) course.difficulty = difficulty;
    if (image) course.image = image;
    if (modules) course.modules = modules;

    await course.save();
    res.status(200).json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error updating course' });
  }
};

// Enroll a student in a course
export const enrollCourse = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.userId;

  if (!isDbConnected()) {
    const course = mockCourses.find(c => c._id === courseId || c.id === courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!course.enrolledStudents.includes(studentId)) {
      course.enrolledStudents.push(studentId);
    }

    const studentUser = mockUsers.get(studentId);
    if (studentUser) {
      if (!studentUser.courseProgress) studentUser.courseProgress = [];
      const hasProgress = studentUser.courseProgress.some(cp => cp.courseId === courseId);
      if (!hasProgress) {
        studentUser.courseProgress.push({
          courseId,
          completedLessons: [],
          quizScores: []
        });
        mockUsers.set(studentId, studentUser);
      }
    }
    return res.status(200).json({ message: 'Enrolled successfully (Mock Mode)', course });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!course.enrolledStudents.includes(studentId)) {
      course.enrolledStudents.push(studentId);
      await course.save();
    }

    const user = await User.findById(studentId);
    if (user) {
      const hasProgress = user.courseProgress.some(cp => cp.courseId.toString() === courseId);
      if (!hasProgress) {
        user.courseProgress.push({
          courseId,
          completedLessons: [],
          quizScores: []
        });
        await user.save();
      }
    }
    res.status(200).json({ message: 'Enrolled successfully', course });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server error enrolling in course' });
  }
};

// Complete a lesson
export const completeLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const studentId = req.userId;

  let xpAwarded = 10; // 10 XP for completing a lesson

  if (!isDbConnected()) {
    const studentUser = mockUsers.get(studentId);
    if (!studentUser) return res.status(404).json({ message: 'User not found' });

    if (!studentUser.courseProgress) studentUser.courseProgress = [];
    let progress = studentUser.courseProgress.find(cp => cp.courseId === courseId);
    if (!progress) {
      progress = { courseId, completedLessons: [], quizScores: [] };
      studentUser.courseProgress.push(progress);
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      studentUser.xp += xpAwarded;
      studentUser.level = Math.floor(studentUser.xp / 100) + 1;
      mockUsers.set(studentId, studentUser);
    }

    return res.status(200).json({ 
      message: 'Lesson completed (Mock Mode)', 
      xpAwarded, 
      user: studentUser 
    });
  }

  try {
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let progress = user.courseProgress.find(cp => cp.courseId.toString() === courseId);
    if (!progress) {
      progress = { courseId, completedLessons: [], quizScores: [] };
      user.courseProgress.push(progress);
    }

    let newlyCompleted = false;
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      newlyCompleted = true;
    }

    if (newlyCompleted) {
      await user.save();
      const updatedUser = await processUserXp(studentId, xpAwarded);
      return res.status(200).json({ message: 'Lesson completed successfully', xpAwarded, user: updatedUser });
    }

    res.status(200).json({ message: 'Lesson already completed', xpAwarded: 0, user });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ message: 'Server error completing lesson' });
  }
};

// Submit quiz score
export const submitQuizScore = async (req, res) => {
  const { courseId, quizId } = req.params;
  const { score } = req.body; // percentage, e.g. 100
  const studentId = req.userId;

  let xpAwarded = score >= 80 ? 30 : 10; // 30 XP for high score, 10 XP otherwise

  if (!isDbConnected()) {
    const studentUser = mockUsers.get(studentId);
    if (!studentUser) return res.status(404).json({ message: 'User not found' });

    if (!studentUser.courseProgress) studentUser.courseProgress = [];
    let progress = studentUser.courseProgress.find(cp => cp.courseId === courseId);
    if (!progress) {
      progress = { courseId, completedLessons: [], quizScores: [] };
      studentUser.courseProgress.push(progress);
    }

    const existingScore = progress.quizScores.find(qs => qs.quizId === quizId);
    if (existingScore) {
      if (score > existingScore.score) {
        existingScore.score = score;
      }
    } else {
      progress.quizScores.push({ quizId, score });
      studentUser.xp += xpAwarded;
      studentUser.level = Math.floor(studentUser.xp / 100) + 1;
    }
    mockUsers.set(studentId, studentUser);

    return res.status(200).json({ 
      message: 'Quiz submitted (Mock Mode)', 
      xpAwarded, 
      user: studentUser 
    });
  }

  try {
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let progress = user.courseProgress.find(cp => cp.courseId.toString() === courseId);
    if (!progress) {
      progress = { courseId, completedLessons: [], quizScores: [] };
      user.courseProgress.push(progress);
    }

    const existingScore = progress.quizScores.find(qs => qs.quizId === quizId);
    let newlySubmitted = false;
    if (existingScore) {
      if (score > existingScore.score) {
        existingScore.score = score;
        newlySubmitted = true;
      }
    } else {
      progress.quizScores.push({ quizId, score });
      newlySubmitted = true;
    }

    if (newlySubmitted) {
      await user.save();
      const updatedUser = await processUserXp(studentId, xpAwarded);
      return res.status(200).json({ message: 'Quiz score submitted', xpAwarded, user: updatedUser });
    }

    res.status(200).json({ message: 'Score not higher than previous', xpAwarded: 0, user });
  } catch (error) {
    console.error('Error submitting quiz score:', error);
    res.status(500).json({ message: 'Server error submitting quiz score' });
  }
};

// Get courses list
export const getCourses = async (req, res) => {
  const userId = req.userId;
  const { academyId, enrolled, instructor } = req.query;

  if (!isDbConnected()) {
    let courses = [...mockCourses];

    if (academyId) {
      courses = courses.filter(c => c.academy === academyId);
    }
    if (enrolled === 'true') {
      courses = courses.filter(c => c.enrolledStudents.includes(userId));
    }
    if (instructor === 'true') {
      courses = courses.filter(c => c.instructor === userId);
    }

    return res.status(200).json({ courses });
  }

  try {
    const filter = {};
    if (academyId) filter.academy = academyId;
    if (enrolled === 'true') filter.enrolledStudents = userId;
    if (instructor === 'true') filter.instructor = userId;

    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .populate('academy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
};
