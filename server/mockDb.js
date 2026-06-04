// Stateful in-memory database for running the app in Mock Mode without MongoDB

export const mockUsers = new Map();
export const mockSessions = [];
export const mockReviews = [];
export const mockMessages = [];
export const mockSavedQuestions = [];
export const mockNotifications = [];
export const mockRoadmaps = [];
export const mockCourses = [];
export const mockOrganizations = [];
export const mockStudyCircles = [];


// Pre-initialize Springfield Academy (org-1)
mockOrganizations.push({
  _id: 'org-1',
  id: 'org-1',
  name: 'SkillSwap Academy',
  description: 'A futuristic tech academy focusing on AI and modern coding skills.',
  manager: 'manager-1',
  inviteCode: 'SKILL123',
  teachers: ['teacher-1'],
  students: ['1']
});

// Initialize with role-based Demo Users
// 1. Student User
mockUsers.set('1', {
  id: '1',
  name: 'Demo Student',
  email: 'demo@example.com',
  learningStyle: 'Visual',
  strengths: ['Logical-Mathematical'],
  xp: 250,
  level: 3,
  streak: 5,
  badges: ['Quick Learner', 'Helper'],
  bio: "I'm a student at SkillSwap Academy learning React!",
  customSkills: [
    { name: 'React Development', level: 60 },
    { name: 'JavaScript Basics', level: 80 }
  ],
  role: 'student',
  academyId: 'org-1',
  courseProgress: [
    {
      courseId: 'course-1',
      completedLessons: ['lesson-1-1'],
      quizScores: [{ quizId: '1', score: 100 }]
    }
  ]
});

// 2. Teacher User
mockUsers.set('teacher-1', {
  id: 'teacher-1',
  name: 'Sarah Wilson',
  email: 'teacher@example.com',
  learningStyle: 'Logical',
  strengths: ['Intrapersonal', 'Logical-Mathematical'],
  xp: 400,
  level: 5,
  streak: 12,
  badges: ['Mentor', 'Course Builder'],
  bio: "Senior React engineer and course instructor.",
  customSkills: [
    { name: 'React Architecture', level: 95 },
    { name: 'Node.js APIs', level: 90 }
  ],
  role: 'teacher',
  academyId: 'org-1',
  courseProgress: []
});

// 3. Management/Admin User
mockUsers.set('manager-1', {
  id: 'manager-1',
  name: 'Director Skinner',
  email: 'management@example.com',
  learningStyle: 'Auditory',
  strengths: ['Interpersonal'],
  xp: 100,
  level: 1,
  streak: 2,
  badges: ['Administrator'],
  bio: "Managing principal of SkillSwap Academy.",
  customSkills: [],
  role: 'management',
  academyId: 'org-1',
  courseProgress: []
});

// Pre-initialize Mock Peers for Cohorts / Matching
mockUsers.set('mock-david', {
  id: 'mock-david',
  name: 'David Chen',
  email: 'david.chen@example.com',
  learningStyle: 'Logical',
  strengths: ['Logical-Mathematical', 'Intrapersonal'],
  xp: 180,
  level: 2,
  streak: 4,
  badges: ['Code Ninja'],
  bio: "Passionate about algorithms, structured clean code, and database logic.",
  customSkills: [
    { name: 'JavaScript Basics', level: 90 },
    { name: 'Python Data Structures', level: 75 }
  ],
  role: 'student',
  academyId: 'org-1',
  courseProgress: []
});

mockUsers.set('mock-sofia', {
  id: 'mock-sofia',
  name: 'Sofia Martinez',
  email: 'sofia.martinez@example.com',
  learningStyle: 'Kinesthetic',
  strengths: ['Visual-Spatial', 'Bodily-Kinesthetic'],
  xp: 220,
  level: 3,
  streak: 8,
  badges: ['UX Guru'],
  bio: "Hands-on builder. I learn by building mock sandboxes, UI flows, and physical prototypes.",
  customSkills: [
    { name: 'React Development', level: 70 },
    { name: 'CSS & Styling', level: 85 }
  ],
  role: 'student',
  academyId: 'org-1',
  courseProgress: []
});

