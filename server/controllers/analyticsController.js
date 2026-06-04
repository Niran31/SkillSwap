import { isDbConnected } from '../index.js';
import { mockUsers, mockCourses, mockSessions } from '../mockDb.js';

// Generate a realistic 7-day × 24-hour activity heatmap
const generateHeatmap = (userId) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmap = [];

  for (let d = 0; d < 7; d++) {
    const row = [];
    for (let h = 0; h < 24; h++) {
      // Simulate realistic patterns: more activity 8am-10pm, peaks 9-11am & 7-9pm
      let base = 0;
      if (h >= 8 && h <= 22) base = 1;
      if (h >= 9 && h <= 11) base = 2;
      if (h >= 19 && h <= 21) base = 3;
      if (d >= 5) base = Math.max(0, base - 1); // Less on weekends

      // Add user-specific randomness seeded by hash
      const seed = (userId.charCodeAt(0) || 65) + d * 7 + h;
      const noise = ((seed * 17 + 31) % 5);
      let intensity = Math.min(4, Math.max(0, base + (noise > 3 ? 1 : noise < 1 ? -1 : 0)));
      row.push(intensity);
    }
    heatmap.push({ day: days[d], hours: row });
  }
  return heatmap;
};

// Generate skill radar data from user's custom skills and strengths
const generateRadarData = (user) => {
  const defaultSkills = [
    { label: 'React', value: 45 },
    { label: 'JavaScript', value: 55 },
    { label: 'CSS & Design', value: 40 },
    { label: 'Node.js', value: 30 },
    { label: 'Python', value: 25 },
    { label: 'Algorithms', value: 35 }
  ];

  if (user.customSkills && user.customSkills.length > 0) {
    const radar = user.customSkills.map(s => ({
      label: s.name.length > 14 ? s.name.substring(0, 12) + '…' : s.name,
      value: s.level || 50
    }));
    // Pad to at least 5 axes
    while (radar.length < 5) {
      const extra = defaultSkills[radar.length] || { label: 'General', value: 30 };
      radar.push(extra);
    }
    return radar.slice(0, 6);
  }

  return defaultSkills;
};

// Generate XP sparkline (12-week history)
const generateSparkline = (currentXp) => {
  const points = [];
  let xp = Math.max(0, currentXp - 200);
  for (let i = 0; i < 12; i++) {
    points.push({ week: `W${i + 1}`, xp: Math.round(xp) });
    const growth = 10 + Math.floor(Math.random() * 25);
    xp += growth;
  }
  // Ensure last point matches current XP
  points[points.length - 1].xp = currentXp;
  return points;
};

// Generate course progress data
const generateCourseProgress = (user, courses) => {
  const enrolled = courses.filter(c =>
    c.enrolledStudents && c.enrolledStudents.includes(user.id)
  );

  return enrolled.map(course => {
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const progress = (user.courseProgress || []).find(cp => cp.courseId === course._id || cp.courseId === course.id);
    const completedLessons = progress ? progress.completedLessons.length : 0;
    const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const quizScores = progress ? progress.quizScores.map(qs => qs.score) : [];
    const quizAverage = quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : null;

    return {
      courseId: course._id || course.id,
      title: course.title,
      totalLessons,
      completedLessons,
      completionPercent,
      quizAverage,
      category: course.category || 'General'
    };
  });
};

// Generate streak calendar (last 30 days)
const generateStreakCalendar = (streak) => {
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const active = i < streak; // streak days are the most recent
    days.push({
      date: date.toISOString().split('T')[0],
      active
    });
  }
  return days;
};

