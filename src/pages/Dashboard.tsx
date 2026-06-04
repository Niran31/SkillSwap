import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight, 
  Zap, 
  Calendar, 
  Clock, 
  BarChart, 
  Lightbulb,
  BookOpenCheck,
  Flame,
  Calendar as CalendarIcon,
  MessageSquare,
  Star,
  Check,
  X,
  Brain,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import PeerModal from '../components/matching/PeerModal';
import { Peer, Course } from '../types';
import RoadmapVisualizer from '../components/matching/RoadmapVisualizer';
import AcademyManager from './AcademyManager';

type TabType = 'learn' | 'teach';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [teachingSessions, setTeachingSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  // Peer modal open
  const [peers, setPeers] = useState<Peer[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const [showPeerModal, setShowPeerModal] = useState(false);

  // AI Learning Path Roadmaps
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmapTopic, setRoadmapTopic] = useState('');

  // LMS Course States
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [taughtCourses, setTaughtCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const [showChecklist, setShowChecklist] = useState(() => {
    return localStorage.getItem('skillswap_hide_checklist') !== 'true';
  });

  const [checklist, setChecklist] = useState({
    onboarding: true,
    aiQuestions: false,
    exploreMatches: false,
    scheduleSession: false,
    sendMessage: false
  });

  React.useEffect(() => {
    if (user?.id) {
      const completedQuestion = localStorage.getItem('skillswap_completed_question') === 'true';
      const visitedMatching = localStorage.getItem('skillswap_visited_matching') === 'true';
      const sentMessage = localStorage.getItem('skillswap_sent_message') === 'true';
      const bookedSession = localStorage.getItem('skillswap_booked_session') === 'true';
      const hasSessions = upcomingSessions.length > 0 || teachingSessions.length > 0;
      
      setChecklist({
        onboarding: true,
        aiQuestions: completedQuestion,
        exploreMatches: visitedMatching,
        scheduleSession: hasSessions || bookedSession,
        sendMessage: sentMessage
      });
    }
  }, [user?.id, upcomingSessions, teachingSessions]);
  
  React.useEffect(() => {
    if (user && user.id) {
      axios.get(`/api/auth/profile/${user.id}`)
        .then(res => {
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('skillswap_user', JSON.stringify(res.data.user));
          }
        })
        .catch(err => console.error("Error syncing profile:", err));
        
      axios.get(`/api/gamification/${user.id}/dashboard`)
        .then(res => setDashboardStats(res.data))
        .catch(err => console.error("Error fetching dashboard stats:", err));
        
      axios.get('/api/gamification/leaderboard')
        .then(res => setLeaderboard(res.data.leaderboard || []))
        .catch(err => console.error("Error fetching leaderboard:", err));
        
      axios.get('/api/peers')
        .then(res => setPeers(res.data.peers || []))
        .catch(err => console.error("Error fetching peers:", err));
        
      setIsLoadingRoadmaps(true);
      axios.get(`/api/roadmaps/${user.id}`)
        .then(res => {
          setRoadmaps(res.data.roadmaps || []);
        })
        .catch(err => console.error("Error fetching roadmaps:", err))
        .finally(() => setIsLoadingRoadmaps(false));
        
      fetchSessions();

      // Fetch course data based on roles
      if (user.role === 'student') {
        setIsLoadingCourses(true);
        axios.get(`/api/courses?enrolled=true`)
          .then(res => setEnrolledCourses(res.data.courses || []))
          .catch(err => console.error("Error fetching enrolled courses:", err))
          .finally(() => setIsLoadingCourses(false));
      } else if (user.role === 'teacher') {
        setIsLoadingCourses(true);
        axios.get(`/api/courses?instructor=true`)
          .then(res => setTaughtCourses(res.data.courses || []))
          .catch(err => console.error("Error fetching instructor courses:", err))
          .finally(() => setIsLoadingCourses(false));
      }
    }
  }, [user?.id, user?.role, setUser]);

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapTopic.trim()) {
      toast.error("Please enter a topic to master");
      return;
    }
    if (!user) return;

    try {
      setIsGeneratingRoadmap(true);
      const genRes = await axios.post('/api/roadmaps/generate', {
        topic: roadmapTopic.trim(),
        learningStyle: user.learningStyle || 'Visual'
      });

      const saveRes = await axios.post('/api/roadmaps/save', {
        userId: user.id,
        topic: genRes.data.topic,
        learningStyle: genRes.data.learningStyle,
        steps: genRes.data.steps
      });

      const newRoadmap = saveRes.data.roadmap;
      setRoadmaps(prev => [newRoadmap, ...prev]);
      setRoadmapTopic('');
      toast.success("AI learning path generated successfully!");
    } catch (err) {
      console.error("Error generating roadmap:", err);
      toast.error("Failed to generate AI roadmap. Please try again.");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleUpdateRoadmap = (updatedRoadmap: any) => {
    setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
  };

  const fetchSessions = async () => {
    if (!user) return;
    try {
      setIsLoadingSessions(true);
      const res = await axios.get(`/api/sessions/${user.id}`);
      const sessions = res.data.sessions || [];
      setUpcomingSessions(sessions.filter((s: any) => s.learnerId === user.id));
      setTeachingSessions(sessions.filter((s: any) => s.teacherId === user.id));
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handlePlayerClick = (playerName: string) => {
    if (playerName === user?.name) {
      toast.info("This is you! Keep up the good work.");
      return;
    }
    const matchedPeer = peers.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (matchedPeer) {
      setSelectedPeer(matchedPeer);
      setShowPeerModal(true);
    } else {
      const fallbackPeer: Peer = {
        id: 'mock-leaderboard-' + playerName.replace(/\s+/g, '-'),
        name: playerName,
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        role: 'teacher',
        skills: ['Mentoring', 'Expert Guidance'],
        rating: 4.8,
        reviews: 15,
        distance: 'Local Match',
        matchScore: 90,
        location: 'San Francisco, CA'
      };
      setSelectedPeer(fallbackPeer);
      setShowPeerModal(true);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await axios.patch(`/api/sessions/${sessionId}/status`, { status: 'completed' });
      toast.success('Session marked as completed! +50 XP earned! 🎉');
      setUpcomingSessions(prev => prev.filter(s => s.id !== sessionId && s._id !== sessionId));
      setTeachingSessions(prev => prev.filter(s => s.id !== sessionId && s._id !== sessionId));
      if (user && user.id) {
        const profileRes = await axios.get(`/api/auth/profile/${user.id}`);
        if (profileRes.data && profileRes.data.user) {
          setUser(profileRes.data.user);
          localStorage.setItem('skillswap_user', JSON.stringify(profileRes.data.user));
        }
      }
    } catch (err) {
      console.error('Failed to complete session:', err);
      toast.error('Failed to complete session.');
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      await axios.patch(`/api/sessions/${sessionId}/status`, { status: 'cancelled' });
      toast.success('Session cancelled.');
      setUpcomingSessions(prev => prev.filter(s => s.id !== sessionId && s._id !== sessionId));
      setTeachingSessions(prev => prev.filter(s => s.id !== sessionId && s._id !== sessionId));
    } catch (err) {
      console.error('Failed to cancel session:', err);
      toast.error('Failed to cancel session.');
    }
  };

  const handleJoinSession = (teacherId: string) => {
    navigate(`/messages?peerId=${teacherId}`);
    toast.info('Opening chat with your session partner...');
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please sign in</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  if (user.role === 'management') {
    return <AcademyManager />;
  }

  const renderStudentDashboard = () => (
    <div className="space-y-8">
      {/* checklist */}
      {showChecklist && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🚀</span> Student Launch Checklist
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Complete these initial learning steps to maximize your academy benefits!
              </p>
            </div>
            <button 
              onClick={() => {
                setShowChecklist(false);
                localStorage.setItem('skillswap_hide_checklist', 'true');
              }}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(([
                checklist.onboarding,
                checklist.aiQuestions,
                checklist.exploreMatches,
                checklist.scheduleSession,
                checklist.sendMessage
              ].filter(Boolean).length / 5) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.round(([
                  checklist.onboarding,
                  checklist.aiQuestions,
                  checklist.exploreMatches,
                  checklist.scheduleSession,
                  checklist.sendMessage
                ].filter(Boolean).length / 5) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { id: 'onboarding', title: 'Onboarding Profiling', desc: 'Assess your learning style', checked: checklist.onboarding, link: null },
              { id: 'aiQuestions', title: 'AI Quizzes', desc: 'Generate customized test questions', checked: checklist.aiQuestions, link: '/question-generator' },
              { id: 'exploreMatches', title: 'Find Peers', checked: checklist.exploreMatches, link: '/peer-matching' },
              { id: 'scheduleSession', title: 'Book 1-on-1', checked: checklist.scheduleSession, link: '/peer-matching' },
              { id: 'sendMessage', title: 'Send Message', checked: checklist.sendMessage, link: '/messages' }
            ].map((step, idx) => (
              <div 
                key={step.id} 
                onClick={() => step.link && navigate(step.link)}
                className={`p-3 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                  step.checked 
                    ? 'bg-green-50/40 border-green-200 text-green-800' 
                    : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/10 cursor-pointer group'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase opacity-55">Step {idx + 1}</span>
                    {step.checked ? <Check className="w-3 h-3 text-green-600" /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300"></div>}
                  </div>
                  <h4 className="font-bold text-gray-800 leading-tight">{step.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Enrolled Courses */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Active Class Enrollments
              </h2>
              <button 
                onClick={() => navigate('/courses')}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                Course Explorer →
              </button>
            </div>

            {isLoadingCourses ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-gray-700 text-sm">No Active Enrollments</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto mb-4">Access custom structured courses inside your academy portal.</p>
                <button 
                  onClick={() => navigate('/courses')}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition"
                >
                  Explore Course Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolledCourses.map(course => {
                  const progress = user?.courseProgress?.find(cp => cp.courseId === course._id);
                  let totalLessons = 0;
                  course.modules.forEach(m => totalLessons += m.lessons.length);
                  const completed = progress?.completedLessons.length || 0;
                  const pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

                  return (
                    <div key={course._id} className="border border-gray-150 rounded-xl p-4 flex flex-col justify-between bg-white hover:border-blue-300 transition">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{course.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">Instructor: {course.instructorName || 'Sarah Wilson'}</p>
                        
                        <div className="mt-4 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-gray-600">
                            <span>Syllabus Completion</span>
                            <span>{completed}/{totalLessons} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/course-viewer/${course._id}`)}
                        className="w-full mt-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-xs transition"
                      >
                        Resume Learning
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Learning Paths */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              <Brain className="w-5 h-5 text-indigo-600" />
              AI Learning Paths
            </h2>
            <form onSubmit={handleGenerateRoadmap} className="flex gap-2">
              <input
                type="text"
                value={roadmapTopic}
                onChange={(e) => setRoadmapTopic(e.target.value)}
                placeholder="Enter any skill you want to master (e.g. Git workflows, Docker Compose)..."
                disabled={isGeneratingRoadmap}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs transition"
              />
              <button
                type="submit"
                disabled={isGeneratingRoadmap || !roadmapTopic.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-lg text-xs transition"
              >
                {isGeneratingRoadmap ? 'Generating...' : 'Build Path'}
              </button>
            </form>

            <div className="space-y-4">
              {isLoadingRoadmaps ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : roadmaps.length > 0 ? (
                roadmaps.map(roadmap => (
                  <RoadmapVisualizer
                    key={roadmap._id}
                    roadmap={roadmap}
                    onUpdateRoadmap={handleUpdateRoadmap}
                  />
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">No AI roadmaps created yet.</p>
              )}
            </div>
          </div>

          {/* Scheduled Learning sessions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-3">
              <Calendar className="w-5 h-5 text-green-600" />
              1-on-1 Student Sessions
            </h2>
            {upcomingSessions.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No upcoming bookings.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="border border-gray-100 rounded-lg p-4 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-gray-900">{session.topic}</h4>
                      <p className="text-gray-500 mt-0.5">Instructor: {session.teacherName} • {session.date} ({session.time})</p>
                    </div>
                    <button
                      onClick={() => handleJoinSession(session.teacherId)}
                      className="px-3 py-1 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Roster Leaderboard */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-1.5 text-sm">
              <Award className="w-4 h-4 text-yellow-500" />
              Global Leaderboard
            </h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((player, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded hover:bg-gray-50 cursor-pointer" onClick={() => handlePlayerClick(player.name)}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-400 w-4 text-center">{idx + 1}</span>
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden"><img src={player.avatar} className="object-cover w-full h-full" /></div>
                    <span className="font-semibold text-gray-800">{player.name}</span>
                  </div>
                  <span className="font-bold text-gray-600">{player.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeacherDashboard = () => {
    let studentSet = new Set();
    taughtCourses.forEach(c => {
      c.enrolledStudents?.forEach(s => studentSet.add(s));
    });

    return (
      <div className="space-y-8">
        {/* Statistics row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Syllabi Published</h3>
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-extrabold text-gray-900">{taughtCourses.length}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Students Enrolled</h3>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-extrabold text-gray-900">{studentSet.size}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teaching Rating</h3>
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <span className="text-3xl font-extrabold text-gray-900">4.9 / 5.0</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Courses taught */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Your Course Catalog
                </h2>
                <button 
                  onClick={() => navigate('/course-builder')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs shadow transition"
                >
                  + Create Course
                </button>
              </div>

              {isLoadingCourses ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : taughtCourses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-700 text-sm">No courses published</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto mb-4">Publish a custom learning syllabus for your academy students!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {taughtCourses.map(course => (
                    <div key={course._id} className="border border-gray-150 rounded-xl p-4 flex flex-col justify-between bg-white hover:border-blue-300 transition">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{course.title}</h4>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold mt-1.5 inline-block">{course.category}</span>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{course.description}</p>
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-4">
                        <span className="text-xs font-bold text-gray-600">{course.enrolledStudents?.length || 0} enrolled</span>
                        <button
                          onClick={() => navigate(`/course-builder`)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded text-xs transition"
                        >
                          Edit Syllabus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Teaching Sessions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-3">
                <Calendar className="w-5 h-5 text-green-600" />
                Teaching Schedule Bookings
              </h2>
              {teachingSessions.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No scheduled student bookings.</p>
              ) : (
                <div className="space-y-3">
                  {teachingSessions.map(session => (
                    <div key={session.id} className="border border-gray-100 rounded-lg p-4 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-gray-900">{session.topic}</h4>
                        <p className="text-gray-500 mt-0.5">Student: {session.learnerName} • {session.date} ({session.time})</p>
                      </div>
                      <button
                        onClick={() => handleJoinSession(session.learnerId)}
                        className="px-3 py-1 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition"
                      >
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-1.5 text-sm">
                <Award className="w-4 h-4 text-yellow-500" />
                Global Leaderboard
              </h3>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded hover:bg-gray-50 cursor-pointer" onClick={() => handlePlayerClick(player.name)}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-400 w-4 text-center">{idx + 1}</span>
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden"><img src={player.avatar} className="object-cover w-full h-full" /></div>
                      <span className="font-semibold text-gray-800">{player.name}</span>
                    </div>
                    <span className="font-bold text-gray-600">{player.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultDashboard = () => {
    const recommendedSkills = dashboardStats?.recommendedSkills || [];
    const teachingOpportunities = dashboardStats?.teachingOpportunities || [];
    return (
      <div className="space-y-8">
        {showChecklist && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🚀</span> Getting Started Checklist
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete these core learning actions to unlock your profile's full potential and earn bonus XP!
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowChecklist(false);
                  localStorage.setItem('skillswap_hide_checklist', 'true');
                }}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"
                title="Dismiss Guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
                <span>Your Progress</span>
                <span>{Math.round(([
                  checklist.onboarding,
                  checklist.aiQuestions,
                  checklist.exploreMatches,
                  checklist.scheduleSession,
                  checklist.sendMessage
                ].filter(Boolean).length / 5) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.round(([
                    checklist.onboarding,
                    checklist.aiQuestions,
                    checklist.exploreMatches,
                    checklist.scheduleSession,
                    checklist.sendMessage
                  ].filter(Boolean).length / 5) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                { id: 'onboarding', title: 'Cognitive Profiling', desc: 'Assess your learning style', checked: checklist.onboarding, link: null },
                { id: 'aiQuestions', title: 'AI Questions', desc: 'Generate customized test questions', checked: checklist.aiQuestions, link: '/question-generator' },
                { id: 'exploreMatches', title: 'Explore Matches', desc: 'Find compatible learning buddies', checked: checklist.exploreMatches, link: '/peer-matching' },
                { id: 'scheduleSession', title: 'Schedule Session', desc: 'Book a 1-on-1 peer session', checked: checklist.scheduleSession, link: '/peer-matching' },
                { id: 'sendMessage', title: 'Send Message', desc: 'Start a conversation with a peer', checked: checklist.sendMessage, link: '/messages' }
              ].map((step, idx) => (
                <div 
                  key={step.id} 
                  onClick={() => step.link && navigate(step.link)}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    step.checked 
                      ? 'bg-green-50/40 border-green-200 text-green-800' 
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer group'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-60">Step {idx + 1}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        step.checked 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 group-hover:border-blue-400 bg-white'
                      }`}>
                        {step.checked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <h4 className="font-bold text-sm leading-tight text-gray-800 group-hover:text-blue-900">
                      {step.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`flex items-center py-4 px-6 font-medium text-lg border-b-2 transition-colors ${
              activeTab === 'learn'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('learn')}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Learn Mode
          </button>
          <button
            className={`flex items-center py-4 px-6 font-medium text-lg border-b-2 transition-colors ${
              activeTab === 'teach'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('teach')}
          >
            <Users className="w-5 h-5 mr-2" />
            Teach Mode
          </button>
        </div>

        {activeTab === 'learn' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-gray-700">Weekly Learning Time</h3>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    +12% vs last week
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-10 h-10 text-blue-500 mr-4" />
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{dashboardStats?.weeklyLearningTime || 0}h</p>
                    <p className="text-sm text-gray-500">Target: 7h</p>
                  </div>
                </div>
                <div className="mt-4 bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, Math.round(((dashboardStats?.weeklyLearningTime || 0) / 7) * 100))}%` }}></div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-medium text-gray-700 mb-4">Skills in Progress</h3>
                <div className="space-y-3">
                  {(user.strengths && user.strengths.length > 0 ? user.strengths : ['General Learning']).map((skill, idx) => {
                    const progressValues = [67, 42, 89, 55, 73];
                    const progress = progressValues[idx % progressValues.length];
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{skill}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-medium text-gray-700 mb-4">Achievements</h3>
                <div className="grid grid-cols-3 gap-3">
                  {user.badges.slice(0, 3).map((badge, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-blue-100 text-blue-600' : 
                        index === 1 ? 'bg-green-100 text-green-600' : 
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {index === 0 ? <Zap className="w-6 h-6" /> : 
                         index === 1 ? <Award className="w-6 h-6" /> : 
                         <BookOpenCheck className="w-6 h-6" />}
                      </div>
                      <span className="text-xs text-gray-600 text-center mt-2">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Brain className="w-6 h-6 text-indigo-600 animate-pulse" />
                        Your AI Learning Paths
                      </h2>
                    </div>
                  </div>
                  <form onSubmit={handleGenerateRoadmap} className="flex gap-2">
                    <input
                      type="text"
                      value={roadmapTopic}
                      onChange={(e) => setRoadmapTopic(e.target.value)}
                      placeholder="Enter any skill topic you want to master..."
                      disabled={isGeneratingRoadmap}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isGeneratingRoadmap || !roadmapTopic.trim()}
                      className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow transition-all text-sm flex items-center gap-1.5"
                    >
                      {isGeneratingRoadmap ? 'Generating...' : 'Build Path'}
                    </button>
                  </form>
                  <div className="space-y-6">
                    {isLoadingRoadmaps ? (
                      <div className="flex justify-center p-8">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : roadmaps.length > 0 ? (
                      roadmaps.map(roadmap => (
                        <RoadmapVisualizer
                          key={roadmap._id}
                          roadmap={roadmap}
                          onUpdateRoadmap={handleUpdateRoadmap}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">No learning paths created.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
                  {recommendedSkills.length === 0 ? (
                    <p className="text-sm text-gray-500 py-6 text-center">No recommendations yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {recommendedSkills.slice(0, 2).map((skill: any) => (
                        <div key={skill.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                          <div className="h-40 relative">
                            <img src={skill.image} alt={skill.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-gray-900 mb-2">{skill.title}</h3>
                            <Link to="/question-generator" className="block w-full py-2 bg-blue-600 text-white text-center rounded-lg font-medium">Start Learning</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <Award className="w-5 h-5 text-yellow-500 mr-2" />
                    Global Leaderboard
                  </h3>
                  <div className="space-y-4">
                    {leaderboard.slice(0, 5).map((player, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handlePlayerClick(player.name)}>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-bold text-gray-500">{index + 1}</span>
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden"><img src={player.avatar} className="w-full h-full object-cover" /></div>
                          <span className="text-sm font-bold text-gray-900">{player.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{player.xp} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teach' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-medium text-gray-700 mb-4">Teaching Statistics</h3>
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4"><Users className="w-8 h-8 text-blue-600" /></div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{dashboardStats?.teachingStats?.students || 0}</p>
                    <p className="text-sm text-gray-500">Total students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section with user info and learning style */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-8 shadow-lg relative overflow-hidden text-white border-0">
        <div className="absolute inset-0 bg-white opacity-10"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <div className="flex items-center">
              <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold mr-2 border border-white/20 shadow-sm uppercase tracking-wider">
                {user.role} Portal
              </span>
              {user.learningStyle && (
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium mr-2 border border-white/20 shadow-sm">
                  {user.learningStyle} Learner
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-md border border-white/20 p-2 rounded-lg mr-3 shadow-sm hover:scale-110 transition-transform cursor-pointer">
                <Flame className="text-orange-300 w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-sm opacity-90">Streak</p>
                <p className="font-bold text-xl">{user.streak} days</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-md border border-white/20 p-2 rounded-lg mr-3 shadow-sm hover:scale-110 transition-transform cursor-pointer">
                <Zap className="text-yellow-300 w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-sm opacity-90">XP</p>
                <p className="font-bold text-xl">{user.xp}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center">
              <div className="bg-white/20 backdrop-blur-md border border-white/20 p-2 rounded-lg mr-3 shadow-sm hover:scale-110 transition-transform cursor-pointer">
                <Award className="text-green-300 w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-sm opacity-90">Level</p>
                <p className="font-bold text-xl">{user.level}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {user.role === 'student' && renderStudentDashboard()}
      {user.role === 'teacher' && renderTeacherDashboard()}
      {user.role !== 'student' && user.role !== 'teacher' && renderDefaultDashboard()}

      <AnimatePresence>
        {showPeerModal && (
          <PeerModal 
            peer={selectedPeer} 
            isOpen={showPeerModal} 
            onClose={() => setShowPeerModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;