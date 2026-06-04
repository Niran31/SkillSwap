import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Flame,
  Zap,
  GraduationCap,
  Award,
  TrendingUp,
  Target,
  Calendar,
  Users,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; intensity: number } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/analytics/${user?.id}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, heatmap, radar, sparkline, courseProgress, streakCalendar } = data;

  // ── Heatmap color scale ──
  const heatmapColors = ['#1e1b4b08', '#c7d2fe', '#818cf8', '#6366f1', '#4338ca'];

  // ── Radar chart math ──
  const radarSize = 200;
  const radarCenter = radarSize / 2;
  const radarRadius = 75;
  const radarAxes = radar || [];
  const angleStep = (2 * Math.PI) / radarAxes.length;

  const getRadarPoint = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radarRadius;
    return {
      x: radarCenter + r * Math.cos(angle),
      y: radarCenter + r * Math.sin(angle)
    };
  };

  const radarPolygonPoints = radarAxes
    .map((axis: any, i: number) => {
      const pt = getRadarPoint(axis.value, i);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  // ── Sparkline math ──
  const sparklineData = sparkline || [];
  const sparkW = 320;
  const sparkH = 80;
  const sparkPadding = 8;
  const maxXp = Math.max(...sparklineData.map((p: any) => p.xp), 1);
  const minXp = Math.min(...sparklineData.map((p: any) => p.xp), 0);
  const sparkRange = maxXp - minXp || 1;

  const sparkPoints = sparklineData.map((p: any, i: number) => {
    const x = sparkPadding + (i / Math.max(sparklineData.length - 1, 1)) * (sparkW - sparkPadding * 2);
    const y = sparkH - sparkPadding - ((p.xp - minXp) / sparkRange) * (sparkH - sparkPadding * 2);
    return `${x},${y}`;
  }).join(' ');

  const sparkFillPoints = sparkPoints + ` ${sparkW - sparkPadding},${sparkH - sparkPadding} ${sparkPadding},${sparkH - sparkPadding}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Learning Analytics</h1>
              <p className="text-xs text-gray-500 font-medium">
                {user?.role === 'teacher' ? 'Teacher Performance Overview' :
                 user?.role === 'management' ? 'Academy-Wide Analytics' :
                 'Your personalized learning insights'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Summary Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="Total XP"
            value={summary.totalXp.toLocaleString()}
            color="from-amber-500 to-orange-500"
            shadow="shadow-amber-500/20"
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="Day Streak"
            value={`${summary.streak} 🔥`}
            color="from-red-500 to-rose-500"
            shadow="shadow-red-500/20"
          />
          <StatCard
            icon={<GraduationCap className="w-5 h-5" />}
            label="Courses"
            value={summary.coursesEnrolled}
            color="from-blue-500 to-indigo-500"
            shadow="shadow-blue-500/20"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Quiz Average"
            value={summary.quizAverage > 0 ? `${summary.quizAverage}%` : '—'}
            color="from-emerald-500 to-teal-500"
            shadow="shadow-emerald-500/20"
          />
        </div>

        {/* ── Main Grid: Heatmap + Radar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Weekly Activity Heatmap (2/3 width) */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Weekly Activity Heatmap
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Learning activity intensity by hour across the week</p>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-medium">
                <span>Less</span>
                {heatmapColors.map((color, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                ))}
                <span>More</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Hour labels */}
                <div className="flex items-center mb-1 pl-10">
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="flex-1 text-center text-[8px] text-gray-400 font-mono">
                      {h % 3 === 0 ? `${h}h` : ''}
                    </div>
                  ))}
                </div>

                {/* Grid rows */}
                {heatmap.map((row: any, dIdx: number) => (
                  <div key={dIdx} className="flex items-center gap-0 mb-[2px]">
                    <span className="w-10 text-[10px] text-gray-500 font-bold text-right pr-2 flex-shrink-0">
                      {row.day}
                    </span>
                    <div className="flex flex-1 gap-[2px]">
                      {row.hours.map((intensity: number, hIdx: number) => (
                        <div
                          key={hIdx}
                          className="flex-1 aspect-square rounded-sm cursor-crosshair transition-all duration-150 hover:scale-150 hover:z-10 relative"
                          style={{ backgroundColor: heatmapColors[intensity] || heatmapColors[0] }}
                          onMouseEnter={() => setHoveredCell({ day: row.day, hour: hIdx, intensity })}
                          onMouseLeave={() => setHoveredCell(null)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Tooltip */}
                {hoveredCell && (
                  <div className="mt-2 text-[10px] text-gray-600 font-medium bg-gray-50 rounded-lg px-3 py-1.5 inline-flex items-center gap-2 border border-gray-100">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: heatmapColors[hoveredCell.intensity] }} />
                    <span>{hoveredCell.day} at {hoveredCell.hour}:00 — Intensity: {hoveredCell.intensity}/4</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skill Radar Chart (1/3 width) */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-purple-600" />
              Skill Radar
            </h3>

            <div className="flex-1 flex items-center justify-center">
              <svg viewBox={`0 0 ${radarSize} ${radarSize}`} className="w-full max-w-[220px]">
                <defs>
                  <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* Background rings */}
                {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                  <polygon
                    key={i}
                    points={radarAxes.map((_: any, idx: number) => {
                      const angle = angleStep * idx - Math.PI / 2;
                      const r = radarRadius * scale;
                      return `${radarCenter + r * Math.cos(angle)},${radarCenter + r * Math.sin(angle)}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                  />
                ))}

                {/* Axis lines */}
                {radarAxes.map((_: any, i: number) => {
                  const angle = angleStep * i - Math.PI / 2;
                  return (
                    <line
                      key={i}
                      x1={radarCenter}
                      y1={radarCenter}
                      x2={radarCenter + radarRadius * Math.cos(angle)}
                      y2={radarCenter + radarRadius * Math.sin(angle)}
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                    />
                  );
                })}

                {/* Data polygon */}
                <polygon
                  points={radarPolygonPoints}
                  fill="url(#radarFill)"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  className="transition-all duration-700"
                />

                {/* Data points */}
                {radarAxes.map((axis: any, i: number) => {
                  const pt = getRadarPoint(axis.value, i);
                  return (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r="3"
                      fill="#6366f1"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Labels */}
                {radarAxes.map((axis: any, i: number) => {
                  const angle = angleStep * i - Math.PI / 2;
                  const labelR = radarRadius + 18;
                  const x = radarCenter + labelR * Math.cos(angle);
                  const y = radarCenter + labelR * Math.sin(angle);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[7px] fill-gray-500 font-bold"
                    >
                      {axis.label}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-3 space-y-1">
              {radarAxes.slice(0, 3).map((axis: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-600 font-medium">{axis.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${axis.value}%` }}
                      />
                    </div>
                    <span className="text-gray-800 font-extrabold w-7 text-right">{axis.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 2: Sparkline + Course Progress ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* XP Growth Sparkline */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              XP Growth
            </h3>
            <p className="text-[10px] text-gray-500 mb-3">12-week XP accumulation trend</p>

            <svg viewBox={`0 0 ${sparkW} ${sparkH}`} className="w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Fill area */}
              <polygon
                points={sparkFillPoints}
                fill="url(#sparkGrad)"
              />

              {/* Line */}
              <polyline
                points={sparkPoints}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 1000,
                  strokeDashoffset: 0,
                  animation: 'sparklineDraw 1.5s ease-out forwards'
                }}
              />

              {/* Endpoint dot */}
              {sparklineData.length > 0 && (() => {
                const lastPt = sparkPoints.split(' ').pop()?.split(',');
                if (!lastPt) return null;
                return (
                  <circle
                    cx={parseFloat(lastPt[0])}
                    cy={parseFloat(lastPt[1])}
                    r="4"
                    fill="#10b981"
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })()}
            </svg>

            <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-medium">
              <span>12 weeks ago</span>
              <span className="text-emerald-600 font-extrabold">{summary.totalXp} XP</span>
              <span>Now</span>
            </div>
          </div>

          {/* Course Progress */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Course Progress
            </h3>

            {courseProgress.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <GraduationCap className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">No courses enrolled yet</p>
                <p className="text-xs mt-1">Enroll in a course to see progress here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courseProgress.map((course: any) => (
                  <div key={course.courseId} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition">{course.title}</h4>
                        <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold uppercase">{course.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.quizAverage !== null && (
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            Quiz: {course.quizAverage}%
                          </span>
                        )}
                        <span className="text-[10px] font-extrabold text-gray-700">
                          {course.completionPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          course.completionPercent === 100
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${course.completionPercent}%` }}
                      />
                    </div>

                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-gray-400">
                        {course.completedLessons} of {course.totalLessons} lessons
                      </span>
                      {course.completionPercent === 100 && (
                        <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Row 3: Streak Calendar + Badges ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Streak Calendar */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-orange-500" />
              30-Day Streak Calendar
            </h3>
            <div className="grid grid-cols-10 gap-1.5">
              {(streakCalendar || []).map((day: any, i: number) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md transition-all duration-200 ${
                    day.active
                      ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-sm shadow-orange-200'
                      : 'bg-gray-100'
                  }`}
                  title={`${day.date}: ${day.active ? 'Active' : 'Inactive'}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 text-[9px] text-gray-400 font-medium">
              <span>30 days ago</span>
              <span className="text-orange-600 font-extrabold">{summary.streak} day streak 🔥</span>
              <span>Today</span>
            </div>
          </div>

          {/* Badges Collection */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-500" />
              Badges Earned
            </h3>
            <div className="flex flex-wrap gap-2">
              {(summary.badges || []).map((badge: string, i: number) => {
                const badgeEmojis: Record<string, string> = {
                  'Quick Learner': '⚡', 'Helper': '🤝', 'Newcomer': '🌱',
                  'Scholar': '📚', 'Master': '🎓', 'Mentor': '🧑‍🏫',
                  'Course Builder': '🔨', 'Administrator': '🏛️',
                  'Code Ninja': '🥷', 'UX Guru': '🎨', 'Designer': '🖌️', 'Speaker': '🎤'
                };
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 px-3 py-2 rounded-xl text-xs font-bold text-amber-800 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-default"
                  >
                    <span className="text-base">{badgeEmojis[badge] || '🏆'}</span>
                    {badge}
                  </div>
                );
              })}
              {summary.badges.length === 0 && (
                <p className="text-xs text-gray-400">No badges earned yet. Keep learning!</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Teacher/Management Stats (conditional) ── */}
        {data.teacherStats && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 mb-5">
              <Users className="w-4 h-4 text-blue-600" />
              Teaching Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniStat label="Courses Created" value={data.teacherStats.totalCourses} />
              <MiniStat label="Total Students" value={data.teacherStats.totalStudents} />
              <MiniStat label="Lesson Completions" value={data.teacherStats.totalCompletions} />
              <MiniStat label="Avg Quiz Score" value={`${data.teacherStats.averageQuizScore}%`} />
            </div>
          </div>
        )}

        {data.managementStats && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 mb-5">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              Academy Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <MiniStat label="Students" value={data.managementStats.totalStudents} />
              <MiniStat label="Teachers" value={data.managementStats.totalTeachers} />
              <MiniStat label="Courses" value={data.managementStats.totalCourses} />
              <MiniStat label="Total XP" value={data.managementStats.totalXpAcademy.toLocaleString()} />
              <MiniStat label="Avg Level" value={data.managementStats.averageLevel} />
            </div>

            {data.managementStats.topPerformers?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 mb-3">🏆 Top Performers</h4>
                <div className="space-y-2">
                  {data.managementStats.topPerformers.map((student: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-gray-400 w-5">{i + 1}.</span>
                        <span className="text-xs font-bold text-gray-800">{student.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="font-bold text-indigo-600">Lvl {student.level}</span>
                        <span className="font-bold text-amber-600">{student.xp} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Sparkline draw animation */}
      <style>{`
        @keyframes sparklineDraw {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};


// ── Sub-components ──

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  shadow: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, shadow }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3 shadow-lg ${shadow} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
    <p className="text-xl font-extrabold text-gray-900 mt-0.5">{value}</p>
  </div>
);

interface MiniStatProps {
  label: string;
  value: string | number;
}

const MiniStat: React.FC<MiniStatProps> = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
    <p className="text-lg font-extrabold text-gray-900">{value}</p>
    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{label}</p>
  </div>
);


export default Analytics;
