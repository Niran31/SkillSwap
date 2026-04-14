import React, { useState } from 'react';
import { Check, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '../../types';

interface QuestionCardProps {
  question: Question;
  onCorrectAnswer?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onCorrectAnswer }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return; // Prevent changing answer after selection
    
    setSelectedOption(option);
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);
    
    if (correct && onCorrectAnswer) {
      onCorrectAnswer();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition bg-white"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900 mb-3">
          {question.id}. {question.question}
        </h3>
        <span className="text-xs font-medium bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
          {question.type === 'multiple-choice' ? 'Multiple Choice' : 
           question.type === 'true-false' ? 'True/False' : 'Open Ended'}
        </span>
      </div>
      
      {(question.type === 'multiple-choice' || question.type === 'true-false') && question.answerOptions && (
        <div className="space-y-2 mb-4">
          {question.answerOptions.map((option, idx) => {
            let borderClass = 'border-gray-200 hover:border-gray-300';
            let bgClass = '';
            let IconColor = 'text-transparent';
            
            if (selectedOption !== null) {
              if (option === question.correctAnswer) {
                borderClass = 'border-green-500';
                bgClass = 'bg-green-50';
                IconColor = 'text-green-500 bg-green-500 border-green-500';
              } else if (option === selectedOption) {
                borderClass = 'border-red-500';
                bgClass = 'bg-red-50';
                IconColor = 'text-red-500 bg-red-500 border-red-500';
              }
            } else {
              IconColor = 'border-gray-300';
            }

            return (
              <div 
                key={idx} 
                onClick={() => handleOptionClick(option)}
                className={`p-3 rounded-lg border ${borderClass} ${bgClass} transition cursor-pointer flex items-center`}
              >
                <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${IconColor}`}>
                  {selectedOption !== null && (option === question.correctAnswer || option === selectedOption) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span>{option}</span>
              </div>
            );
          })}
        </div>
      )}
      
      {question.type === 'open-ended' && (
        <div className="mb-4">
          <textarea 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Type your answer here..."
          ></textarea>
        </div>
      )}
      
      {question.explanation && (
        <div>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center transition"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
          </button>
          
          <AnimatePresence>
            {showExplanation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="p-3 bg-blue-50 text-sm text-gray-700 rounded-lg">
                  {question.explanation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default QuestionCard;
