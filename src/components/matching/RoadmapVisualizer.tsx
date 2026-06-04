import React, { useState } from 'react';
import { Check, BookOpen, Clock, Play, Brain, ArrowRight, ExternalLink, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  milestone: string;
  resources: string[];
  completed: boolean;
}

interface Roadmap {
  _id: string;
  userId: string;
  topic: string;
  learningStyle: string;
  steps: RoadmapStep[];
}

interface RoadmapVisualizerProps {
  roadmap: Roadmap;
  onUpdateRoadmap: (updated: Roadmap) => void;
  onDeleteRoadmap?: () => void;
}

const themeMap: Record<string, {
  color: string;
  bg: string;
  border: string;
  text: string;
  accent: string;
  gradient: string;
  iconBg: string;
}> = {
  visual: {
    color: 'text-cyan-600',
    bg: 'bg-cyan-50/50',
    border: 'border-cyan-200',
    text: 'text-cyan-800',
    accent: 'bg-cyan-600',
    gradient: 'from-blue-500 to-cyan-400',
    iconBg: 'bg-cyan-100'
  },
  logical: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    accent: 'bg-emerald-600',
    gradient: 'from-green-500 to-emerald-400',
    iconBg: 'bg-emerald-100'
  },
  auditory: {
    color: 'text-purple-600',
    bg: 'bg-purple-50/50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    accent: 'bg-purple-600',
    gradient: 'from-purple-500 to-indigo-400',
    iconBg: 'bg-purple-100'
  },
  kinesthetic: {
    color: 'text-pink-600',
    bg: 'bg-pink-50/50',
    border: 'border-pink-200',
    text: 'text-pink-800',
    accent: 'bg-pink-600',
    gradient: 'from-pink-500 to-rose-400',
    iconBg: 'bg-pink-100'
  }
};

const RoadmapVisualizer: React.FC<RoadmapVisualizerProps> = ({ roadmap, onUpdateRoadmap }) => {
  const { setUser } = useAuth();
  const [showCelebrate, setShowCelebrate] = useState<number | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const styleKey = (roadmap.learningStyle || 'Visual').toLowerCase();
  const theme = themeMap[styleKey] || themeMap.visual;

  const completedCount = roadmap.steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / roadmap.steps.length) * 100);

  const handleToggleStep = async (stepId: number, currentStatus: boolean) => {
    try {
      const res = await axios.patch(`/api/roadmaps/${roadmap._id}/steps/${stepId}`, {
        completed: !currentStatus
      });

      const updatedRoadmap = res.data.roadmap;
      onUpdateRoadmap(updatedRoadmap);

      if (!currentStatus) {
        setShowCelebrate(stepId);
        const xpGained = res.data.xpAwarded || 20;
        
        if (xpGained > 20) {
          toast.success(`🎉 Roadmap Fully Completed! Bonus +50 XP! Total +${xpGained} XP!`, {
            duration: 4500
          });
        } else {
          toast.success(`⭐ Step Completed! +20 XP earned!`);
        }

        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('skillswap_user', JSON.stringify(res.data.user));
        }
      } else {
        toast.info('Step marked as incomplete');
      }
    } catch (error) {
      console.error('Failed to toggle step:', error);
      toast.error('Failed to update step status');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden transition-all duration-300">
      {/* Decorative vertical gradient strip */}
      <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${theme.gradient}`}></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${theme.bg} ${theme.color} border ${theme.border} mb-2 shadow-sm`}>
            <Brain className="w-3.5 h-3.5 mr-1" />
            AI Dynamic Path: {roadmap.learningStyle} Mode
          </span>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            Roadmap for <span className="text-blue-600 font-extrabold">{roadmap.topic}</span>
          </h2>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold text-gray-500 mb-1">
            {completedCount} / {roadmap.steps.length} Steps Complete
          </span>
          <div className="w-36 bg-gray-150 rounded-full h-2 overflow-hidden shadow-inner border border-gray-100">
            <div 
              className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Timeline nodes */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-gray-150 space-y-6 py-2 ml-4">
        {roadmap.steps.map((step, index) => {
          const isActive = expandedStep === step.id;
          const isPrevCompleted = index === 0 || roadmap.steps[index - 1].completed;
          const statusColor = step.completed 
            ? `bg-gradient-to-br ${theme.gradient} text-white ring-4 ring-offset-2 ring-emerald-100` 
            : isPrevCompleted 
            ? 'bg-blue-50 border-blue-400 text-blue-600 hover:scale-105 transition-transform' 
            : 'bg-gray-100 border-gray-300 text-gray-400';

          return (
            <div key={step.id} className="relative group">
              {/* Timeline dot */}
              <button 
                onClick={() => handleToggleStep(step.id, step.completed)}
                className={`absolute -left-[39px] sm:-left-[47px] top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold z-10 transition shadow outline-none focus:outline-none ${statusColor}`}
              >
                {step.completed ? (
                  <Check className="w-4 h-4 stroke-[3px]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </button>

              {/* Celebrate XP floating animation */}
              <AnimatePresence>
                {showCelebrate === step.id && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 0 }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0, 1, 1, 0], y: -45 }}
                    exit={{ opacity: 0 }}
                    onAnimationComplete={() => setShowCelebrate(null)}
                    className="absolute left-2 -top-6 text-sm font-extrabold text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded shadow z-30 pointer-events-none flex items-center gap-1"
                  >
                    ⭐ +20 XP!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Card */}
              <div 
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100/30' 
                    : 'bg-gray-50/50 border-gray-150 hover:bg-white hover:border-gray-300 cursor-pointer shadow-sm'
                }`}
                onClick={() => setExpandedStep(isActive ? null : step.id)}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm sm:text-base leading-tight ${step.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {step.duration}
                  </div>
                </div>

                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-100 space-y-3"
                    onClick={(e) => e.stopPropagation()} // Stop propagation so clicking inside doesn't collapse
                  >
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Milestone Checkpoint */}
                    <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2">
                      <Play className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-blue-800 block">Milestone Target:</span>
                        <p className="text-xs text-blue-900 mt-0.5">{step.milestone}</p>
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <span className="text-xs font-bold text-gray-700 block mb-2">Recommended Study Resources:</span>
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((resource, rIdx) => (
                          <div 
                            key={rIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 cursor-pointer shadow-sm group transition"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                            <span>{resource}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 ml-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Check-off Button inside expanded body */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleToggleStep(step.id, step.completed)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-colors outline-none focus:outline-none ${
                          step.completed 
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-250' 
                            : `bg-gradient-to-r ${theme.gradient} text-white hover:shadow-md`
                        }`}
                      >
                        {step.completed ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Mark Incomplete
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Complete Step (+20 XP)
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapVisualizer;
