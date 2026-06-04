import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Sparkles, 
  Settings, 
  Video, 
  BookOpenCheck,
  ChevronDown,
  ChevronRight,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { Question } from '../types';

interface LessonForm {
  id: string;
  title: string;
  content: string;
  videoUrl: string;
  resources: string[];
  quiz: Question[];
}

interface ModuleForm {
  title: string;
  description: string;
  lessons: LessonForm[];
}

const LMSCourseBuilder: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);

  // Course metadata state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [category, setCategory] = useState('Development');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [imageUrl, setImageUrl] = useState('');

  // Course syllabus state
  const [modules, setModules] = useState<ModuleForm[]>([
    {
      title: 'Module 1: Getting Started',
      description: 'Introduction and initial setup.',
      lessons: [
        {
          id: 'lesson-' + Math.random().toString(36).substring(2, 9),
          title: 'Introduction Lesson',
          content: 'Write your lesson content details here...',
          videoUrl: '',
          resources: [],
          quiz: []
        }
      ]
    }
  ]);

  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  const [aiGeneratingQuiz, setAiGeneratingQuiz] = useState(false);

  // Syllabus modifiers
  const addModule = () => {
    const title = `Module ${modules.length + 1}: New Module`;
    setModules(prev => [
      ...prev,
      {
        title,
        description: 'New module description.',
        lessons: []
      }
    ]);
    setActiveModuleIdx(modules.length);
    setActiveLessonIdx(-1);
    toast.success('Module added');
  };

  const deleteModule = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (modules.length === 1) {
      toast.error('Courses must have at least one module.');
      return;
    }
    setModules(prev => prev.filter((_, i) => i !== idx));
    setActiveModuleIdx(0);
    setActiveLessonIdx(0);
  };

  const addLesson = (moduleIdx: number) => {
    const newLesson: LessonForm = {
      id: 'lesson-' + Math.random().toString(36).substring(2, 9),
      title: 'New Lesson',
      content: '',
      videoUrl: '',
      resources: [],
      quiz: []
    };
    setModules(prev => prev.map((mod, i) => {
      if (i === moduleIdx) {
        return {
          ...mod,
          lessons: [...mod.lessons, newLesson]
        };
      }
      return mod;
    }));
    setActiveModuleIdx(moduleIdx);
    setActiveLessonIdx(modules[moduleIdx].lessons.length);
    toast.success('Lesson added');
  };

  const deleteLesson = (modIdx: number, lesIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setModules(prev => prev.map((mod, i) => {
      if (i === modIdx) {
        return {
          ...mod,
          lessons: mod.lessons.filter((_, j) => j !== lesIdx)
        };
      }
      return mod;
    }));
    setActiveLessonIdx(-1);
  };

  // Active Lesson attribute modifiers
  const updateActiveLesson = (field: keyof LessonForm, value: any) => {
    setModules(prev => prev.map((mod, i) => {
      if (i === activeModuleIdx) {
        return {
          ...mod,
          lessons: mod.lessons.map((les, j) => {
            if (j === activeLessonIdx) {
              return { ...les, [field]: value };
            }
            return les;
          })
        };
      }
      return mod;
    }));
  };

  // Manual Quiz Management
  const addQuizQuestion = () => {
    const curLesson = modules[activeModuleIdx].lessons[activeLessonIdx];
    const newQuestion: Question = {
      id: curLesson.quiz ? curLesson.quiz.length + 1 : 1,
      question: 'New Question?',
      type: 'multiple-choice',
      answerOptions: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: 'Explanation for correct answer.'
    };
    updateActiveLesson('quiz', [...(curLesson.quiz || []), newQuestion]);
  };

  const updateQuizQuestionField = (qIdx: number, field: keyof Question, value: any) => {
    const curLesson = modules[activeModuleIdx].lessons[activeLessonIdx];
    const updatedQuiz = curLesson.quiz.map((q, i) => {
      if (i === qIdx) {
        return { ...q, [field]: value };
      }
      return q;
    });
    updateActiveLesson('quiz', updatedQuiz);
  };

  const updateOptionText = (qIdx: number, optIdx: number, text: string) => {
    const curLesson = modules[activeModuleIdx].lessons[activeLessonIdx];
    const question = curLesson.quiz[qIdx];
    if (question.answerOptions) {
      const updatedOptions = [...question.answerOptions];
      updatedOptions[optIdx] = text;
      updateQuizQuestionField(qIdx, 'answerOptions', updatedOptions);
    }
  };

  const removeQuizQuestion = (qIdx: number) => {
    const curLesson = modules[activeModuleIdx].lessons[activeLessonIdx];
    updateActiveLesson('quiz', curLesson.quiz.filter((_, i) => i !== qIdx));
  };

  // AI Quiz Generation
  const generateQuizWithAI = async () => {
    const activeLesson = modules[activeModuleIdx].lessons[activeLessonIdx];
    if (!activeLesson.title || !activeLesson.content) {
      toast.error('Please enter a lesson title and content first so the AI has context.');
      return;
    }

    try {
      setAiGeneratingQuiz(true);
      const res = await axios.post('/api/ai/generate', {
        topic: activeLesson.title + ': ' + activeLesson.content.substring(0, 100),
        difficulty: difficulty,
        learningStyle: 'Logical',
        questionCount: 3
      });

      const questions: Question[] = res.data.questions || [];
      updateActiveLesson('quiz', [...(activeLesson.quiz || []), ...questions]);
      toast.success('AI successfully generated 3 quiz questions based on lesson topic! 🚀');
    } catch (err) {
      console.error('Error generating quiz:', err);
      toast.error('Failed to generate quiz. Mock fallback will be used.');
      
      // Add a mock generated question fallback
      const fallbackQuestions: Question[] = [
        {
          id: (activeLesson.quiz?.length || 0) + 1,
          question: `What is the primary concept discussed in "${activeLesson.title}"?`,
          type: 'multiple-choice',
          answerOptions: ['The core definition', 'An secondary option', 'None of these', 'All of these'],
          correctAnswer: 'The core definition',
          explanation: 'This question tests basic recall of the lesson syllabus concepts.'
        }
      ];
      updateActiveLesson('quiz', [...(activeLesson.quiz || []), ...fallbackQuestions]);
    } finally {
      setAiGeneratingQuiz(false);
    }
  };

  // Publish Course
  const handlePublishCourse = async () => {
    if (!courseTitle.trim() || !courseDesc.trim()) {
      toast.error('Please enter course title and description');
      return;
    }

    // Validate syllabus exists
    let totalLessons = 0;
    modules.forEach(m => {
      totalLessons += m.lessons.length;
    });
    if (totalLessons === 0) {
      toast.error('Syllabus must contain at least one lesson.');
      return;
    }

    try {
      setPublishing(true);
      await axios.post('/api/courses', {
        title: courseTitle,
        description: courseDesc,
        category,
        difficulty,
        image: imageUrl || undefined,
        modules
      });

      toast.success('Course published successfully! Enrolling is now live. 🎓');
      navigate('/courses');
    } catch (err) {
      console.error('Error publishing course:', err);
      toast.error('Failed to publish course.');
    } finally {
      setPublishing(false);
    }
  };

  const activeLesson = activeModuleIdx !== -1 && activeLessonIdx !== -1 && modules[activeModuleIdx]?.lessons?.[activeLessonIdx]
    ? modules[activeModuleIdx].lessons[activeLessonIdx]
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header bar */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/courses')}
            className="p-2 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-500 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LMS Course Builder</h1>
            <p className="text-xs text-gray-500 mt-0.5">Design customized curriculums for SkillSwap Academy</p>
          </div>
        </div>

        <button
          onClick={handlePublishCourse}
          disabled={publishing}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl shadow transition text-sm flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          {publishing ? 'Publishing...' : 'Publish Course'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Course Metadata & Outline tree */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Metadata configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b pb-2">
              <Settings className="w-4 h-4 text-blue-500" />
              Course Configurations
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Course Title</label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g. Intro to Node.js APIs"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                placeholder="Provide a summary of what students will master..."
                rows={3}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
                >
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Banner Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.pexels.com/..."
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs transition"
              />
            </div>
          </div>

          {/* Curriculum outline tree */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Course Syllabus
              </h3>
              <button
                onClick={addModule}
                className="p-1 text-xs text-blue-600 hover:bg-blue-50 font-bold rounded flex items-center gap-0.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Module
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {modules.map((mod, modIdx) => (
                <div key={modIdx} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div 
                    onClick={() => { setActiveModuleIdx(modIdx); setActiveLessonIdx(-1); }}
                    className={`px-3 py-2 bg-gray-50/50 hover:bg-gray-50 flex justify-between items-center cursor-pointer transition ${
                      activeModuleIdx === modIdx && activeLessonIdx === -1 ? 'bg-indigo-50/50 border-l-4 border-indigo-500' : ''
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-800 line-clamp-1 flex-1">{mod.title}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => addLesson(modIdx)}
                        className="p-0.5 text-blue-600 hover:bg-blue-100 rounded"
                        title="Add Lesson"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => deleteModule(modIdx, e)}
                        className="p-0.5 text-red-500 hover:bg-red-100 rounded"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-1.5 divide-y divide-gray-50 pl-3">
                    {mod.lessons.map((les, lesIdx) => {
                      const isActive = activeModuleIdx === modIdx && activeLessonIdx === lesIdx;
                      return (
                        <div
                          key={les.id}
                          onClick={() => { setActiveModuleIdx(modIdx); setActiveLessonIdx(lesIdx); }}
                          className={`p-2 rounded text-[11px] font-semibold cursor-pointer flex justify-between items-center transition ${
                            isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate max-w-[80%]">{les.title}</span>
                          <button
                            onClick={(e) => deleteLesson(modIdx, lesIdx, e)}
                            className="p-0.5 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100"
                            style={{ opacity: 1 }} // force visibility on hover list
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Active Workspace Editor */}
        <div className="lg:col-span-8">
          
          {activeLesson ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
              
              {/* Lesson metadata */}
              <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Editing Lesson</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Syllabus node workspace editor</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={generateQuizWithAI}
                    disabled={aiGeneratingQuiz}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition flex items-center gap-1 border border-indigo-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    {aiGeneratingQuiz ? 'Generating...' : 'AI Quiz'}
                  </button>
                </div>
              </div>

              {/* Title & Video */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Lesson Title</label>
                  <input
                    type="text"
                    value={activeLesson.title}
                    onChange={(e) => updateActiveLesson('title', e.target.value)}
                    placeholder="e.g. Understanding JSX Structure"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-blue-500" />
                    Video URL <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={activeLesson.videoUrl}
                    onChange={(e) => updateActiveLesson('videoUrl', e.target.value)}
                    placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs transition"
                  />
                </div>
              </div>

              {/* Content Body */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Lesson Syllabus / Reading Material</label>
                <textarea
                  value={activeLesson.content}
                  onChange={(e) => updateActiveLesson('content', e.target.value)}
                  placeholder="Type in depth descriptions, explanations, code blocks, or notes here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs leading-relaxed font-mono transition"
                />
              </div>

              {/* Resources */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Resource Links (comma separated)</label>
                <input
                  type="text"
                  value={activeLesson.resources?.join(', ')}
                  onChange={(e) => updateActiveLesson('resources', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="React official docs, JSX Sandbox, git-rebase cheat sheet"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs transition"
                />
              </div>

              {/* Quiz questions planner */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <BookOpenCheck className="w-4 h-4 text-indigo-500" />
                    Lesson Quiz ({activeLesson.quiz?.length || 0} Questions)
                  </h3>
                  <button
                    onClick={addQuizQuestion}
                    className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 font-bold rounded flex items-center gap-0.5 border border-blue-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Question
                  </button>
                </div>

                <div className="space-y-4">
                  {activeLesson.quiz?.map((question, qIdx) => (
                    <div key={qIdx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3 relative">
                      <button
                        onClick={() => removeQuizQuestion(qIdx)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition p-1 hover:bg-gray-100 rounded-full"
                        title="Remove Question"
                      >
                        ✕
                      </button>

                      <div className="max-w-[90%]">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Question {qIdx + 1}
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuizQuestionField(qIdx, 'question', e.target.value)}
                          placeholder="e.g. What does JSX compile down to?"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Question Type
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) => updateQuizQuestionField(qIdx, 'type', e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
                          >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Correct Answer
                          </label>
                          {question.type === 'true-false' ? (
                            <select
                              value={question.correctAnswer}
                              onChange={(e) => updateQuizQuestionField(qIdx, 'correctAnswer', e.target.value)}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
                            >
                              <option value="True">True</option>
                              <option value="False">False</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={question.correctAnswer}
                              onChange={(e) => updateQuizQuestionField(qIdx, 'correctAnswer', e.target.value)}
                              placeholder="Match correct answer exactly"
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
                            />
                          )}
                        </div>
                      </div>

                      {question.type === 'multiple-choice' && question.answerOptions && (
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Answer Options (Click and type option)
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {question.answerOptions.map((opt, optIdx) => (
                              <input
                                key={optIdx}
                                type="text"
                                value={opt}
                                onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white transition"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Explanation (shown after check)
                        </label>
                        <input
                          type="text"
                          value={question.explanation}
                          onChange={(e) => updateQuizQuestionField(qIdx, 'explanation', e.target.value)}
                          placeholder="e.g. JSX compiles to React.createElement() method calls..."
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white transition"
                        />
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm h-80 flex flex-col justify-center items-center">
              <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-1">No lesson active</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Select an existing lesson from the left outline or click "+ Module" / "+ Lesson" to build your syllabus curriculum.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default LMSCourseBuilder;
