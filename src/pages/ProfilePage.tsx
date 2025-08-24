import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Award, 
  BookOpen, 
  Edit, 
  Calendar, 
  LogOut, 
  ChevronDown,
  Clock,
  BarChart3,
  Zap,
  Camera,
  MapPin,
  Mail,
  Link as LinkIcon,
  Flame,
  MoreHorizontal,
  Github,
  Linkedin,
  Twitter,
  Check,
  Users,
  Star,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type TabType = 'overview' | 'skills' | 'achievements' | 'sessions';

const ProfilePage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const navigate = useNavigate();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState("I'm a software developer passionate about frontend technologies like React and Vue. Currently learning AI and machine learning fundamentals. I love sharing knowledge and helping others grow!");

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please sign in</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  // Mock skills data
  const skills = [
    { name: 'JavaScript', level: 85, endorsements: 12 },
    { name: 'React', level: 78, endorsements: 8 },
    { name: 'UI/UX Design', level: 65, endorsements: 5 },
    { name: 'Node.js', level: 70, endorsements: 6 },
    { name: 'Python', level: 45, endorsements: 2 },
  ];
  
  // Mock achievement data
  const achievements = [
    { 
      id: 1, 
      name: 'Quick Learner', 
      description: 'Completed 5 courses in under 30 days', 
      icon: <Zap className="w-6 h-6 text-yellow-500" />, 
      date: 'Earned Sep 15, 2025' 
    },
    { 
      id: 2, 
      name: 'Helper', 
      description: 'Taught 10 different students', 
      icon: <Award className="w-6 h-6 text-blue-500" />, 
      date: 'Earned Oct 2, 2025' 
    },
    { 
      id: 3, 
      name: 'Streak Master', 
      description: 'Maintained a 30-day learning streak', 
      icon: <Flame className="w-6 h-6 text-orange-500" />, 
      date: 'In progress (25/30 days)' 
    },
  ];
  
  // Mock session data
  const sessions = [
    { 
      id: 1, 
      title: 'Advanced React Hooks', 
      role: 'learner', 
      partner: 'David Chen', 
      date: 'Sep 28, 2025', 
      time: '3:00 PM', 
      duration: '60 min',
      status: 'completed',
      rating: 5
    },
    { 
      id: 2, 
      title: 'JavaScript Basics', 
      role: 'teacher', 
      partner: 'Emily Chang', 
      date: 'Oct 2, 2025', 
      time: '2:30 PM', 
      duration: '45 min',
      status: 'completed',
      rating: 4
    },
    { 
      id: 3, 
      title: 'UI Design Principles', 
      role: 'learner', 
      partner: 'James Wilson', 
      date: 'Oct 15, 2025', 
      time: '4:00 PM', 
      duration: '60 min',
      status: 'upcoming'
    },
  ];

  // Mock learning stats
  const learningStats = {
    totalHours: 48,
    coursesCompleted: 7,
    sessionsAttended: 12,
    averageRating: 4.8
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
            <button className="absolute right-4 bottom-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          {/* Profile Info */}
          <div className="px-6 py-4 md:px-8 md:py-6 relative">
            <div className="flex flex-col md:flex-row">
              {/* Avatar */}
              <div className="flex-shrink-0 -mt-16 md:-mt-24 mr-0 md:mr-6 mb-4 md:mb-0 relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <User className="w-12 h-12 md:w-16 md:h-16" />
                  </div>
                </div>
                <button className="absolute right-0 bottom-0 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              {/* Profile Details */}
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user?.name}</h1>
                    <div className="flex items-center text-gray-600 mt-1">
                      <Mail className="w-4 h-4 mr-1" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">San Francisco, CA</span>
                    </div>
                  </div>
                  
                  <div className="flex mt-4 md:mt-0">
                    <button className="mr-2 flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      <Settings className="w-4 h-4 mr-1" />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
                
                {/* Bio */}
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 mb-2">About Me</h3>
                    <button 
                      onClick={() => setIsEditingBio(!isEditingBio)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      {isEditingBio ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Edit className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  {isEditingBio ? (
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">
                      {bio}
                    </p>
                  )}
                </div>
                
                {/* Learning Style & Stats */}
                <div className="flex flex-wrap -mx-2">
                  <div className="px-2 w-full md:w-auto mb-2 md:mb-0">
                    <div className="bg-blue-50 px-3 py-1.5 rounded-lg flex items-center">
                      <BookOpen className="w-4 h-4 text-blue-600 mr-1.5" />
                      <span className="text-sm font-medium text-blue-700">{user?.learningStyle} Learner</span>
                    </div>
                  </div>
                  
                  {user?.strengths && user?.strengths.map((strength, index) => (
                    <div key={index} className="px-2 w-full md:w-auto mb-2 md:mb-0">
                      <div className="bg-green-50 px-3 py-1.5 rounded-lg flex items-center">
                        <Award className="w-4 h-4 text-green-600 mr-1.5" />
                        <span className="text-sm font-medium text-green-700">{strength}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Stats Bar */}
            <div className="flex flex-wrap border-t border-gray-200 mt-6 pt-6">
              <div className="w-1/2 md:w-1/4 mb-4 md:mb-0">
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <Flame className="w-5 h-5 text-orange-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">{user?.streak}</span>
                  </div>
                  <span className="text-sm text-gray-600">Day Streak</span>
                </div>
              </div>
              <div className="w-1/2 md:w-1/4 mb-4 md:mb-0">
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">{user?.xp}</span>
                  </div>
                  <span className="text-sm text-gray-600">Experience Points</span>
                </div>
              </div>
              <div className="w-1/2 md:w-1/4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-blue-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">{user?.level}</span>
                  </div>
                  <span className="text-sm text-gray-600">Level</span>
                </div>
              </div>
              <div className="w-1/2 md:w-1/4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-purple-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">{user?.badges.length}</span>
                  </div>
                  <span className="text-sm text-gray-600">Badges Earned</span>
                </div>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex mt-4 pt-4 border-t border-gray-200">
              <a href="#" className="mr-4 text-gray-500 hover:text-gray-700 transition">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="mr-4 text-gray-500 hover:text-gray-700 transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="mr-4 text-gray-500 hover:text-gray-700 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition">
                <LinkIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                activeTab === 'skills'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Skills
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                activeTab === 'achievements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Sessions
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="mb-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Learning Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                    Learning Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {learningStats.totalHours}
                      </div>
                      <div className="text-sm text-gray-600">Total Hours</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {learningStats.coursesCompleted}
                      </div>
                      <div className="text-sm text-gray-600">Courses</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {learningStats.sessionsAttended}
                      </div>
                      <div className="text-sm text-gray-600">Sessions</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {learningStats.averageRating}
                      </div>
                      <div className="text-sm text-gray-600">Avg. Rating</div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Achievements */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                      <Award className="w-5 h-5 text-blue-600 mr-2" />
                      Recent Achievements
                    </h3>
                    <button 
                      onClick={() => setActiveTab('achievements')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-4">
                    {achievements.slice(0, 2).map((achievement) => (
                      <div key={achievement.id} className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {achievement.icon}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{achievement.name}</div>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <div className="text-xs text-gray-500 mt-1">{achievement.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Top Skills Preview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center">
                    <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                    Top Skills
                  </h3>
                  <button 
                    onClick={() => setActiveTab('skills')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all skills
                  </button>
                </div>
                <div className="space-y-4">
                  {skills.slice(0, 3).map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-gray-900">{skill.name}</div>
                        <div className="text-sm text-gray-600">{skill.level}%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Upcoming Sessions Preview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    Upcoming Sessions
                  </h3>
                  <button 
                    onClick={() => setActiveTab('sessions')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all sessions
                  </button>
                </div>
                {sessions.filter(s => s.status === 'upcoming').length > 0 ? (
                  <div className="space-y-4">
                    {sessions.filter(s => s.status === 'upcoming').map((session) => (
                      <div key={session.id} className="flex items-start p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer">
                        <div className="mr-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            session.role === 'teacher' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {session.role === 'teacher' ? 
                              <BookOpen className="w-5 h-5" /> : 
                              <BookOpen className="w-5 h-5" />
                            }
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium text-gray-900">{session.title}</div>
                          <div className="text-sm text-gray-600">
                            {session.role === 'teacher' ? 'Teaching' : 'Learning from'} {session.partner}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{session.date}</span>
                            <span className="mx-1">•</span>
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{session.time} ({session.duration})</span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No upcoming sessions</p>
                    <button className="mt-2 text-blue-600 font-medium hover:text-blue-800 transition">
                      Schedule a session
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">My Skills</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  Add New Skill
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {skills.map((skill, index) => (
                  <div 
                    key={index} 
                    className={`p-6 ${index !== skills.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-4 md:mb-0 md:mr-4">
                        <h3 className="font-medium text-gray-900 mb-1">{skill.name}</h3>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">Endorsements: {skill.endorsements}</span>
                          <div className="flex -space-x-1">
                            {[...Array(Math.min(3, skill.endorsements))].map((_, i) => (
                              <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border border-white"></div>
                            ))}
                            {skill.endorsements > 3 && (
                              <div className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center">
                                <span className="text-xs text-gray-500">+{skill.endorsements - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow md:max-w-md">
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-xs font-medium text-gray-700">
                            Proficiency Level: {skill.level}%
                          </div>
                          <div className="text-xs font-medium text-gray-500">
                            {skill.level < 40 ? 'Beginner' : 
                             skill.level < 70 ? 'Intermediate' : 
                             'Advanced'}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              skill.level < 40 ? 'bg-blue-400' : 
                              skill.level < 70 ? 'bg-blue-500' : 
                              'bg-blue-600'
                            }`}
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-4 flex">
                        <button className="text-gray-400 hover:text-gray-600 mr-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">Looking to Learn</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center group hover:bg-gray-200 transition cursor-pointer">
                    <span>Machine Learning</span>
                    <X className="w-4 h-4 ml-1 text-gray-500 group-hover:text-gray-700" />
                  </div>
                  <div className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center group hover:bg-gray-200 transition cursor-pointer">
                    <span>TypeScript</span>
                    <X className="w-4 h-4 ml-1 text-gray-500 group-hover:text-gray-700" />
                  </div>
                  <div className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center group hover:bg-gray-200 transition cursor-pointer">
                    <span>GraphQL</span>
                    <X className="w-4 h-4 ml-1 text-gray-500 group-hover:text-gray-700" />
                  </div>
                  <button className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-500 rounded-full text-sm flex items-center hover:border-blue-500 hover:text-blue-600 transition">
                    + Add Interest
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">{user?.badges.length}</div>
                      <div className="text-sm text-gray-600">Badges Earned</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Next Badge: Course Creator</div>
                    <div className="text-xs text-blue-600 mt-1">2/3 requirements completed</div>
                    <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '66%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">{user?.xp}</div>
                      <div className="text-sm text-gray-600">Experience Points</div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-green-800">Level {user?.level} • {user?.xp}/300 XP</div>
                    <div className="text-xs text-green-600 mt-1">50 XP until next level</div>
                    <div className="w-full bg-green-200 rounded-full h-1.5 mt-2">
                      <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${(user?.xp % 100) / 3}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                      <Flame className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">{user?.streak}</div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-orange-800">Next milestone: 7-day streak</div>
                    <div className="text-xs text-orange-600 mt-1">{7 - (user?.streak || 0)} days to go</div>
                    <div className="w-full bg-orange-200 rounded-full h-1.5 mt-2">
                      <div className="bg-orange-600 h-1.5 rounded-full" style={{ width: `${(user?.streak || 0) / 7 * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="font-bold text-gray-900">All Achievements</h3>
                </div>
                {achievements.map((achievement, index) => (
                  <div 
                    key={achievement.id} 
                    className={`p-6 ${index !== achievements.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          {achievement.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{achievement.name}</h4>
                        <p className="text-gray-600 text-sm mb-1">{achievement.description}</p>
                        <p className="text-gray-500 text-xs">{achievement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Available Achievements</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Knowledge Sharer</h4>
                      <p className="text-gray-600 text-sm mb-1">Create and publish 3 learning resources</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Progress: 0/3</span>
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full ml-2">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Community Builder</h4>
                      <p className="text-gray-600 text-sm mb-1">Connect with 10 peers in your learning network</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Progress: 4/10</span>
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full ml-2">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">My Sessions</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  Schedule New Session
                </button>
              </div>
              
              <div className="flex border-b border-gray-200 mb-4">
                <button className="py-2 px-4 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                  All Sessions
                </button>
                <button className="py-2 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Upcoming
                </button>
                <button className="py-2 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Completed
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {sessions.map((session, index) => (
                  <div 
                    key={session.id} 
                    className={`p-6 ${index !== sessions.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-gray-900 mr-2">{session.title}</h3>
                          <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                            session.status === 'upcoming' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {session.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span>{session.role === 'teacher' ? 'Teaching' : 'Learning from'}</span>
                          <span className="font-medium ml-1">{session.partner}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-4 md:mb-0">
                        <div className="flex items-center mr-6">
                          <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-600">{session.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-600">{session.time} ({session.duration})</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {session.status === 'upcoming' ? (
                          <>
                            <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm">
                              Reschedule
                            </button>
                            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                              Join
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center mr-2">
                              <span className="text-sm text-gray-700 mr-1">Rating:</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < (session.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm">
                              View Notes
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;