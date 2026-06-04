import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, GraduationCap, Award, Search, ArrowRight, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Course } from '../types';

const LMSCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Fetch both public and academy courses
      const url = user?.academyId 
        ? `/api/courses?academyId=${user.academyId}`
        : '/api/courses';
      const res = await axios.get(url);
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await axios.post(`/api/courses/${courseId}/enroll`);
      toast.success('Successfully enrolled in course! 🎉');
      // Refresh local user profile to sync courseProgress
      if (user?.id) {
        const profileRes = await axios.get(`/api/auth/profile/${user.id}`);
        // Simple state update through navigation or reload
        window.location.reload();
      }
    } catch (err) {
      console.error('Error enrolling in course:', err);
      toast.error('Failed to enroll in course.');
    }
  };

  const isEnrolled = (courseId: string) => {
    return user?.courseProgress?.some(cp => cp.courseId === courseId) || false;
  };

  const getCourseProgressPercent = (courseId: string, course: Course) => {
    const progress = user?.courseProgress?.find(cp => cp.courseId === courseId);
    if (!progress) return 0;
    
    // Count total lessons
    let totalLessons = 0;
    course.modules.forEach(m => {
      totalLessons += m.lessons.length;
    });
    
    if (totalLessons === 0) return 0;
    return Math.round((progress.completedLessons.length / totalLessons) * 100);
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white relative overflow-hidden shadow-lg border-0">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md opacity-20"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 inline-block">
            Learning Management System
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore Academy Courses</h1>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            Gain concrete skills with structured lesson pathways, visual walkthroughs, and quizzes. Progress earns you badges and XP.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title or subject..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
          />
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'teacher' && (
            <button
              onClick={() => navigate('/course-builder')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm shadow transition"
            >
              + Create Course
            </button>
          )}
          {user?.role === 'management' && (
            <button
              onClick={() => navigate('/academy-manager')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm shadow transition"
            >
              School Portal
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-xl border border-gray-200 h-80"></div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No courses found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-4">
            There are no courses active in this catalog yet. Check back soon or create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const enrolled = isEnrolled(course._id);
            const progressPercent = enrolled ? getCourseProgressPercent(course._id, course) : 0;
            return (
              <div
                key={course._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 relative bg-gray-100">
                    <img
                      src={course.image || 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=300'}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-700 shadow-sm">
                      {course.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-700 shadow-sm">
                      {course.difficulty}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{course.description}</p>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                      <UserIcon className="w-3.5 h-3.5 text-blue-500 mr-1.5" />
                      <span className="font-semibold text-gray-700 mr-1">Taught by:</span>
                      <span>{course.instructorName || 'Sarah Wilson'}</span>
                    </div>

                    {enrolled && (
                      <div className="space-y-1.5 mb-2">
                        <div className="flex justify-between text-xs font-semibold text-gray-600">
                          <span>Completed</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-gray-100 mt-auto">
                  {enrolled ? (
                    <button
                      onClick={() => navigate(`/course-viewer/${course._id}`)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-1 shadow-sm mt-3"
                    >
                      Resume Learning
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course._id)}
                      className="w-full py-2 bg-white hover:bg-blue-50 border border-blue-500 text-blue-600 font-bold rounded-lg text-sm transition mt-3"
                    >
                      Enroll in Course
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LMSCourses;
