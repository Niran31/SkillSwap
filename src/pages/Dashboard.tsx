import React, { useState } from 'react';
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
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Defining tabs
type TabType = 'learn' | 'teach';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const { user, setUser } = useAuth();
  
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
        
      fetchSessions();
    }
  }, [user?.id, setUser]);
  
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [teachingSessions, setTeachingSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

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

  const recommendedSkills = dashboardStats?.recommendedSkills || [];
  const teachingOpportunities = dashboardStats?.teachingOpportunities || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section with user info and learning style */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-8 shadow-lg relative overflow-hidden text-white border-0">
        <div className="absolute inset-0 bg-white opacity-10"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <div className="flex items-center">
              {user.learningStyle && (
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium mr-2 border border-white/20 shadow-sm">
                  {user.learningStyle} Learner
                </span>
              )}
              {user.strengths && user.strengths.map((strength, index) => (
                <span key={index} className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium mr-2 border border-white/20 shadow-sm">
                  {strength}
                </span>
              ))}
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

      {/* Tab Switching */}
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

      {/* Learn Mode Content */}
      {activeTab === 'learn' && (
        <div className="space-y-8">
          {/* Progress Overview */}
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
                {user.badges.map((badge, index) => (
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
                {[...Array(Math.max(0, 6 - user.badges.length))].map((_, index) => (
                  <div key={`empty-${index}`} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Award className="w-6 h-6 text-gray-300" />
                    </div>
                    <span className="text-xs text-gray-400 text-center mt-2">Locked</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Skills */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
              <Link to="#" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                View all
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            
            {recommendedSkills.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No recommendations yet</h3>
                <p className="text-gray-500 mb-4">Complete your profile and add skills to get personalized recommendations.</p>
                <Link to="/profile" className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                  Update Profile
                </Link>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedSkills.map((skill) => (
                <div key={skill.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="h-40 relative">
                    <img 
                      src={skill.image} 
                      alt={skill.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 text-xs font-bold text-blue-600 shadow">
                      {skill.matchScore}% Match
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{skill.title}</h3>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mr-2">
                        {skill.category}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {skill.difficulty}
                      </span>
                    </div>
                    <Link to="/question-generator" className="block w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-center">
                      Start Learning
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
              <Link to="/peer-matching" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Schedule more
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            
            {isLoadingSessions ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 flex justify-center">
                 <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No upcoming sessions</h3>
                <p className="text-gray-500 mb-4">Schedule a session with a peer or teacher to get started</p>
                <Link 
                  to="/peer-matching"
                  className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Find Peers
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="font-bold text-gray-900 mb-1">{session.topic || session.title}</h3>
                        <p className="text-gray-600 text-sm">with {session.teacherName}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-600">{session.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-600">{session.time} ({session.duration})</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4 md:mt-0">
                        <button className="px-3 py-1.5 bg-white border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition text-sm">
                          Reschedule
                        </button>
                        <button className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-sm">
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teach Mode Content */}
      {activeTab === 'teach' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-medium text-gray-700 mb-4">Teaching Statistics</h3>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{dashboardStats?.teachingStats?.students || 0}</p>
                  <p className="text-sm text-gray-500">Total students</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-medium text-gray-700 mb-4">Teaching Rating</h3>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{dashboardStats?.teachingStats?.rating || 0}/5</p>
                  <p className="text-sm text-gray-500">From reviews</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-medium text-gray-700 mb-4">Total Earnings</h3>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <div className="text-purple-600 font-bold">$</div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{dashboardStats?.teachingStats?.earnings || '$0'}</p>
                  <p className="text-sm text-gray-500">This month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Teaching Opportunities */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Teaching Skills</h2>
              <Link to="/profile" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Add new skill
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            
            {teachingOpportunities.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No teaching skills yet</h3>
                <p className="text-gray-500 mb-4">Add skills to your profile to start teaching others on the platform.</p>
                <Link to="/profile" className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                  Add Skills
                </Link>
              </div>
            ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skill
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requests
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active Students
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Earnings
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teachingOpportunities.map((opportunity) => (
                      <tr key={opportunity.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{opportunity.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{opportunity.requests} new</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{opportunity.students}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{opportunity.earnings}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to="/peer-matching" className="text-blue-600 hover:text-blue-900 mr-3">View</Link>
                          <Link to="/profile" className="text-green-600 hover:text-green-900">Manage</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>

          {/* Create New Course */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h2 className="text-2xl font-bold text-white mb-2">Share Your Knowledge</h2>
                <p className="text-green-100">
                  Create a course and start teaching others. Our AI will help match you with 
                  the perfect students for your teaching style.
                </p>
              </div>
              <button className="px-6 py-3 bg-white text-green-600 font-medium rounded-lg hover:shadow-lg transition transform hover:-translate-y-1 whitespace-nowrap flex items-center justify-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Create Course
              </button>
            </div>
          </div>

          {/* Upcoming Teaching Sessions */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Teaching Sessions</h2>
              <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Manage Schedule
                <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>
            
            {isLoadingSessions ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 flex justify-center">
                 <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : teachingSessions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No upcoming teaching sessions</h3>
                <p className="text-gray-500 mb-4">You have no scheduled teaching sessions right now.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teachingSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{session.topic}</h3>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center text-xs">{session.learnerName.charAt(0)}</div>
                      <p className="text-gray-600 text-sm">Student: {session.learnerName}</p>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    1-on-1
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
                    {session.date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-500" />
                    {session.time} ({session.duration})
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 py-2 bg-white border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition text-sm">
                    Materials
                  </button>
                  <button className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-sm">
                    Start Session
                  </button>
                </div>
              </div>
              ))}
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;