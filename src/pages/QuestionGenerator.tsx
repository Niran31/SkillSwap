import React, { useState } from 'react';
import { 
  Brain, 
  Lightbulb, 
  BarChart3,
  Check,
  Download,
  Share2,
  Bookmark,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface QuestionFormData {
  topic: string;
  difficulty: string;
  learningStyle: string;
  questionCount: number;
}

interface Question {
  id: number;
  question: string;
  answerOptions?: string[];
  correctAnswer?: string;
  explanation?: string;
  type: 'multiple-choice' | 'open-ended' | 'true-false';
}

const QuestionGenerator: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<QuestionFormData>({
    topic: '',
    difficulty: 'intermediate',
    learningStyle: user?.learningStyle || 'Visual',
    questionCount: 5
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExplanation, setShowExplanation] = useState<{ [key: number]: boolean }>({});

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'questionCount' ? parseInt(value) : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic) {
      alert('Please enter a topic');
      return;
    }
    
    generateQuestions();
  };

  const generateQuestions = () => {
    setIsGenerating(true);
    
    // For demo purposes, we'll simulate an API call with a timeout
    setTimeout(() => {
      // Generate mock questions based on the form data
      const mockQuestions = generateMockQuestions();
      setGeneratedQuestions(mockQuestions);
      setIsGenerating(false);
    }, 2000);
  };

  const generateMockQuestions = (): Question[] => {
    // This is where you would normally call an AI API to generate questions
    // For now, we'll create mock questions based on the topic
    const questions: Question[] = [];
    const topicLowerCase = formData.topic.toLowerCase();
    
    if (topicLowerCase.includes('javascript') || topicLowerCase.includes('programming')) {
      questions.push({
        id: 1,
        question: 'Which of the following is NOT a JavaScript data type?',
        answerOptions: ['String', 'Boolean', 'Float', 'Symbol'],
        correctAnswer: 'Float',
        explanation: 'JavaScript has primitive data types: String, Number, BigInt, Boolean, Symbol, Undefined, and Null. Float is not a distinct data type in JavaScript; floating-point numbers are part of the Number type.',
        type: 'multiple-choice'
      });
      questions.push({
        id: 2,
        question: 'What is the output of: console.log(typeof [])?',
        answerOptions: ['array', 'object', 'undefined', 'null'],
        correctAnswer: 'object',
        explanation: 'In JavaScript, arrays are a type of object. When you use typeof on an array, it returns "object".',
        type: 'multiple-choice'
      });
      questions.push({
        id: 3,
        question: 'Explain the concept of closures in JavaScript and provide an example.',
        type: 'open-ended',
        explanation: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). In JavaScript, closures are created every time a function is created. Closures allow a function to access variables from an outer function even after the outer function has returned.'
      });
    } else if (topicLowerCase.includes('react') || topicLowerCase.includes('frontend')) {
      questions.push({
        id: 1,
        question: 'Which hook would you use to run code once when a component mounts?',
        answerOptions: ['useEffect with empty dependency array', 'useState', 'useReducer', 'useRef'],
        correctAnswer: 'useEffect with empty dependency array',
        explanation: 'useEffect with an empty dependency array ([]) runs once after the initial render (component mount), similar to componentDidMount in class components.',
        type: 'multiple-choice'
      });
      questions.push({
        id: 2,
        question: 'What is the purpose of keys in React lists?',
        answerOptions: [
          'To make the list look better visually',
          'To help React identify which items have changed, added, or removed',
          'To automatically sort the list items',
          'Keys are optional and have no real purpose'
        ],
        correctAnswer: 'To help React identify which items have changed, added, or removed',
        explanation: 'Keys help React identify which items in a list have changed, been added, or been removed. They should be given to elements inside the array to give them a stable identity.',
        type: 'multiple-choice'
      });
      questions.push({
        id: 3,
        question: 'Explain the difference between controlled and uncontrolled components in React.',
        type: 'open-ended',
        explanation: 'Controlled components are those where form data is handled by React state. The value of form elements is controlled by React. Uncontrolled components are those where form data is handled by the DOM itself, and you would use refs to get values from the DOM.'
      });
    } else {
      // Generic questions for other topics
      questions.push({
        id: 1,
        question: `What is the primary focus of ${formData.topic}?`,
        type: 'open-ended',
        explanation: `This question tests basic understanding of the field of ${formData.topic} and its core principles.`
      });
      questions.push({
        id: 2,
        question: `Is ${formData.topic} considered to be an emerging field?`,
        answerOptions: ['True', 'False'],
        correctAnswer: formData.topic.includes('ai') || formData.topic.includes('machine learning') ? 'True' : 'False',
        explanation: 'This question evaluates awareness of the current state and trajectory of the field.',
        type: 'true-false'
      });
      questions.push({
        id: 3,
        question: `Which of these concepts is most closely related to ${formData.topic}?`,
        answerOptions: ['Data Analysis', 'Creative Design', 'Historical Context', 'Scientific Method'],
        correctAnswer: 'Data Analysis',
        explanation: 'This question tests your ability to connect related concepts in the field.',
        type: 'multiple-choice'
      });
    }
    
    // Add more generic questions to meet the count
    while (questions.length < formData.questionCount) {
      questions.push({
        id: questions.length + 1,
        question: `Question ${questions.length + 1} about ${formData.topic}?`,
        answerOptions: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option B',
        explanation: 'Generic explanation for this question.',
        type: 'multiple-choice'
      });
    }
    
    return questions;
  };

  const toggleExplanation = (questionId: number) => {
    setShowExplanation({
      ...showExplanation,
      [questionId]: !showExplanation[questionId]
    });
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
            {/* Form Section */}
            <div className="p-6 md:p-8 md:w-1/2">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-600" />
                Customize Your Questions
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                      Topic or Subject*
                    </label>
                    <input
                      type="text"
                      id="topic"
                      name="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., JavaScript Fundamentals, React Hooks"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
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
                      name="learningStyle"
                      value={formData.learningStyle}
                      onChange={handleInputChange}
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
                      name="questionCount"
                      value={formData.questionCount}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
        {generatedQuestions && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                Generated Questions: {formData.topic}
              </h2>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 hover:text-blue-600 transition">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-blue-600 transition">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-blue-600 transition">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {generatedQuestions.map((question) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 mb-3">
                      {question.id}. {question.question}
                    </h3>
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                      {question.type === 'multiple-choice' ? 'Multiple Choice' : 
                       question.type === 'true-false' ? 'True/False' : 'Open Ended'}
                    </span>
                  </div>
                  
                  {question.type === 'multiple-choice' && question.answerOptions && (
                    <div className="space-y-2 mb-4">
                      {question.answerOptions.map((option, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-lg border ${
                            question.correctAnswer === option 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          } transition cursor-pointer flex items-center`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${
                            question.correctAnswer === option
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}>
                            {question.correctAnswer === option && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'true-false' && question.answerOptions && (
                    <div className="space-y-2 mb-4">
                      {question.answerOptions.map((option, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-lg border ${
                            question.correctAnswer === option 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          } transition cursor-pointer flex items-center`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${
                            question.correctAnswer === option
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}>
                            {question.correctAnswer === option && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      ))}
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
                        onClick={() => toggleExplanation(question.id)}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center transition"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {showExplanation[question.id] ? 'Hide Explanation' : 'Show Explanation'}
                      </button>
                      
                      {showExplanation[question.id] && (
                        <div className="mt-3 p-3 bg-blue-50 text-sm text-gray-700 rounded-lg">
                          {question.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-600">
                  Showing {generatedQuestions.length} questions
                </span>
              </div>
              <button
                onClick={generateQuestions}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionGenerator;