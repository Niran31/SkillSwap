import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, BookOpen, BookOpen as Learn, Mail, Award, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  const navItems = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: <BookOpen className="w-5 h-5 mr-2" /> },
        { name: 'Question Generator', path: '/question-generator', icon: <Learn className="w-5 h-5 mr-2" /> },
        { name: 'Peer Matching', path: '/peer-matching', icon: <Mail className="w-5 h-5 mr-2" /> },
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
          <button 
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-blue-500 transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
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