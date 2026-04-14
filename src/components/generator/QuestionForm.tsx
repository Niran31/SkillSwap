import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Brain, Lightbulb } from 'lucide-react';
import { QuestionFormData } from '../../types';

// Define the Zod schema for form validation
const formSchema = z.object({
  topic: z.string().min(2, 'Topic must be at least 2 characters').max(100, 'Topic is too long'),
  difficulty: z.string(),
  learningStyle: z.string(),
  questionCount: z.number().min(1, 'Must generate at least 1 question').max(15, 'Cannot exceed 15 questions')
});

interface QuestionFormProps {
  initialLearningStyle: string;
  isGenerating: boolean;
  onSubmit: (data: QuestionFormData) => void;
}

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const learningStyleOptions = [
  { value: 'Visual', label: 'Visual - Learn through seeing' },
  { value: 'Auditory', label: 'Auditory - Learn through hearing' },
  { value: 'Kinesthetic', label: 'Kinesthetic - Learn through doing' },
  { value: 'Reading/Writing', label: 'Reading/Writing - Learn through text' },
  { value: 'Logical', label: 'Logical - Learn through reasoning' }
];

const QuestionForm: React.FC<QuestionFormProps> = ({ initialLearningStyle, isGenerating, onSubmit }) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<QuestionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      difficulty: 'intermediate',
      learningStyle: initialLearningStyle,
      questionCount: 5
    }
  });

  return (
    <div className="p-6 md:p-8 md:w-1/2">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Brain className="w-5 h-5 mr-2 text-blue-600" />
        Customize Your Questions
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Topic or Subject*
            </label>
            <input
              type="text"
              id="topic"
              {...register('topic')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.topic ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., JavaScript Fundamentals, React Hooks"
            />
            {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic.message}</p>}
          </div>
          
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              {...register('difficulty')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700 mb-1">
              Learning Style
            </label>
            <select
              id="learningStyle"
              {...register('learningStyle')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {learningStyleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Questions
            </label>
            <input
              type="number"
              id="questionCount"
              {...register('questionCount', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.questionCount ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.questionCount && <p className="text-red-500 text-xs mt-1">{errors.questionCount.message}</p>}
          </div>
          
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Questions...
              </>
            ) : (
              <>
                <Lightbulb className="w-5 h-5 mr-2" />
                Generate Questions
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
