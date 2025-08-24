import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Check } from 'lucide-react';

interface OnboardingQuizProps {
  onComplete: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  type: 'single' | 'multiple';
}

const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ onComplete }) => {
  const { completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string | string[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions: QuizQuestion[] = [
    {
      question: 'When learning something new, I prefer to:',
      options: [
        'Read detailed explanations and take notes',
        'Watch videos or demonstrations',
        'Practice hands-on and learn by doing',
        'Discuss and talk through concepts with others'
      ],
      type: 'single'
    },
    {
      question: 'Which subjects or skills do you feel most confident in?',
      options: [
        'Mathematics and logical reasoning',
        'Language, writing, and communication',
        'Visual arts and spatial awareness',
        'Music and sound recognition',
        'Physical activities and coordination',
        'Understanding people and social dynamics',
        'Self-reflection and personal growth'
      ],
      type: 'multiple'
    },
    {
      question: 'How do you prefer to solve problems?',
      options: [
        'Break them down step-by-step and analyze each component',
        'Visualize the problem and potential solutions',
        'Discuss with others to understand different perspectives',
        'Go with intuition and adapt as I progress'
      ],
      type: 'single'
    }
  ];

  const handleSingleSelect = (option: string) => {
    setAnswers({ ...answers, [currentStep]: option });
  };

  const handleMultipleSelect = (option: string) => {
    const currentSelections = (answers[currentStep] as string[]) || [];
    if (currentSelections.includes(option)) {
      setAnswers({
        ...answers,
        [currentStep]: currentSelections.filter(item => item !== option)
      });
    } else {
      setAnswers({
        ...answers,
        [currentStep]: [...currentSelections, option]
      });
    }
  };

  const isCurrentQuestionAnswered = () => {
    const answer = answers[currentStep];
    if (questions[currentStep].type === 'single') {
      return !!answer;
    } else {
      return Array.isArray(answer) && answer.length > 0;
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    // Process the answers to determine learning style and strengths
    const learningStyleMap: { [key: string]: string } = {
      'Read detailed explanations and take notes': 'Linguistic',
      'Watch videos or demonstrations': 'Visual',
      'Practice hands-on and learn by doing': 'Kinesthetic',
      'Discuss and talk through concepts with others': 'Interpersonal'
    };
    
    const learningStyle = learningStyleMap[answers[0] as string] || 'Visual';
    
    // Map strengths based on question 2
    let strengths: string[] = [];
    if (Array.isArray(answers[1])) {
      const strengthMap: { [key: string]: string } = {
        'Mathematics and logical reasoning': 'Logical-Mathematical',
        'Language, writing, and communication': 'Linguistic',
        'Visual arts and spatial awareness': 'Visual-Spatial',
        'Music and sound recognition': 'Musical',
        'Physical activities and coordination': 'Bodily-Kinesthetic',
        'Understanding people and social dynamics': 'Interpersonal',
        'Self-reflection and personal growth': 'Intrapersonal'
      };
      
      strengths = (answers[1] as string[]).map(ans => strengthMap[ans] || ans);
    }
    
    try {
      await completeOnboarding(learningStyle, strengths);
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const progressPercent = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-blue-600">
              Question {currentStep + 1} of {questions.length}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
          <div 
            style={{ width: `${progressPercent}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
          ></div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {currentQuestion.question}
        </h3>
        
        <div className="space-y-2">
          {currentQuestion.type === 'single' ? (
            // Single selection options
            currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSingleSelect(option)}
                className={`w-full py-3 px-4 text-left rounded-lg border transition-all ${
                  answers[currentStep] === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${
                    answers[currentStep] === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentStep] === option && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))
          ) : (
            // Multiple selection options
            currentQuestion.options.map((option, index) => {
              const isSelected = Array.isArray(answers[currentStep]) && 
                (answers[currentStep] as string[])?.includes(option);
              
              return (
                <button
                  key={index}
                  onClick={() => handleMultipleSelect(option)}
                  className={`w-full py-3 px-4 text-left rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded flex-shrink-0 mr-3 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border border-gray-300'
                    }`}>
                      {isSelected && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            currentStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          disabled={currentStep === 0}
        >
          Back
        </button>
        
        <button
          type="button"
          onClick={handleNext}
          disabled={!isCurrentQuestionAnswered() || isSubmitting}
          className={`px-4 py-2 rounded-lg transition flex items-center ${
            isCurrentQuestionAnswered()
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentStep < questions.length - 1 ? (
            <>
              Next
              <ArrowRight className="ml-1 w-4 h-4" />
            </>
          ) : isSubmitting ? (
            'Processing...'
          ) : (
            'Complete'
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingQuiz;