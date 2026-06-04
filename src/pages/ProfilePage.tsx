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
  X,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'overview' | 'skills' | 'achievements' | 'sessions' | 'saved-questions';

const ProfilePage: React.FC = () => {
  const { user, setUser, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const navigate = useNavigate();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || "I'm a passionate learner on SkillSwap!");
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [learningStats, setLearningStats] = useState({
    totalHours: 0,
    coursesCompleted: user?.badges?.length || 0,
    sessionsAttended: 0,
    averageRating: 0
  });

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState(50);
  
  const [savedQuestions, setSavedQuestions] = useState<any[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  
  // Interactive Practice Mode states
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});


  React.useEffect(() => {
    if (user?.id) {
      setBio(user.bio || "I'm a passionate learner on SkillSwap!");
      // Fetch user's sessions
      axios.get(`/api/sessions/${user.id}`).then(res => {
        const fetchedSessions = res.data.sessions || [];
        setUserSessions(fetchedSessions);
        setLearningStats(prev => ({
          ...prev,
          sessionsAttended: fetchedSessions.length,
          totalHours: Math.round(fetchedSessions.length * 1.5)
        }));
      }).catch(err => console.error("Error fetching sessions:", err));

      // Fetch saved questions
      setIsLoadingSaved(true);
      axios.get(`/api/ai/saved/${user.id}`).then(res => {
        setSavedQuestions(res.data.questions || []);
      }).catch(err => console.error("Error fetching saved questions:", err))
        .finally(() => setIsLoadingSaved(false));
    }
  }, [user]);


  // Dynamic learning style data for visualizer
  const dominantStyle = user?.learningStyle || 'Visual';
  const strengths = user?.strengths || [];
  const cognitiveStyles = [
    { 
      name: 'Visual Modal', 
      description: 'Understanding via diagrams, flowcharts, spatial reasoning, and visual learning aids.', 
      value: dominantStyle === 'Visual' ? 95 : (strengths.includes('Visual') ? 80 : 50),
      color: 'from-blue-500 to-cyan-400',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      name: 'Logical-Mathematical Modal', 
      description: 'Analyzing complex systems, logic statements, code syntax, and numeric patterns.', 
      value: dominantStyle === 'Logical-Mathematical' || dominantStyle === 'Logical' ? 95 : (strengths.includes('Logical-Mathematical') || strengths.includes('Logical') ? 80 : 70),
      color: 'from-green-500 to-emerald-400',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      name: 'Auditory/Verbal Modal', 
      description: 'Retaining information through vocal discussions, peer explanations, and spoken word.', 
      value: dominantStyle === 'Auditory' || dominantStyle === 'Auditory/Verbal' ? 95 : (strengths.includes('Auditory') || strengths.includes('Auditory/Verbal') ? 80 : 45),
      color: 'from-purple-500 to-indigo-400',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      name: 'Kinesthetic/Active Modal', 
      description: 'Hands-on practice, physical trial-and-error, code compilation, and concrete building.', 
      value: dominantStyle === 'Kinesthetic' || dominantStyle === 'Kinesthetic/Active' ? 95 : (strengths.includes('Kinesthetic') || strengths.includes('Kinesthetic/Active') ? 80 : 60),
      color: 'from-pink-500 to-rose-400',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  const saveBio = async () => {
    try {
      const response = await axios.put(`/api/auth/profile/${user?.id}`, { bio });
      setIsEditingBio(false);
      toast.success('Bio updated successfully!');
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('skillswap_user', JSON.stringify(response.data.user));
      } else if (user) {
        const updatedUser = { ...user, bio };
        setUser(updatedUser);
        localStorage.setItem('skillswap_user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      toast.error('Failed to update bio.');
    }
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) {
      toast.error('Skill name cannot be empty');
      return;
    }
    const currentSkills = user?.customSkills || [];
    let updatedSkills = [...currentSkills];
    
    if (editingSkillIndex !== null) {
      updatedSkills[editingSkillIndex] = { name: skillName.trim(), level: Number(skillLevel) };
    } else {
      const existsIndex = currentSkills.findIndex(s => s.name.toLowerCase() === skillName.trim().toLowerCase());
      if (existsIndex > -1) {
        updatedSkills[existsIndex] = { name: skillName.trim(), level: Number(skillLevel) };
      } else {
        updatedSkills.push({ name: skillName.trim(), level: Number(skillLevel) });
      }
    }

    try {
      const response = await axios.put(`/api/auth/profile/${user?.id}`, { customSkills: updatedSkills });
      toast.success(editingSkillIndex !== null ? 'Skill updated!' : 'Skill added!');
      setShowSkillModal(false);
      setSkillName('');
      setSkillLevel(50);
      setEditingSkillIndex(null);
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('skillswap_user', JSON.stringify(response.data.user));
      } else if (user) {
        const updatedUser = { ...user, customSkills: updatedSkills };
        setUser(updatedUser);
        localStorage.setItem('skillswap_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      toast.error('Failed to save skill.');
    }
  };

  const handleDeleteSkill = async (index: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    const currentSkills = user?.customSkills || [];
    const updatedSkills = currentSkills.filter((_, i) => i !== index);

    try {
      const response = await axios.put(`/api/auth/profile/${user?.id}`, { customSkills: updatedSkills });
      toast.success('Skill deleted!');
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('skillswap_user', JSON.stringify(response.data.user));
      } else if (user) {
        const updatedUser = { ...user, customSkills: updatedSkills };
        setUser(updatedUser);
        localStorage.setItem('skillswap_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      toast.error('Failed to delete skill.');
    }
  };

  const openAddSkill = () => {
    setSkillName('');
    setSkillLevel(50);
    setEditingSkillIndex(null);
    setShowSkillModal(true);
  };

  const openEditSkill = (index: number) => {
    const skill = user?.customSkills?.[index];
    if (skill) {
      setSkillName(skill.name);
      setSkillLevel(skill.level);
      setEditingSkillIndex(index);
      setShowSkillModal(true);
    }
  };

  const handleDeleteSavedQuestion = async (questionId: string) => {

    if (!confirm('Are you sure you want to delete this saved question?')) return;
    try {
      await axios.delete(`/api/ai/saved/${questionId}`);
      toast.success('Saved question deleted!');
      setSavedQuestions(prev => prev.filter(q => q._id !== questionId && q.id !== questionId));
      
      // Cleanup answer tracking
      if (selectedAnswers[questionId]) {
        const updated = { ...selectedAnswers };
        delete updated[questionId];
        setSelectedAnswers(updated);
      }
    } catch (err) {
      console.error('Failed to delete saved question:', err);
      toast.error('Failed to delete saved question.');
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string, correctAnswer: string) => {
    if (selectedAnswers[questionId]) return; // Already answered
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    if (answer === correctAnswer) {
      toast.success('Correct answer! Good job!');
    } else {
      toast.error(`Incorrect! The correct answer is: ${correctAnswer}`);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    toast.success('Quiz reset! Try practicing again.');
  };


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

  // Mock achievement logic fallback
  const achievements = [
    { 
      id: 1, 
      name: 'Quick Learner', 
      description: 'Engaged seamlessly on the platform.', 
      icon: <Zap className="w-6 h-6 text-yellow-500" />, 
      date: 'Earned' 
    }
  ];

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
                      onClick={() => {
                        if (isEditingBio) saveBio();
                        else setIsEditingBio(true);
                      }}
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
            <button
              onClick={() => setActiveTab('saved-questions' as TabType)}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                activeTab === ('saved-questions' as TabType)
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Saved Questions
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

              {/* Cognitive Profile Visualizer */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <BarChart3 className="w-5 h-5 text-indigo-600 mr-2" />
                  Cognitive Learning Profile
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  SkillSwap's cognitive analysis of your learning habits, visual retention, logical reasoning, and active coding feedback.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cognitiveStyles.map((style, idx) => {
                    const isDominant = style.name.startsWith(dominantStyle);
                    return (
                      <div key={idx} className={`p-4 rounded-xl border transition-all ${isDominant ? 'border-indigo-200 bg-indigo-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-900 flex items-center">
                            {style.name}
                            {isDominant && (
                              <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full animate-pulse">
                                Dominant Modality
                              </span>
                            )}
                          </span>
                          <span className={`text-sm font-bold ${style.textColor}`}>{style.value}%</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{style.description}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${style.value}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className={`h-full bg-gradient-to-r ${style.color} rounded-full`}
                          />
                        </div>
                      </div>
                    );
                  })}
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
                  {(user?.customSkills && user.customSkills.length > 0 ? user.customSkills : []).slice(0, 3).map((skill, index) => (
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
                  {(!user?.customSkills || user.customSkills.length === 0) && (
                    <div className="text-gray-500 text-sm">Add some skills to track your progress!</div>
                  )}
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
                {userSessions.filter(s => s.status === 'upcoming' || s.status === 'scheduled').length > 0 ? (
                  <div className="space-y-4">
                    {userSessions.filter(s => s.status === 'upcoming' || s.status === 'scheduled').map((session) => (
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
                          <div className="font-medium text-gray-900">{session.topic || session.title}</div>
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
                    <button 
                      onClick={() => navigate('/peer-matching')}
                      className="mt-2 text-blue-600 font-medium hover:text-blue-800 transition"
                    >
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
                <button 
                  onClick={openAddSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Add New Skill
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {(!user?.customSkills || user.customSkills.length === 0) ? (
                  <div className="p-6 text-center text-gray-500">No skills added yet. Click "Add New Skill" to start!</div>
                ) : (
                  user?.customSkills.map((skill, index) => (
                    <div 
                      key={index} 
                      className={`p-6 ${index !== user.customSkills!.length - 1 ? 'border-b border-gray-200' : ''}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-4 md:mb-0 md:mr-4">
                          <h3 className="font-medium text-gray-900 mb-1">{skill.name}</h3>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">Endorsements: 0</span>
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
                          <button 
                            onClick={() => openEditSkill(index)}
                            className="text-gray-400 hover:text-gray-600 mr-2"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSkill(index)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                <button 
                  onClick={() => navigate('/peer-matching')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
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
                {userSessions.map((session, index) => (
                  <div 
                    key={session.id || index} 
                    className={`p-6 ${index !== userSessions.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-gray-900 mr-2">{session.topic || session.title}</h3>
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

          {/* Saved Questions Tab */}
          {activeTab === 'saved-questions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Saved Study Hub</h2>
                  <p className="text-sm text-gray-600">Review bookmarks or practice them in interactive Quiz Mode.</p>
                </div>
                <div className="flex space-x-3 w-full sm:w-auto">
                  {savedQuestions.length > 0 && (
                    <button
                      onClick={() => {
                        setPracticeMode(!practiceMode);
                        setSelectedAnswers({});
                      }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
                        practiceMode 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md hover:bg-indigo-700' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {practiceMode ? 'Exit Practice Mode' : 'Practice Quiz Mode'}
                    </button>
                  )}
                  <button 
                    onClick={() => navigate('/question-generator')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    Generate More
                  </button>
                </div>
              </div>
              
              {isLoadingSaved ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 flex justify-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : savedQuestions.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                  <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium text-gray-700">No bookmarked questions yet</p>
                  <p className="text-gray-500 text-sm mt-1">Generate questions using the AI generator and bookmark them to study later.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {practiceMode && (
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Practice Score</span>
                        <h4 className="text-lg font-bold text-indigo-950">
                          {Object.keys(selectedAnswers).length} / {savedQuestions.length} Answered
                        </h4>
                      </div>
                      {Object.keys(selectedAnswers).length > 0 && (
                        <button
                          onClick={handleResetQuiz}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                        >
                          Reset Quiz
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    {savedQuestions.map((q, index) => {
                      const questionId = q._id || String(index);
                      const isAnswered = !!selectedAnswers[questionId];
                      const selectedOpt = selectedAnswers[questionId];
                      
                      return (
                        <div key={questionId} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition relative group">
                          {/* Remove button */}
                          <button
                            onClick={() => handleDeleteSavedQuestion(q._id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                            title="Remove from saved"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="flex justify-between items-start mb-2 pr-8">
                            <span className="text-xs font-semibold bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                              {q.topic}
                            </span>
                            <span className="text-xs text-gray-400">
                              {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Just now'}
                            </span>
                          </div>

                          <h4 className="font-semibold text-gray-900 text-base mb-3 pr-6">{q.questionText}</h4>
                          
                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                              {q.options.map((opt: string, i: number) => {
                                const isCorrectOpt = opt === q.correctAnswer;
                                const isChosenOpt = opt === selectedOpt;
                                
                                let optClass = "border-gray-200 text-gray-700 bg-white hover:border-gray-300 hover:bg-gray-50 cursor-pointer";
                                
                                if (practiceMode) {
                                  if (isAnswered) {
                                    if (isCorrectOpt) {
                                      optClass = "border-green-500 bg-green-50 text-green-700 font-semibold cursor-default";
                                    } else if (isChosenOpt) {
                                      optClass = "border-red-500 bg-red-50 text-red-700 font-semibold cursor-default";
                                    } else {
                                      optClass = "border-gray-200 text-gray-400 bg-gray-50/50 cursor-default";
                                    }
                                  } else {
                                    optClass = "border-indigo-150 text-indigo-950 bg-indigo-50/20 hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer";
                                  }
                                } else {
                                  // Study sheet view
                                  if (isCorrectOpt) {
                                    optClass = "border-green-500 bg-green-50 text-green-700 font-semibold";
                                  }
                                }

                                return (
                                  <button 
                                    key={i} 
                                    disabled={practiceMode && isAnswered}
                                    onClick={() => practiceMode && handleSelectAnswer(questionId, opt, q.correctAnswer)}
                                    className={`p-2.5 rounded-lg border text-left text-sm transition-all flex justify-between items-center w-full ${optClass}`}
                                  >
                                    <span>{opt}</span>
                                    {practiceMode && isAnswered && isCorrectOpt && (
                                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    )}
                                    {practiceMode && isAnswered && isChosenOpt && !isCorrectOpt && (
                                      <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {(!practiceMode || isAnswered) && q.explanation && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="p-3 bg-blue-50/50 text-sm text-gray-700 rounded-lg border-l-4 border-blue-500 mt-2"
                            >
                              <strong>Explanation:</strong> {q.explanation}
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Skill Modal */}
      <AnimatePresence>
        {showSkillModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSkillModal(false)}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative z-10 p-6"
            >
              <button 
                onClick={() => setShowSkillModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingSkillIndex !== null ? 'Edit Skill' : 'Add New Skill'}
              </h2>

              <form onSubmit={handleSaveSkill} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    required
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    placeholder="e.g. React, Python, UI Design"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proficiency Level ({skillLevel}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSkillModal(false)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    Save Skill
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;