// Teacher aggregated stats
const generateTeacherStats = (teacherId, courses, allUsers) => {
  const teacherCourses = courses.filter(c => c.instructor === teacherId);
  const totalStudents = new Set();
  let totalCompletions = 0;
  let totalQuizScores = [];

  teacherCourses.forEach(course => {
    (course.enrolledStudents || []).forEach(sid => {
      totalStudents.add(sid);
      const student = allUsers.get(sid);
      if (student && student.courseProgress) {
        const progress = student.courseProgress.find(cp => cp.courseId === (course._id || course.id));
        if (progress) {
          totalCompletions += progress.completedLessons.length;
          progress.quizScores.forEach(qs => totalQuizScores.push(qs.score));
        }
      }
    });
  });

  return {
    totalCourses: teacherCourses.length,
    totalStudents: totalStudents.size,
    totalCompletions,
    averageQuizScore: totalQuizScores.length > 0
      ? Math.round(totalQuizScores.reduce((a, b) => a + b, 0) / totalQuizScores.length)
      : 0,
    courseBreakdown: teacherCourses.map(c => ({
      title: c.title,
      enrolled: (c.enrolledStudents || []).length
    }))
  };
};

// Management academy-wide stats
const generateManagementStats = (academyId, courses, allUsers) => {
  const academyCourses = courses.filter(c => c.academy === academyId);
  const academyUsers = Array.from(allUsers.values()).filter(u => u.academyId === academyId);
  const students = academyUsers.filter(u => u.role === 'student');
  const teachers = academyUsers.filter(u => u.role === 'teacher');

  const totalXp = students.reduce((sum, s) => sum + (s.xp || 0), 0);
  const avgLevel = students.length > 0
    ? (students.reduce((sum, s) => sum + (s.level || 1), 0) / students.length).toFixed(1)
    : 0;

  return {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalCourses: academyCourses.length,
    totalXpAcademy: totalXp,
    averageLevel: avgLevel,
    topPerformers: students
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, 5)
      .map(s => ({ name: s.name, xp: s.xp, level: s.level }))
  };
};


export const getAnalytics = async (req, res) => {
  const { userId } = req.params;

  if (!isDbConnected()) {
    const user = mockUsers.get(userId) || mockUsers.get('1');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const baseAnalytics = {
      heatmap: generateHeatmap(userId),
      radar: generateRadarData(user),
      sparkline: generateSparkline(user.xp || 0),
      courseProgress: generateCourseProgress(user, mockCourses),
      streakCalendar: generateStreakCalendar(user.streak || 0),
      summary: {
        totalXp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 0,
        badges: user.badges || [],
        coursesEnrolled: mockCourses.filter(c =>
          c.enrolledStudents && c.enrolledStudents.includes(userId)
        ).length,
        lessonsCompleted: (user.courseProgress || []).reduce(
          (sum, cp) => sum + cp.completedLessons.length, 0
        ),
        quizAverage: (() => {
          const scores = (user.courseProgress || []).flatMap(cp =>
            cp.quizScores.map(qs => qs.score)
          );
          return scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;
        })()
      }
    };

    // Role-specific extras
    if (user.role === 'teacher') {
      baseAnalytics.teacherStats = generateTeacherStats(userId, mockCourses, mockUsers);
    }
    if (user.role === 'management' && user.academyId) {
      baseAnalytics.managementStats = generateManagementStats(user.academyId, mockCourses, mockUsers);
    }

    return res.status(200).json(baseAnalytics);
  }

  // Real DB path (simplified — mirrors mock logic with real queries)
  try {
    const User = (await import('../models/User.js')).default;
    const Course = (await import('../models/Course.js')).default;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const courses = await Course.find({});

    const baseAnalytics = {
      heatmap: generateHeatmap(userId),
      radar: generateRadarData(user),
      sparkline: generateSparkline(user.xp || 0),
      courseProgress: generateCourseProgress(
        { id: user._id.toString(), courseProgress: user.courseProgress || [] },
        courses
      ),
      streakCalendar: generateStreakCalendar(user.streak || 0),
      summary: {
        totalXp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 0,
        badges: user.badges || [],
        coursesEnrolled: courses.filter(c =>
          c.enrolledStudents && c.enrolledStudents.includes(userId)
        ).length,
        lessonsCompleted: (user.courseProgress || []).reduce(
          (sum, cp) => sum + cp.completedLessons.length, 0
        ),
        quizAverage: (() => {
          const scores = (user.courseProgress || []).flatMap(cp =>
            cp.quizScores.map(qs => qs.score)
          );
          return scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;
        })()
      }
    };

    return res.status(200).json(baseAnalytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};
