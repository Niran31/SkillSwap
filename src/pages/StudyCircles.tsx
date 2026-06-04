import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Bot, 
  Sparkles, 
  Send, 
  Brain, 
  Plus, 
  Award, 
  Zap, 
  Check,
  ChevronRight,
  BookOpen,
  Code,
  User,
  Activity,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { StudyCircle, StudyCircleMilestone } from '../types';

let socket: Socket;

// Style mappings for learning styles
const learningStyleStyles: Record<string, { bg: string; text: string; border: string; desc: string; icon: any }> = {
  Visual: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    desc: 'Learns best with diagrams, flowcharts, and layout hierarchies.',
    icon: Sparkles
  },
  Logical: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    desc: 'Excels with step-by-step logic, code loops, and backend structures.',
    icon: Code
  },
  Kinesthetic: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    desc: 'Flourishes with hands-on coding sandbox tests and building interactive mocks.',
    icon: Zap
  },
  Auditory: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    desc: 'Flourishes with talking through code structure, analogies, and mnemonic reminders.',
    icon: Brain
  }
};

const StudyCircles: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [circles, setCircles] = useState<StudyCircle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<StudyCircle | null>(null);
  const [isLoadingCircles, setIsLoadingCircles] = useState(true);
  
  // Matchmaking lobby states
  const [isMatching, setIsMatching] = useState(false);
  const [matchTopic, setMatchTopic] = useState('React Development');
  const [matchStep, setMatchStep] = useState(0);

  // Chat panel states
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // AI Mentor states
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Active sub-tab in workspace: 'roster' | 'milestones' | 'chat' | 'mentor'
  const [activeTab, setActiveTab] = useState<'roster' | 'milestones' | 'chat' | 'mentor'>('roster');

  const matchSteps = [
    "Scanning user profiles seeking common learning topic interest...",
    "Analyzing user cognitive profiles (Visual, Logical, Kinesthetic, Auditory)...",
    "Selecting complementary peers to optimize cohort synergy...",
    "Structuring shared roadmap milestones & group workspace...",
    "Creating real-time communication channel...",
    "Success! Circle assembled."
  ];

  // Fetch circles list
  const fetchCircles = async () => {
    if (!user) return;
    setIsLoadingCircles(true);
    try {
      const res = await axios.get(`/api/study-circles/user/${user.id}`);
      setCircles(res.data.circles || []);
      if (res.data.circles && res.data.circles.length > 0 && !selectedCircle) {
        setSelectedCircle(res.data.circles[0]);
      }
    } catch (err) {
      console.error("Error fetching study circles:", err);
      toast.error("Failed to load study circles");
    } finally {
      setIsLoadingCircles(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCircles();
    }
  }, [user]);

  // Load chat history & initialize socket room when selectedCircle changes
  useEffect(() => {
    if (!selectedCircle || !user) return;

    setIsChatLoading(true);
    // Fetch historical messages
    axios.get(`/api/messages/${selectedCircle.chatRoomId}`)
      .then(res => {
        setChatHistory(res.data.messages || []);
      })
      .catch(err => {
        console.error("Error fetching chat history:", err);
      })
      .finally(() => {
        setIsChatLoading(false);
      });

    // Setup socket
    socket = io();
    socket.emit('join_room', selectedCircle.chatRoomId);

    socket.on('receive_message', (data: any) => {
      // Check if message belongs to current room
      if (data.room === selectedCircle.chatRoomId) {
        setChatHistory(prev => [...prev, data]);
      }
    });

    // Reset AI panel
    setAiQuestion('');
    setAiAnswer(null);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [selectedCircle, user]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, activeTab]);

  // Handle Matchmaking Simulation
  const handleMatchStart = async () => {
    setIsMatching(true);
    setMatchStep(0);

    // Simulated stepping increments
    const interval = setInterval(() => {
      setMatchStep(prev => {
        if (prev >= matchSteps.length - 2) {
          clearInterval(interval);
          return prev + 1;
        }
        return prev + 1;
      });
    }, 1500);

    try {
      // Call backend matcher
      const res = await axios.post('/api/study-circles/match', {
        userId: user?.id,
        topic: matchTopic
      });

      // Wait a moment for final step animation
      setTimeout(() => {
        clearInterval(interval);
        setMatchStep(matchSteps.length - 1);
        
        setTimeout(() => {
          setIsMatching(false);
          setCircles(prev => [res.data.circle, ...prev]);
          setSelectedCircle(res.data.circle);
          setActiveTab('roster');
          toast.success("Joined new Study Circle!");
          fetchCircles();
        }, 1200);
      }, 1000);

    } catch (err) {
      clearInterval(interval);
      setIsMatching(false);
      console.error("Error matching circle:", err);
      toast.error("Failed to match study circle. Please try again.");
    }
  };

  // Toggle milestone completion
  const handleToggleMilestone = async (milestoneId: string) => {
    if (!selectedCircle || !user) return;

    try {
      const res = await axios.patch(`/api/study-circles/${selectedCircle._id || selectedCircle.id}/milestones/${milestoneId}`, {
        userId: user.id
      });
      
      const updatedCircle = res.data.circle;
      setSelectedCircle(updatedCircle);
      setCircles(prev => prev.map(c => (c._id === updatedCircle._id || c.id === updatedCircle.id) ? updatedCircle : c));
      toast.success("Milestone updated!");
    } catch (err) {
      console.error("Failed to update milestone:", err);
      toast.error("Failed to toggle milestone progress");
    }
  };

  // Send Chat Message
  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedCircle || !user) return;

    const now = new Date();
    const timeStr = now.getHours() + ":" + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    
    const messageData = {
      room: selectedCircle.chatRoomId,
      author: user.id,
      authorName: user.name,
      message: chatMessage,
      time: timeStr
    };

    socket.emit('send_message', messageData);
    setChatHistory(prev => [...prev, messageData]);
    setChatMessage('');
  };

  // Ask AI Guide / Mentor
  const handleAskMentor = async () => {
    if (!aiQuestion.trim() || !selectedCircle) return;

    setIsAiLoading(true);
    setAiAnswer(null);
    try {
      const res = await axios.post(`/api/study-circles/${selectedCircle._id || selectedCircle.id}/ask-mentor`, {
        question: aiQuestion
      });
      setAiAnswer(res.data.answer);
      toast.success("AI Mentor guidance ready!");
    } catch (err) {
      console.error("Failed to ask AI mentor:", err);
      toast.error("Mentor bot is experiencing high traffic. Try again shortly.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-md">
          <Brain className="w-12 h-12 mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Student Authentication Required</h2>
          <p className="text-gray-400 mb-6">
            Access to AI Study Circles is restricted to registered members. Log in as a student to join active learning cohorts.
          </p>
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const calculateCircleProgress = (circle: StudyCircle) => {
    if (!circle.milestones || circle.milestones.length === 0) return 0;
    
    // Group milestone progress - total completions divided by (members count * milestones count)
    // Or simpler: has at least one person completed the milestone?
    // Let's compute average progress across the members.
    // For a specific user (current user): how many has the current user completed?
    if (!user) return 0;
    const completedCount = circle.milestones.filter(m => m.completedBy.includes(user.id)).length;
    return Math.round((completedCount / circle.milestones.length) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-white">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            AI Study Circles
          </h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">
            Collaborative cohort matching harmonizing Visual, Logical, and Kinesthetic cognitive profiles.
          </p>
        </div>
        
        {/* Matchmaker Start Button */}
        {!isMatching && (
          <button
            onClick={() => setIsMatching(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg border border-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            Match New Circle
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Matchmaking Lobby Screen */}
        {isMatching ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900/60 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" />
            
            <div className="text-center mb-8">
              <Brain className="w-16 h-16 mx-auto text-indigo-400 animate-bounce mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Cognitive Matchmaker</h2>
              <p className="text-gray-400 max-w-md mx-auto text-sm">
                Select your focus topic. Our algorithm matches you with students having complementary learning styles (Visual, Logical, Kinesthetic, Auditory).
              </p>
            </div>

            {matchStep === 0 ? (
              <div className="space-y-6 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Study Focus Topic</label>
                  <select
                    value={matchTopic}
                    onChange={(e) => setMatchTopic(e.target.value)}
                    className="w-full bg-gray-850 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="React Development">React Development (Hooks, States, Components)</option>
                    <option value="Python Data Structures">Python Data Structures (Binary Trees, Big-O)</option>
                    <option value="JavaScript Basics">JavaScript Basics (DOM, ES6, Async)</option>
                    <option value="CSS & UI Design">CSS & UI Design (Layouts, Animations, UX)</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setIsMatching(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl border border-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMatchStart}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl border border-indigo-500 transition shadow-lg shadow-indigo-600/20"
                  >
                    Begin Matching
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 max-w-md mx-auto py-4">
                {/* Simulated Match Progress */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span>Searching Peer Pool</span>
                    <span>{Math.round(((matchStep + 1) / matchSteps.length) * 100)}%</span>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${((matchStep + 1) / matchSteps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Processing Logs */}
                <div className="bg-gray-950/80 rounded-xl p-4 border border-gray-800 h-36 overflow-y-auto flex flex-col justify-end space-y-2">
                  {matchSteps.slice(0, matchStep + 1).map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-xs flex items-center gap-2 ${idx === matchStep ? 'text-indigo-400 font-medium' : 'text-gray-500'}`}
                    >
                      {idx === matchSteps.length - 1 ? (
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : idx === matchStep ? (
                        <Activity className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
                      ) : (
                        <Check className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                      <span>{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Normal Dashboard Workspace View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Circle Selector */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">Your Cohorts</h3>
              
              {isLoadingCircles ? (
                <div className="space-y-3">
                  {[1, 2].map(n => (
                    <div key={n} className="bg-gray-900/40 border border-gray-800 rounded-2xl h-24 animate-pulse" />
                  ))}
                </div>
              ) : circles.length === 0 ? (
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 text-center text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm">You are not in any study circles. Click "Match New Circle" above to match with learning peers!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {circles.map(circle => {
                    const isSelected = selectedCircle?._id === circle._id || selectedCircle?.id === circle.id;
                    const progress = calculateCircleProgress(circle);
                    return (
                      <div
                        key={circle._id || circle.id}
                        onClick={() => setSelectedCircle(circle)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden flex flex-col gap-2 ${
                          isSelected 
                            ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/40 shadow-lg shadow-indigo-950/20' 
                            : 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/40'
                        }`}
                      >
                        {isSelected && <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />}
                        
                        <div>
                          <h4 className="font-bold text-white text-base truncate">{circle.name}</h4>
                          <span className="text-xs text-gray-400 block truncate mt-0.5">{circle.topic}</span>
                        </div>

                        {/* Progress Gauge */}
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-gray-400">
                            <span>Your Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700 text-indigo-300">
                            {circle.members.length} members
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Main Cohort Activity Workspace */}
            <div className="lg:col-span-8">
              {selectedCircle ? (
                <div className="bg-gray-900/60 border border-gray-800 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl">
                  
                  {/* Circle Header Details */}
                  <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900/80 to-indigo-950/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-bold text-white">{selectedCircle.name}</h2>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Focusing on study circle topic: <span className="text-indigo-300">{selectedCircle.topic}</span></p>
                    </div>

                    {/* Circle Navigation tabs */}
                    <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
                      {(['roster', 'milestones', 'chat', 'mentor'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                            activeTab === tab 
                              ? 'bg-indigo-600 text-white shadow' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Contents */}
                  <div className="p-6 min-h-[480px] flex flex-col">
                    
                    {/* Tab 1: Member Roster & Cognitive Map */}
                    {activeTab === 'roster' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Brain className="w-5 h-5 text-indigo-400" />
                            Cognitive Learning Synergy Map
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            This circle has been calibrated with complementary mental representations to enhance peer-to-peer tutoring efficiency.
                          </p>
                        </div>

                        {/* Members Card Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedCircle.memberDetails?.map(member => {
                            const styleData = learningStyleStyles[member.learningStyle || 'Visual'];
                            const isMe = member.id === user?.id;
                            const StyleIcon = styleData ? styleData.icon : Sparkles;
                            
                            return (
                              <div
                                key={member.id}
                                className={`p-4 rounded-2xl border flex flex-col gap-3 relative overflow-hidden ${
                                  isMe 
                                    ? 'bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/30' 
                                    : 'bg-gray-950/60 border-gray-850'
                                }`}
                              >
                                {isMe && (
                                  <span className="absolute top-2 right-2 text-[9px] bg-indigo-500 text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}

                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 text-gray-300">
                                    <User className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-white text-sm">{member.name}</h4>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${styleData?.bg} ${styleData?.text} ${styleData?.border}`}>
                                        <StyleIcon className="w-3 h-3" />
                                        {member.learningStyle} Learner
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-xs text-gray-400 bg-gray-900/40 p-2.5 rounded-xl border border-gray-800">
                                  {styleData?.desc || "Completes studies using modular lesson frameworks."}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Interactive Synergy explanation */}
                        <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4">
                          <h4 className="text-sm font-semibold text-indigo-300 flex items-center gap-1.5">
                            <Award className="w-4 h-4" />
                            Circle Synergy Assessment
                          </h4>
                          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                            By combining multiple representation styles, your cohort is <strong>3x more likely</strong> to bypass comprehension bottlenecks.
                          </p>
                          <ul className="text-xs text-gray-500 mt-2 space-y-1 list-disc pl-4">
                            <li>Visual profiles map component logic hierarchy frameworks.</li>
                            <li>Logical profiles construct pure functions, filters, and hook bindings.</li>
                            <li>Kinesthetic profiles construct sandbox test environments to prove real-world usability.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Shared Milestone Checklist */}
                    {activeTab === 'milestones' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Check className="w-5 h-5 text-emerald-400" />
                            Group Milestones Checklist
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            Collaborative checkpoints. Mark tasks as done when you complete them. Circle metrics update in real-time.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {selectedCircle.milestones?.map((milestone) => {
                            const isCompletedByMe = user && milestone.completedBy.includes(user.id);
                            return (
                              <div
                                key={milestone.id}
                                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                  isCompletedByMe 
                                    ? 'bg-emerald-950/10 border-emerald-500/20' 
                                    : 'bg-gray-950/60 border-gray-850 hover:bg-gray-900/60'
                                }`}
                              >
                                <div className="flex-1">
                                  <h4 className={`text-sm font-bold text-white ${isCompletedByMe ? 'line-through text-gray-400' : ''}`}>
                                    {milestone.title}
                                  </h4>
                                  
                                  {/* Roster of members completed */}
                                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                    <span className="text-[10px] text-gray-500 mr-1">Completed by:</span>
                                    {milestone.completedBy.length === 0 ? (
                                      <span className="text-[10px] text-gray-600 italic">No one yet</span>
                                    ) : (
                                      milestone.completedBy.map(cid => {
                                        const mInfo = selectedCircle.memberDetails?.find(md => md.id === cid);
                                        return (
                                          <span 
                                            key={cid}
                                            className="text-[9px] bg-gray-800 text-gray-300 border border-gray-700 px-1.5 py-0.5 rounded"
                                          >
                                            {mInfo ? mInfo.name.split(' ')[0] : 'Member'}
                                          </span>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleToggleMilestone(milestone.id)}
                                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                                    isCompletedByMe
                                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                      : 'border-gray-700 hover:border-gray-500 text-gray-500'
                                  }`}
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Group Chat Room */}
                    {activeTab === 'chat' && (
                      <div className="flex-1 flex flex-col h-[400px] bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden">
                        
                        {/* Messages Thread */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatScrollRef}>
                          {isChatLoading ? (
                            <div className="flex justify-center items-center h-full">
                              <Activity className="w-6 h-6 text-indigo-500 animate-spin" />
                            </div>
                          ) : chatHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                              <MessageSquare className="w-12 h-12 mb-2 text-gray-700" />
                              <p className="text-xs">No chat history in this room. Send a message to get started!</p>
                            </div>
                          ) : (
                            chatHistory.map((msg, index) => {
                              const isMe = msg.author === user?.id;
                              const mDetails = selectedCircle.memberDetails?.find(md => md.id === msg.author);
                              const styleData = mDetails ? learningStyleStyles[mDetails.learningStyle || 'Visual'] : null;

                              return (
                                <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                    isMe 
                                      ? 'bg-indigo-600 text-white rounded-br-none' 
                                      : 'bg-gray-900 border border-gray-800 text-gray-100 rounded-bl-none shadow-sm'
                                  }`}>
                                    {!isMe && (
                                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                        <span className="text-xs font-bold text-indigo-400">{msg.authorName || 'Peer'}</span>
                                        {styleData && (
                                          <span className={`text-[8px] px-1.5 py-0.2 rounded border font-medium ${styleData.bg} ${styleData.text} ${styleData.border}`}>
                                            {mDetails?.learningStyle}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    <p className="text-xs leading-relaxed break-words">{msg.message}</p>
                                    <span className={`block text-[9px] mt-1 ${isMe ? 'text-indigo-200 text-right' : 'text-gray-500 text-left'}`}>
                                      {msg.time}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Input Action Bar */}
                        <div className="p-3 bg-gray-900/60 border-t border-gray-800 flex gap-2">
                          <input
                            type="text"
                            placeholder="Type a group message..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!chatMessage.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                          >
                            <Send className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tab 4: AI Tutor Circle Mentor Guide */}
                    {activeTab === 'mentor' && (
                      <div className="space-y-6 flex-1 flex flex-col">
                        
                        {/* Info banner */}
                        <div className="flex gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 items-start">
                          <Bot className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-indigo-300">Shared AI Circle Guide</h4>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                              Ask this circle guide a question. The AI automatically compiles descriptions combining visual diagrams, logical breakdowns, and kinesthetic sandboxes matching all learning profiles present.
                            </p>
                          </div>
                        </div>

                        {/* Ask input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ask a mentor question: e.g. explain React lifecycle hooks..."
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAskMentor()}
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={handleAskMentor}
                            disabled={isAiLoading || !aiQuestion.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                          >
                            {isAiLoading ? (
                              <Activity className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            Consult
                          </button>
                        </div>

                        {/* Answer Output block */}
                        <div className="flex-1 bg-gray-950 border border-gray-800 rounded-2xl p-4 overflow-y-auto min-h-[220px]">
                          {isAiLoading ? (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-center text-gray-500">
                              <Activity className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                              <p className="text-xs">Consulting AI Mentor model... Tailoring responses for Visual, Logical, and Kinesthetic learners...</p>
                            </div>
                          ) : aiAnswer ? (
                            <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                              {/* Simple markdown representation rendering inside simple client */}
                              {aiAnswer}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-center text-gray-600">
                              <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
                              <p className="text-xs">No active consultation. Ask a question above to generate personalized peer-guided learning instructions.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 backdrop-blur-xl">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                  <h3 className="text-xl font-bold text-white">No Circle Selected</h3>
                  <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                    Select one of your matched cohorts from the left panel, or match a new circle to begin learning together.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyCircles;
