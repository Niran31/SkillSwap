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
