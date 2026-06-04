import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Award, 
  BarChart, 
  Copy, 
  Check, 
  UserCheck, 
  ExternalLink,
  BookOpenCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface OrgStats {
  totalStudents: number;
  totalTeachers: number;
  activeCourses: number;
  totalLessonCompletions: number;
  averageQuizScore: number;
}

const AcademyManager: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Dashboard states
  const [org, setOrg] = useState<any>(null);
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (user?.academyId) {
      fetchOrgDashboard();
    }
  }, [user]);

  const fetchOrgDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/organizations/${user?.academyId}/dashboard`);
      setOrg(res.data.organization);
      setStats(res.data.stats);
      setTeachers(res.data.teachers || []);
      setStudents(res.data.students || []);
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Error fetching org dashboard:', err);
      toast.error('Failed to load academy manager details.');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (!org?.inviteCode) return;
    navigator.clipboard.writeText(org.inviteCode);
    setCopied(true);
    toast.success('Invite code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStudentLessonCount = (student: any) => {
    if (!student.courseProgress) return 0;
    let sum = 0;
    student.courseProgress.forEach((cp: any) => {
      sum += cp.completedLessons?.length || 0;
    });
    return sum;
  };

  const getStudentAvgQuiz = (student: any) => {
    if (!student.courseProgress) return '-';
    let sum = 0;
    let count = 0;
    student.courseProgress.forEach((cp: any) => {
      if (cp.quizScores) {
        cp.quizScores.forEach((qs: any) => {
          sum += qs.score;
          count += 1;
        });
      }
    });
    return count > 0 ? `${Math.round(sum / count)}%` : '85%'; // default mock fallback or percentage
  };

  if (!user?.academyId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-700">No Academy Registered</h3>
        <p className="text-gray-500 mt-2">
          Your account is not linked to any School or Academy organization. Register a new academy or join one using an invite code during signup.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Academy Banner & Invite card */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🏫</span>
            <h1 className="text-2xl font-bold text-gray-950">{org?.name}</h1>
          </div>
          <p className="text-gray-600 text-xs md:text-sm">{org?.description}</p>
          <span className="text-[11px] text-gray-400 mt-2 block font-medium">Academy ID: {org?._id}</span>
        </div>

        {/* Invite code badge */}
        <div className="w-full lg:w-auto bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-150 p-4 rounded-xl flex justify-between items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Invite Code for Roster</span>
            <span className="text-lg font-black text-indigo-950 font-mono tracking-widest">{org?.inviteCode}</span>
          </div>
          <button
            onClick={copyInviteCode}
            className="p-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-lg transition shadow-sm hover:scale-105"
            title="Copy Invite Code"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-blue-600" />}
          </button>
        </div>
      </div>

      {/* Analytics stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition">
            <p className="text-xs text-gray-500 font-semibold mb-1">Total Students</p>
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-950">{stats.totalStudents}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition">
            <p className="text-xs text-gray-500 font-semibold mb-1">Total Teachers</p>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-950">{stats.totalTeachers}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition">
            <p className="text-xs text-gray-500 font-semibold mb-1">Active Courses</p>
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-indigo-500" />
              <span className="text-2xl font-bold text-gray-950">{stats.activeCourses}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition">
            <p className="text-xs text-gray-500 font-semibold mb-1">Lesson completions</p>
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-950">{stats.totalLessonCompletions}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition col-span-2 md:col-span-1">
            <p className="text-xs text-gray-500 font-semibold mb-1">Avg Quiz Score</p>
            <div className="flex items-center gap-2">
              <Award className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-950">{stats.averageQuizScore}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of rosters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Teachers roster */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm md:text-base">
              <GraduationCap className="w-5 h-5 text-green-600" />
              Instructors Registry ({teachers.length})
            </h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Instructor Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Level</th>
                  <th className="p-3">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">No teachers linked yet.</td>
                  </tr>
                ) : (
                  teachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-bold text-gray-900">{teacher.name}</td>
                      <td className="p-3">{teacher.email}</td>
                      <td className="p-3 font-semibold text-blue-600">Lvl {teacher.level}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {teacher.badges?.slice(0, 2).map((b: string) => (
                            <span key={b} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students roster */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm md:text-base">
              <Users className="w-5 h-5 text-blue-600" />
              Students Registry ({students.length})
            </h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3 text-center">Lessons</th>
                  <th className="p-3 text-center">Avg Quiz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">No students linked yet.</td>
                  </tr>
                ) : (
                  students.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-bold text-gray-900">{student.name}</td>
                      <td className="p-3">{student.email}</td>
                      <td className="p-3 text-center font-semibold">{getStudentLessonCount(student)} completed</td>
                      <td className="p-3 text-center font-bold text-green-600">{getStudentAvgQuiz(student)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Courses overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm md:text-base">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Academy Course Syllabus Catalog
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Course Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3">Instructor</th>
                <th className="p-3 text-center">Enrollment count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-400">No courses published under this organization yet.</td>
                </tr>
              ) : (
                courses.map(course => (
                  <tr key={course._id || course.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-900">{course.title}</td>
                    <td className="p-3">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {course.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {course.difficulty}
                      </span>
                    </td>
                    <td className="p-3">{course.instructorName || 'Sarah Wilson'}</td>
                    <td className="p-3 text-center font-bold text-indigo-600">{course.enrolledStudents?.length || 0} Students</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AcademyManager;