mockUsers.set('mock-sarah', {
  id: 'mock-sarah',
  name: 'Sarah Johnson',
  email: 'sarah.j@example.com',
  learningStyle: 'Visual',
  strengths: ['Visual-Spatial', 'Musical-Rhythmic'],
  xp: 150,
  level: 2,
  streak: 3,
  badges: ['Designer'],
  bio: "UI/UX designer transitioning to frontend. Visual flow diagrams help me learn best.",
  customSkills: [
    { name: 'React Development', level: 50 },
    { name: 'CSS & Styling', level: 90 }
  ],
  role: 'student',
  academyId: 'org-1',
  courseProgress: []
});

mockUsers.set('mock-alex', {
  id: 'mock-alex',
  name: 'Alex Garcia',
  email: 'alex.g@example.com',
  learningStyle: 'Auditory',
  strengths: ['Verbal-Linguistic', 'Interpersonal'],
  xp: 310,
  level: 4,
  streak: 15,
  badges: ['Speaker'],
  bio: "I learn best by talking through concepts, explaining problems to others, and listening to podcasts.",
  customSkills: [
    { name: 'React Development', level: 65 },
    { name: 'Node.js APIs', level: 60 }
  ],
  role: 'student',
  academyId: 'org-1',
  courseProgress: []
});


// Pre-initialize default Course
mockCourses.push({
  _id: 'course-1',
  id: 'course-1',
  title: 'React JS Fundamentals',
  description: 'Master component hierarchy, JSX, state, props, and standard React hooks.',
  instructor: 'teacher-1',
  instructorName: 'Sarah Wilson',
  academy: 'org-1',
  enrolledStudents: ['1'],
  category: 'Development',
  difficulty: 'Beginner',
  image: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=300',
  modules: [
    {
      title: 'Module 1: Introduction to Components',
      description: 'Learn the basic syntax and structure of React applications.',
      lessons: [
        {
          id: 'lesson-1-1',
          title: 'Understanding JSX & Elements',
          content: 'JSX stands for JavaScript XML. It is a syntax extension for JavaScript that allows writing HTML-like markup inside JavaScript files. JSX compiles down to native React.createElement() calls. In React, elements represent the smallest building blocks of a user interface, and they are immutable.',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          resources: ['Official React Documentation on JSX', 'Babel Compiler Sandbox'],
          quiz: [
            {
              id: 1,
              question: 'What does JSX compile down to in React?',
              type: 'multiple-choice',
              explanation: 'JSX compiles down to React.createElement() method calls, which create plain JavaScript objects.',
              answerOptions: ['React.createElement() calls', 'Plain HTML strings', 'Native DOM elements', 'Binary bytecode'],
              correctAnswer: 'React.createElement() calls'
            },
            {
              id: 2,
              question: 'React elements created with JSX are mutable.',
              type: 'true-false',
              explanation: 'React elements are immutable objects. Once created, their attributes or children cannot be directly changed.',
              answerOptions: ['True', 'False'],
              correctAnswer: 'False'
            }
          ]
        },
        {
          id: 'lesson-1-2',
          title: 'Functional Components & Props',
          content: 'Components are reusable, independent pieces of UI. Functional components are JavaScript functions that return JSX. They accept read-only arguments called "props" (properties) and return a React element that describes what should appear on the screen.',
          videoUrl: '',
          resources: ['MDN Guide on JavaScript Functions', 'React Props docs'],
          quiz: [
            {
              id: 3,
              question: 'Which of the following describes "props" correctly?',
              type: 'multiple-choice',
              explanation: 'Props are read-only inputs passed into a component by its parent, and they must never be modified by the component itself.',
              answerOptions: ['They can be modified inside the component', 'They are read-only inputs from parents', 'They are local states of the component', 'They represent global window variables'],
              correctAnswer: 'They are read-only inputs from parents'
            }
          ]
        }
      ]
    },
    {
      title: 'Module 2: State & Hooks',
      description: 'Manage dynamic UI values using the useState hook.',
      lessons: [
        {
          id: 'lesson-2-1',
          title: 'Managing State with useState',
          content: 'State is a built-in React object used to store data or information about the component. The useState hook is a function that returns a stateful value and a function to update it. Calling the update function triggers a component re-render.',
          videoUrl: '',
          resources: ['React Docs on useState hook'],
          quiz: [
            {
              id: 4,
              question: 'Calling a state updater function triggers what action?',
              type: 'multiple-choice',
              explanation: 'Updating state lets React know that the component needs to be re-rendered on the screen with the new values.',
              answerOptions: ['Component re-render', 'Browser refresh', 'Server database save', 'Garbage collection'],
              correctAnswer: 'Component re-render'
            }
          ]
        }
      ]
    }
  ],
  createdAt: new Date()
});

