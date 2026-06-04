import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3,
  Check,
  Download,
  Share2,
  Bookmark,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Question, QuestionFormData } from '../types';
import QuestionForm from '../components/generator/QuestionForm';
import QuestionCard from '../components/generator/QuestionCard';

const QuestionGenerator: React.FC = () => {
  const { user, setUser, isAuthenticated } = useAuth();
  const [currentTopic, setCurrentTopic] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<number[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  
  const questionsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (generatedQuestions && generatedQuestions.length > 0) {
      setTimeout(() => {
        questionsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [generatedQuestions]);

  const handleSubmit = (data: QuestionFormData) => {
    setIsGenerating(true);
    setCurrentTopic(data.topic);
    setIsSaved(false);
    
    // API call to the backend
    axios.post('/api/ai/generate', data)
      .then(response => {
        setGeneratedQuestions(response.data.questions);
        setAnsweredCorrectly([]); // Reset answered questions for new batch
        setIsGenerating(false);
        toast.success('Successfully generated questions!');
      })
      .catch(error => {
        console.error("Error generating questions:", error);
        toast.error('Failed to generate questions.');
        setIsGenerating(false);
      });
  };

  const handleCorrectAnswer = async (questionId: number) => {
    if (answeredCorrectly.includes(questionId)) return;
    setAnsweredCorrectly(prev => [...prev, questionId]);

    try {
      const response = await axios.post('/api/gamification/add-xp', {
        userId: user?.id,
        xpAmount: 10,
        reason: 'AI Question Answered'
      });
      toast.success('Correct! +10 XP awarded to your profile.');
      localStorage.setItem('skillswap_completed_question', 'true');
      
      // Update local storage and AuthContext state
      if (user) {
        let updatedUser;
        if (response.data.user) {
          updatedUser = {
            ...user,
            xp: response.data.user.xp,
            level: response.data.user.level,
            badges: response.data.user.badges
          };
        } else {
          updatedUser = { ...user, xp: user.xp + 10 };
        }
        setUser(updatedUser);
        localStorage.setItem('skillswap_user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error('Failed to add XP', e);
    }
  };

  const handleSaveAll = async () => {
    if (!generatedQuestions || !user || isSaved) return;
    try {
      for (const question of generatedQuestions) {
        await axios.post('/api/ai/save', {
          userId: user.id,
          topic: currentTopic,
          questionText: question.question,
          options: question.answerOptions,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: 'Intermediate'
        });
      }
      setIsSaved(true);
      toast.success('Questions bookmarked successfully!');
    } catch (e) {
      console.error('Failed to save questions', e);
      toast.error('Failed to bookmark questions.');
    }
  };

  const handleDownload = () => {
    if (!generatedQuestions) return;
    const fileData = JSON.stringify(generatedQuestions, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${currentTopic.toLowerCase().replace(/\s+/g, "_")}_questions.json`;
    link.href = url;
    link.click();
    toast.success('Questions downloaded as JSON!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `SkillSwap AI Questions - ${currentTopic}`,
        text: `Check out these learning questions about ${currentTopic} on SkillSwap!`,
        url: window.location.href,
      }).then(() => {
        toast.success('Shared successfully!');
      }).catch(err => {
        console.log('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Question Generator</h1>
          <p className="text-gray-600 mb-8">
            You need to be logged in to use the AI Question Generator. Please sign in or create an account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">AI Question Generator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Generate personalized questions based on your learning style and preferences. 
            Our AI crafts questions that match how you learn best.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-10">
          <div className="flex flex-col md:flex-row">
            {/* Modularized Form */}
            <QuestionForm 
              initialLearningStyle={user?.learningStyle || 'Visual'}
              isGenerating={isGenerating}
              onSubmit={handleSubmit}
            />
            
            {/* Information Section */}
            <div className="bg-blue-50 p-6 md:p-8 md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Learning Style Insights
              </h2>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Your Learning Profile</h3>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">{user?.learningStyle || 'Visual'} Learner</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Strengths: {user?.strengths?.join(', ') || 'Logical-Mathematical'}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Questions will be tailored to match your learning preferences.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Did You Know?</h3>
                  <p className="text-sm text-gray-600">
                    Questions tailored to your learning style can improve retention by up to 40% compared 
                    to generic questions.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Tips for Effective Learning</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                      <span>Review generated questions multiple times</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                      <span>Explain answers in your own words</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                      <span>Connect new knowledge to existing concepts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Generated Questions Section */}
        <AnimatePresence>
          {generatedQuestions && (
            <motion.div 
              ref={questionsSectionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                  Generated Questions: {currentTopic}
                </h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleDownload}
                    title="Download Questions"
                    className="p-2 text-gray-500 hover:text-blue-600 transition"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleShare}
                    title="Share Questions"
                    className="p-2 text-gray-500 hover:text-blue-600 transition"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSaveAll}
                    disabled={isSaved}
                    title="Bookmark Questions"
                    className={`p-2 transition ${isSaved ? 'text-green-600 cursor-default' : 'text-gray-500 hover:text-blue-600'}`}
                  >
                    <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {generatedQuestions.map((question, index) => (
                  <QuestionCard 
                    key={index} 
                    question={question}
                    onCorrectAnswer={() => handleCorrectAnswer(question.id || index)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestionGenerator;