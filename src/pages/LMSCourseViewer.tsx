import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  ArrowLeft, 
  Play, 
  FileText, 
  HelpCircle, 
  Award, 
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Lock,
  GitBranch
} from 'lucide-react';
import { toast } from 'sonner';
import { Course, Lesson, CourseModule } from '../types';
import AiTutorChat from '../components/lms/AiTutorChat';


const LMSCourseViewer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});
  const [viewMode, setViewMode] = useState<'lesson' | 'mindmap'>('mindmap');


  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/courses');
      const found = res.data.courses?.find((c: any) => c._id === courseId || c.id === courseId);
      if (found) {
        setCourse(found);
        // Expand first module
        if (found.modules.length > 0) {
          setExpandedModules({ [found.modules[0].title]: true });
          if (found.modules[0].lessons.length > 0) {
            setActiveLesson(found.modules[0].lessons[0]);
          }
        }
      } else {
        toast.error('Course not found');
        navigate('/courses');
      }
    } catch (err) {
      console.error('Error loading course:', err);
      toast.error('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (title: string) => {
    setExpandedModules(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isLessonCompleted = (lessonId: string) => {
    const progress = user?.courseProgress?.find(cp => cp.courseId === courseId);
    return progress?.completedLessons.includes(lessonId) || false;
  };

  const isLessonUnlocked = (lessonId: string) => {
    if (!course) return false;
    const flatLessons: Lesson[] = [];
    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        flatLessons.push(l);
      });
    });

    const idx = flatLessons.findIndex(l => l.id === lessonId);
    if (idx === -1) return false;
    if (idx === 0) return true;
    
    const previousLesson = flatLessons[idx - 1];
    return isLessonCompleted(previousLesson.id);
  };


  const getQuizScore = (quizId: string) => {
    const progress = user?.courseProgress?.find(cp => cp.courseId === courseId);
    return progress?.quizScores.find(qs => qs.quizId === quizId)?.score;
  };

  const handleMarkCompleted = async () => {
    if (!course || !activeLesson) return;
    try {
      const res = await axios.post(`/api/courses/${course._id}/lessons/${activeLesson.id}/complete`);
      toast.success(`Lesson completed! +10 XP earned! 🎉`);
      
      // Update local profile state
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('skillswap_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      toast.error('Failed to complete lesson.');
    }
  };

  // Quiz Handling
  const startQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizComplete(false);
    setShowQuizModal(true);
  };

  const handleSelectAnswer = (option: string) => {
    if (showExplanation) return; // locked once checked
    setSelectedAnswer(option);
  };

  const checkAnswer = () => {
    if (!selectedAnswer || !activeLesson?.quiz) return;
    const currentQuestion = activeLesson.quiz[currentQuestionIdx];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!activeLesson?.quiz) return;
    setSelectedAnswer(null);
    setShowExplanation(false);

    if (currentQuestionIdx + 1 < activeLesson.quiz.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizComplete(true);
      submitQuizResults();
    }
  };

  const submitQuizResults = async () => {
    if (!course || !activeLesson?.quiz) return;
    const finalScorePercent = Math.round((quizScore / activeLesson.quiz.length) * 100);
    try {
      const res = await axios.post(`/api/courses/${course._id}/quizzes/${activeLesson.id}/submit`, {
        score: finalScorePercent
      });
      
      const xp = finalScorePercent >= 80 ? 30 : 10;
      toast.success(`Quiz submitted! Score: ${finalScorePercent}%. +${xp} XP gained! 🏆`);

      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('skillswap_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Error submitting quiz score:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Course Outline */}
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <button 
            onClick={() => navigate('/courses')}
            className="text-xs text-gray-500 hover:text-blue-600 font-bold flex items-center gap-1 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </button>
          <h2 className="font-bold text-gray-900 leading-tight">{course.title}</h2>
          <p className="text-xs text-gray-500 mt-1">Instructor: {course.instructorName || 'Sarah Wilson'}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {course.modules.map((module) => {
            const isExpanded = expandedModules[module.title] || false;
            return (
              <div key={module.title} className="border border-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleModule(module.title)}
                  className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 flex justify-between items-center text-left text-sm font-bold text-gray-800 transition"
                >
                  <span className="line-clamp-1">{module.title}</span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>

                {isExpanded && (
                  <div className="bg-white border-t border-gray-50 p-2 divide-y divide-gray-50">
                    {module.lessons.map((lesson) => {
                      const active = activeLesson?.id === lesson.id;
                      const completed = isLessonCompleted(lesson.id);
                      const unlocked = isLessonUnlocked(lesson.id);
                      
                      const handleLessonClick = () => {
                        if (!unlocked) {
                          const flatLessons: Lesson[] = [];
                          course.modules.forEach(m => {
                            m.lessons.forEach(l => {
                              flatLessons.push(l);
                            });
                          });
                          const idx = flatLessons.findIndex(l => l.id === lesson.id);
                          const prevLessonTitle = idx > 0 ? flatLessons[idx - 1].title : 'the previous lesson';
                          toast.error(`Lesson locked! Complete "${prevLessonTitle}" first.`);
                          return;
                        }
                        setActiveLesson(lesson);
                        setViewMode('lesson');
                      };

                      return (
                        <button
                          key={lesson.id}
                          onClick={handleLessonClick}
                          className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left text-xs font-semibold transition ${
                            active 
                              ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600' 
                              : !unlocked 
                                ? 'text-gray-400 opacity-60 hover:bg-red-50/10 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 max-w-[85%]">
                            {completed ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            ) : !unlocked ? (
                              <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-blue-500 flex-shrink-0 animate-pulse" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          {lesson.quiz && lesson.quiz.length > 0 && (
                            <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                              Quiz
                            </span>
                          )}
                        </button>
                      );
                    })}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Lesson Workspace */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto overflow-y-auto">
        {course && (
          <div className="mb-6 flex justify-between items-center bg-white p-3 border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600 animate-pulse" />
              <h3 className="text-sm font-bold text-gray-800">Syllabus Path</h3>
            </div>
            <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => {
                  if (activeLesson) {
                    setViewMode('lesson');
                  } else if (course.modules[0]?.lessons[0]) {
                    setActiveLesson(course.modules[0].lessons[0]);
                    setViewMode('lesson');
                  }
                }}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  viewMode === 'lesson' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Workspace
              </button>
              <button
                onClick={() => setViewMode('mindmap')}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  viewMode === 'mindmap' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Mind-Map View
              </button>
            </div>
          </div>
        )}

        {viewMode === 'mindmap' ? (
          <CourseMindMap
            course={course}
            isLessonCompleted={isLessonCompleted}
            isLessonUnlocked={isLessonUnlocked}
            activeLesson={activeLesson}
            onLessonClick={(lesson) => {
              setActiveLesson(lesson);
              setViewMode('lesson');
            }}
            getQuizScore={getQuizScore}
          />
        ) : activeLesson ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4 flex justify-between items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{activeLesson.title}</h1>
                <p className="text-xs text-gray-500 mt-1">Lesson Workspace • Interactive LMS Mode</p>
              </div>
              <button
                onClick={() => setViewMode('mindmap')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
              >
                <GitBranch className="w-3.5 h-3.5" /> View Mind-Map
              </button>
            </div>


            {/* Video Canvas */}
            {activeLesson.videoUrl && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-md">
                <video 
                  src={activeLesson.videoUrl} 
                  controls 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Lesson Body Content */}
            <article className="prose max-w-none text-gray-700 leading-relaxed text-sm md:text-base space-y-4">
              <p className="whitespace-pre-line">{activeLesson.content}</p>
            </article>

            {/* Resource Links */}
            {activeLesson.resources && activeLesson.resources.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Lesson Resources</h3>
                <div className="space-y-2">
                  {activeLesson.resources.map((res, i) => (
                    <a 
                      key={i} 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); toast.info(`Opening resource: ${res}`); }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {res}
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Completion and Quiz toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-gray-100 pt-6 mt-8">
              <button
                onClick={handleMarkCompleted}
                disabled={isLessonCompleted(activeLesson.id)}
                className={`w-full sm:w-auto px-6 py-2.5 font-bold rounded-lg text-sm flex items-center justify-center gap-1.5 transition ${
                  isLessonCompleted(activeLesson.id)
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                }`}
              >
                {isLessonCompleted(activeLesson.id) ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    Mark Lesson Completed (+10 XP)
                  </>
                )}
              </button>

              {activeLesson.quiz && activeLesson.quiz.length > 0 && (
                <button
                  onClick={startQuiz}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm shadow transition flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  {getQuizScore(activeLesson.id) !== undefined 
                    ? `Retake Quiz (Best: ${getQuizScore(activeLesson.id)}%)` 
                    : 'Take Quiz (+30 XP)'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No lesson active</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Please select a lesson from the left syllabus sidebar to begin study.
            </p>
          </div>
        )}
      </main>

      {/* Quiz Modal Overlay */}
      {showQuizModal && activeLesson?.quiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base">Lesson Quiz: {activeLesson.title}</h3>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 inline-block">
                  {!quizComplete ? `Question ${currentQuestionIdx + 1} of ${activeLesson.quiz.length}` : 'Quiz Complete'}
                </span>
              </div>
              <button 
                onClick={() => setShowQuizModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold p-1 hover:bg-gray-100 rounded-full transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!quizComplete ? (
                <div className="space-y-6">
                  {/* Question Title */}
                  <h4 className="text-base font-bold text-gray-800">
                    {activeLesson.quiz[currentQuestionIdx].question}
                  </h4>

                  {/* Options */}
                  <div className="space-y-3">
                    {activeLesson.quiz[currentQuestionIdx].answerOptions?.map((option, idx) => {
                      const selected = selectedAnswer === option;
                      const correctAnswer = activeLesson.quiz?.[currentQuestionIdx].correctAnswer;
                      const correct = option === correctAnswer;
                      
                      let optionStyle = 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/10 cursor-pointer';
                      if (selected) {
                        optionStyle = 'border-blue-500 bg-blue-50/20';
                      }
                      if (showExplanation) {
                        if (correct) {
                          optionStyle = 'border-green-500 bg-green-50 text-green-800 cursor-not-allowed';
                        } else if (selected) {
                          optionStyle = 'border-red-500 bg-red-50 text-red-800 cursor-not-allowed';
                        } else {
                          optionStyle = 'border-gray-100 opacity-60 cursor-not-allowed';
                        }
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectAnswer(option)}
                          className={`p-3.5 border-2 rounded-xl text-xs font-semibold transition ${optionStyle}`}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Block */}
                  {showExplanation && (
                    <div className={`p-4 rounded-xl text-xs leading-relaxed border ${
                      selectedAnswer === activeLesson.quiz[currentQuestionIdx].correctAnswer
                        ? 'bg-green-50/40 border-green-200 text-green-800'
                        : 'bg-red-50/40 border-red-200 text-red-800'
                    }`}>
                      <p className="font-bold mb-1">
                        {selectedAnswer === activeLesson.quiz[currentQuestionIdx].correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
                      </p>
                      <p>{activeLesson.quiz[currentQuestionIdx].explanation}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Quiz Score / Finish View */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-2xl animate-bounce">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Quiz Completed!</h4>
                    <p className="text-sm text-gray-500 mt-1">Great job finishing this checkup.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 inline-block border border-gray-100">
                    <p className="text-xs font-bold text-gray-600">Your Score</p>
                    <p className="text-3xl font-extrabold text-blue-600 mt-1">
                      {Math.round((quizScore / activeLesson.quiz.length) * 100)}%
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">({quizScore} of {activeLesson.quiz.length} correct)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Control Buttons */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              {!quizComplete ? (
                !showExplanation ? (
                  <button
                    onClick={checkAnswer}
                    disabled={!selectedAnswer}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg text-xs shadow transition"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow transition"
                  >
                    {currentQuestionIdx + 1 === activeLesson.quiz.length ? 'Show Results' : 'Next Question'}
                  </button>
                )
              ) : (
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs shadow transition"
                >
                  Close & Claim XP
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* AI Tutor Chatbot — only visible in lesson workspace mode */}
      {viewMode === 'lesson' && activeLesson && (
        <AiTutorChat lesson={activeLesson} learningStyle={user?.learningStyle} />
      )}

    </div>
  );
};

interface CourseMindMapProps {
  course: Course;
  isLessonCompleted: (id: string) => boolean;
  isLessonUnlocked: (id: string) => boolean;
  activeLesson: Lesson | null;
  onLessonClick: (lesson: Lesson) => void;
  getQuizScore: (id: string) => number | undefined;
}

const CourseMindMap: React.FC<CourseMindMapProps> = ({
  course,
  isLessonCompleted,
  isLessonUnlocked,
  activeLesson,
  onLessonClick,
  getQuizScore
}) => {
  const nodes: any[] = [];
  const edges: any[] = [];
  
  let currentY = 40;
  course.modules.forEach((module, mIdx) => {
    const moduleNodeY = currentY + 30;
    const moduleNodeX = 380;
    
    nodes.push({
      id: `mod-${mIdx}`,
      type: 'module',
      label: module.title,
      description: module.description,
      x: moduleNodeX,
      y: moduleNodeY,
      data: module
    });
    
    module.lessons.forEach((lesson, lIdx) => {
      const side = lIdx % 2 === 0 ? -1 : 1;
      const lessonX = 380 + side * 190;
      const row = Math.floor(lIdx / 2);
      const lessonY = moduleNodeY + 110 + row * 90;
      
      const completed = isLessonCompleted(lesson.id);
      const unlocked = isLessonUnlocked(lesson.id);
      
      nodes.push({
        id: lesson.id,
        type: 'lesson',
        label: lesson.title,
        x: lessonX,
        y: lessonY,
        completed,
        unlocked,
        active: activeLesson?.id === lesson.id,
        data: lesson
      });
      
      edges.push({
        fromX: moduleNodeX,
        fromY: moduleNodeY,
        toX: lessonX,
        toY: lessonY,
        active: completed,
        unlocked: unlocked
      });
    });
    
    const rowCount = Math.ceil(module.lessons.length / 2);
    const nextY = moduleNodeY + 130 + rowCount * 90;
    
    if (mIdx < course.modules.length - 1) {
      edges.push({
        fromX: moduleNodeX,
        fromY: moduleNodeY,
        toX: moduleNodeX,
        toY: nextY + 30,
        active: module.lessons.every(l => isLessonCompleted(l.id)),
        unlocked: module.lessons.every(l => isLessonCompleted(l.id))
      });
    }
    
    currentY = nextY;
  });
  
  const totalHeight = currentY + 50;

  const [hoveredNode, setHoveredNode] = useState<any | null>(null);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 overflow-hidden">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-2 border-b border-gray-105 pb-4">
        <div>
          <h4 className="font-bold text-gray-900 text-sm md:text-base">Visual Path Journey</h4>
          <p className="text-[11px] text-gray-500 mt-0.5">Interactive mind-map. Click on unlocked capsules to load lessons.</p>
        </div>
        
        <div className="flex gap-3 text-[9px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600 block shadow-sm shadow-emerald-200"></span>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-600 block shadow-sm shadow-blue-200 animate-pulse"></span>
            <span className="text-gray-600">Active</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300 block"></span>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-105 border border-gray-200 block opacity-50"></span>
            <span className="text-gray-600">Locked</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="w-[760px] relative mx-auto" style={{ height: `${totalHeight}px` }}>
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="activeGradLine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <style>
              {`
                @keyframes strokeFlow {
                  to {
                    stroke-dashoffset: -20;
                  }
                }
                .flowing-path {
                  stroke-dasharray: 6, 6;
                  animation: strokeFlow 1.2s linear infinite;
                }
              `}
            </style>
            
            {edges.map((edge, idx) => {
              const isVerticalTrunk = edge.fromX === edge.toX;
              const pathD = isVerticalTrunk
                ? `M ${edge.fromX} ${edge.fromY} L ${edge.toX} ${edge.toY}`
                : `M ${edge.fromX} ${edge.fromY} C ${edge.fromX} ${(edge.fromY + edge.toY)/2}, ${edge.toX} ${(edge.fromY + edge.toY)/2}, ${edge.toX} ${edge.toY}`;
                
              return (
                <path
                  key={idx}
                  d={pathD}
                  fill="none"
                  stroke={edge.active ? 'url(#activeGradLine)' : '#e5e7eb'}
                  strokeWidth={edge.active ? 4 : 2.5}
                  className={edge.active ? 'flowing-path' : ''}
                />
              );
            })}
          </svg>

          {nodes.map((node) => {
            const isModule = node.type === 'module';
            
            if (isModule) {
              return (
                <div
                  key={node.id}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 w-64 bg-gradient-to-r from-blue-600 to-indigo-600 border border-indigo-500/20 text-white rounded-2xl px-4 py-2.5 text-center shadow-lg shadow-blue-500/10 cursor-default"
                >
                  <span className="text-[9px] bg-white/20 uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-full block w-max mx-auto mb-1">
                    Module
                  </span>
                  <h4 className="text-xs font-extrabold truncate">{node.label}</h4>
                </div>
              );
            }

            const score = getQuizScore(node.id);
            
            let cardClass = '';
            let iconClass = '';
            
            if (node.completed) {
              cardClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 hover:shadow-lg hover:shadow-emerald-100';
              iconClass = 'text-emerald-500';
            } else if (node.active) {
              cardClass = 'bg-blue-50 border-blue-400 text-blue-800 shadow-md shadow-blue-100 hover:bg-blue-100 hover:shadow-lg ring-2 ring-blue-400 ring-offset-2 animate-pulse';
              iconClass = 'text-blue-600';
            } else if (node.unlocked) {
              cardClass = 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-gray-50 hover:shadow-md';
              iconClass = 'text-gray-400';
            } else {
              cardClass = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60 cursor-not-allowed';
              iconClass = 'text-gray-300';
            }

            return (
              <div
                key={node.id}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  if (node.unlocked) {
                    onLessonClick(node.data);
                  } else {
                    const flatLessons: Lesson[] = [];
                    course.modules.forEach(m => {
                      m.lessons.forEach(l => {
                        flatLessons.push(l);
                      });
                    });
                    const idx = flatLessons.findIndex(l => l.id === node.id);
                    const prevTitle = idx > 0 ? flatLessons[idx - 1].title : 'preceding lesson';
                    toast.error(`Lesson locked! Complete "${prevTitle}" first.`);
                  }
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 w-44 rounded-xl border p-3 cursor-pointer transition-all duration-300 text-left flex flex-col gap-1.5 shadow-sm ${cardClass}`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">
                    {node.data.quiz && node.data.quiz.length > 0 ? 'Quiz Unit' : 'Study Unit'}
                  </span>
                  
                  {node.completed ? (
                    <CheckCircle className={`w-3.5 h-3.5 ${iconClass}`} />
                  ) : !node.unlocked ? (
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <Circle className={`w-3.5 h-3.5 ${iconClass}`} />
                  )}
                </div>

                <h5 className="text-[10px] font-extrabold line-clamp-2 leading-tight">
                  {node.label}
                </h5>

                {score !== undefined && (
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold w-max">
                    Quiz: {score}%
                  </span>
                )}
              </div>
            );
          })}

          {hoveredNode && hoveredNode.type === 'lesson' && (
            <div
              style={{
                left: `${hoveredNode.x}px`,
                top: `${hoveredNode.y - 65}px`
              }}
              className="absolute -translate-x-1/2 z-30 w-52 bg-gray-900 text-white rounded-xl p-3 shadow-xl border border-gray-800 text-[10px] leading-relaxed pointer-events-none animate-fadeIn"
            >
              <div className="font-extrabold text-indigo-300 truncate mb-1">
                {hoveredNode.label}
              </div>
              <div className="text-gray-400">
                • Status:{' '}
                <span className={hoveredNode.completed ? 'text-emerald-400 font-bold' : hoveredNode.unlocked ? 'text-blue-400 font-bold' : 'text-red-400'}>
                  {hoveredNode.completed ? 'Completed (+10 XP)' : hoveredNode.unlocked ? 'Available' : 'Locked'}
                </span>
              </div>
              {!hoveredNode.unlocked && (
                <div className="text-red-300 font-semibold mt-1">
                  🔒 Locked: Complete previous nodes first.
                </div>
              )}
              {hoveredNode.data.quiz && hoveredNode.data.quiz.length > 0 && (
                <div className="text-indigo-200 mt-1">
                  🏆 Contains Quiz (+30 XP)
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LMSCourseViewer;