// Initialize with some mock sessions
mockSessions.push(
  { id: '1', learnerId: '1', learnerName: 'Demo Student', teacherId: 'teacher-1', teacherName: 'Sarah Wilson', topic: 'Python Data Structures', date: 'Oct 15, 2026', time: '3:00 PM', duration: '60 min', status: 'scheduled' },
  { id: '2', learnerId: '1', learnerName: 'Demo Student', teacherId: 'teacher-1', teacherName: 'Sarah Wilson', topic: 'React Hooks in Depth', date: 'Oct 18, 2026', time: '5:30 PM', duration: '45 min', status: 'scheduled' }
);

// Pre-populate mock messages so the messaging system works immediately
const room1_teacher = ['1', 'teacher-1'].sort().join('_');
mockMessages.push(
  { room: room1_teacher, author: 'teacher-1', authorName: 'Sarah Wilson', message: 'Hey! Looking forward to our React session. Have you completed Module 1 on JSX?', time: '10:15' },
  { room: room1_teacher, author: '1', authorName: 'Demo Student', message: 'Hi Sarah! Yes, I read Lesson 1 and completed the quiz. Im ready!', time: '10:18' }
);

// Pre-populate notifications
mockNotifications.push(
  { id: 'n1', userId: '1', type: 'session', title: 'Session Reminder', message: 'Your React session with Sarah Wilson starts in 1 hour!', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 'n2', userId: '1', type: 'achievement', title: 'Badge Earned! 🏆', message: 'You earned the "Quick Learner" badge for completing 5 sessions.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) }
);

// Pre-initialize mock study circle
mockStudyCircles.push({
  id: 'circle-1',
  _id: 'circle-1',
  name: 'React Titans Study Circle',
  topic: 'React Development',
  members: ['1', 'mock-david', 'mock-sofia'],
  milestones: [
    { id: 'm1', title: 'Build React component hierarchy', completedBy: ['mock-david'] },
    { id: 'm2', title: 'Complete Module 2 Quiz on hooks', completedBy: [] },
    { id: 'm3', title: 'Integrate custom useLocalStorage hook', completedBy: [] },
    { id: 'm4', title: 'Create custom fetch hook for APIs', completedBy: [] }
  ],
  chatRoomId: 'circle-1'
});

// Pre-initialize chat room messages for React Titans Circle
mockMessages.push(
  { room: 'circle-1', author: 'mock-david', authorName: 'David Chen', message: "Hey team! I completed the component hierarchy milestone yesterday. How are you guys doing with Module 2?", time: '14:20' },
  { room: 'circle-1', author: 'mock-sofia', authorName: 'Sofia Martinez', message: "Awesome David! I'm currently setting up a sandbox to experiment with custom hooks.", time: '14:22' }
);


export const initializeMockUserData = (userId, userName) => {
  const alreadyPopulated = mockSessions.some(s => s.learnerId === userId || s.teacherId === userId);
  if (alreadyPopulated) return;

  mockSessions.push(
    { id: 'session-' + Math.random().toString(36).substring(2, 9), learnerId: userId, learnerName: userName, teacherId: 'teacher-1', teacherName: 'Sarah Wilson', topic: 'React Fundamentals Review', date: 'Oct 15, 2026', time: '3:00 PM', duration: '60 min', status: 'scheduled' }
  );

  const roomUser_teacher = [userId, 'teacher-1'].sort().join('_');
  mockMessages.push(
    { room: roomUser_teacher, author: 'teacher-1', authorName: 'Sarah Wilson', message: `Welcome ${userName}! Im your instructor. Feel free to ask any questions about our React course.`, time: '12:00' }
  );

  mockNotifications.push(
    { id: 'notif-' + Math.random().toString(36).substring(2, 9), userId: userId, type: 'session', title: 'Welcome to Springfield!', message: 'You have been added to SkillSwap Academy. Access courses from your catalog!', read: false, createdAt: new Date() }
  );
};
