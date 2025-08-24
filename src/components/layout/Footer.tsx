import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Twitter, Facebook, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-1.5">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SkillSwap</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Personalized peer-to-peer learning platform that combines the power of AI with cognitive profiling 
              to create a unique educational experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/question-generator" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  AI Generator
                </Link>
              </li>
              <li>
                <Link to="/peer-matching" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Peer Matching
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Learning Styles
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Cognitive Profiles
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Teaching Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                <span className="text-gray-400 text-sm">hello@skillswap.io</span>
              </li>
              <li>
                <a href="#" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} SkillSwap. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;