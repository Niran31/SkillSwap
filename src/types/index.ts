export interface Peer {
  id: string;
  name: string;
  avatar: string;
  role: 'teacher' | 'learner';
  skills: string[];
  rating: number;
  reviews: number;
  distance: string;
  matchScore: number;
  location: string;
  hourlyRate?: number;
  availability?: string[];
  learningStyle?: string;
  strengths?: string[];
}

export interface Review {
  _id?: string;
  reviewer: string;
  reviewerName: string;
  reviewee: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface Session {
  id?: string;
  learnerId: string;
  learnerName: string;
  teacherId: string;
  teacherName: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export interface QuestionFormData {
  topic: string;
  difficulty: string;
  learningStyle: string;
  questionCount: number;
}

export interface Question {
  id: number;
  question: string;
  answerOptions?: string[];
  correctAnswer?: string;
  explanation?: string;
  type: 'multiple-choice' | 'open-ended' | 'true-false';
}

export interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  quizScores: { quizId: string; score: number }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  learningStyle?: string;
  strengths?: string[];
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  bio?: string;
  customSkills?: { name: string; level: number }[];
  role: 'student' | 'teacher' | 'management' | 'user';
  academyId?: string | null;
  courseProgress?: CourseProgress[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  resources?: string[];
  quiz?: Question[];
}

export interface CourseModule {
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  id?: string;
  title: string;
  description: string;
  instructor: string;
  instructorName?: string;
  academy?: string | null;
  academyName?: string;
  enrolledStudents?: string[];
  modules: CourseModule[];
  category?: string;
  difficulty?: string;
  image?: string;
  createdAt?: string;
}

export interface Organization {
  _id: string;
  id?: string;
  name: string;
  description: string;
  manager: string;
  inviteCode: string;
  teachers: string[];
  students: string[];
}

export interface StudyCircleMilestone {
  id: string;
  title: string;
  completedBy: string[];
}

export interface StudyCircle {
  _id: string;
  id?: string;
  name: string;
  topic: string;
  members: string[];
  milestones: StudyCircleMilestone[];
  chatRoomId: string;
  createdAt?: string;
  memberDetails?: { id: string; name: string; learningStyle: string }[];
}

