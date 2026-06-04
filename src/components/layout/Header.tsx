import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, BookOpen, BookOpen as Learn, Mail, Award, LogOut, Users, MessageSquare, Bell, Check, Trash2, GraduationCap, Brain, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import axios from 'axios';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
    }
  }, [isAuthenticated, user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setIsLoadingNotifications(true);
      const res = await axios.get(`/api/notifications/${user.id}`);
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await axios.patch(`/api/notifications/${user.id}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'session': return '📅';
      case 'achievement': return '🏆';
      case 'message': return '💬';
      case 'match': return '🤝';
      case 'xp': return '⚡';
      default: return '🔔';
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  const navItems = isAuthenticated && user
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: <BookOpen className="w-5 h-5 mr-2" /> },
        ...(user.role === 'student' || user.role === 'user' ? [
          { name: 'Courses', path: '/courses', icon: <GraduationCap className="w-5 h-5 mr-2" /> }
        ] : []),
        ...(user.role === 'teacher' ? [
          { name: 'Course Builder', path: '/course-builder', icon: <GraduationCap className="w-5 h-5 mr-2" /> }
        ] : []),
        ...(user.role === 'management' ? [
          { name: 'Academy Manager', path: '/academy-manager', icon: <GraduationCap className="w-5 h-5 mr-2" /> }
        ] : []),
        { name: 'Question Generator', path: '/question-generator', icon: <Learn className="w-5 h-5 mr-2" /> },
        { name: 'Peer Matching', path: '/peer-matching', icon: <Users className="w-5 h-5 mr-2" /> },
        { name: 'Study Circles', path: '/study-circles', icon: <Brain className="w-5 h-5 mr-2" /> },
        { name: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5 mr-2" /> },
        { name: 'Messages', path: '/messages', icon: <MessageSquare className="w-5 h-5 mr-2" /> },
        { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5 mr-2" /> },

      ]
    : [];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-1.5">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
              SkillSwap
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-500'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) fetchNotifications();
                    }}
                    className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideDown">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center">
                          <Bell className="w-4 h-4 mr-2 text-blue-600" />
                          Notifications
                          {unreadCount > 0 && (
                            <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center transition"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {isLoadingNotifications ? (
                          <div className="flex justify-center p-6">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">
                            <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm font-medium">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => !notif.read && handleMarkRead(notif.id)}
                              className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors group ${
                                notif.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/40 hover:bg-blue-50'
                              }`}
                            >
                              <span className="text-xl flex-shrink-0 mt-0.5">{getNotifIcon(notif.type)}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className={`text-sm font-semibold truncate ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                    {notif.title}
                                  </h4>
                                  <button
                                    onClick={(e) => handleDismiss(notif.id, e)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5 rounded"
                                    title="Dismiss"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <p className={`text-xs mt-0.5 line-clamp-2 ${notif.read ? 'text-gray-500' : 'text-gray-600'}`}>
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-gray-400 mt-1 block">{timeAgo(notif.createdAt)}</span>
                              </div>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              navigate('/profile');
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                          >
                            View all activity →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 border-r pr-3">
                  <Award className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Level {user?.level}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-red-500 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={onSignupClick}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile notification bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) fetchNotifications();
                  }}
                  className="relative p-2 text-gray-600 hover:text-blue-600 rounded-full transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            <button 
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-500 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-white transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-16 pb-6 px-4">
          {isAuthenticated && (
            <div className="flex items-center space-x-2 mb-8 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{user?.name}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Award className="w-3 h-3 mr-1 text-green-500" />
                  Level {user?.level} • {user?.xp} XP
                </div>
              </div>
            </div>
          )}

          <nav className="flex-grow flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-gray-100">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
              </button>
            ) : (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    onLoginClick();
                    closeMenu();
                  }}
                  className="w-full p-3 text-center font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onSignupClick();
                    closeMenu();
                  }}
                  className="w-full p-3 text-center font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;