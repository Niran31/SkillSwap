import React from 'react';
import { X, MapPin, Star, Clock, Check, Calendar, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Peer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PeerModalProps {
  peer: Peer | null;
  isOpen: boolean;
  onClose: () => void;
}

const PeerModal: React.FC<PeerModalProps> = ({ peer, isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // We use AnimatePresence in the parent, so returning null here if not open is fine.
  if (!isOpen || !peer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      />
      
      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden relative z-10"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start mb-8">
            <img 
              src={peer.avatar} 
              alt={peer.name} 
              className="w-24 h-24 rounded-full object-cover mb-4 sm:mb-0 sm:mr-6 border-4 border-white shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center mb-2 gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{peer.name}</h2>
                <span className={`text-xs font-bold rounded-full px-3 py-1 ${
                  peer.role === 'teacher' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {peer.role === 'teacher' ? 'Teacher' : 'Learner'}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center text-gray-500 text-sm mb-3 gap-2 sm:gap-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{peer.location} ({peer.distance} away)</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="font-medium text-gray-700">{peer.rating}</span>
                  <span className="ml-1">({peer.reviews} reviews)</span>
                </div>
              </div>
              
              <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg inline-block font-medium">
                {peer.matchScore}% match with your profile
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {peer.skills.map((skill, idx) => (
                  <span 
                    key={idx}
                    className="inline-block px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            {peer.role === 'teacher' && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Availability & Rates</h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                  {peer.availability?.map((slot, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700 bg-white p-2 rounded-md shadow-sm border border-gray-100">
                      <Clock className="w-4 h-4 text-blue-500 mr-3" />
                      <span className="font-medium">{slot}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600 flex justify-between items-center">
                      <span>Standard Rate</span>
                      <span className="font-bold text-lg text-gray-900">${peer.hourlyRate}<span className="text-sm font-normal text-gray-500">/hr</span></span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Why You Match</h3>
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-inner">
              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-600 bg-opacity-10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-800 leading-relaxed">
                    Based on your <span className="font-semibold text-blue-700">{user?.learningStyle} learning style</span> and interests in 
                    <span className="font-semibold"> {peer.skills.slice(0, 2).map((skill, i) => (
                      <span key={i}> {skill}{i < 1 ? ' and' : ''}</span>
                    ))}</span>, {peer.name} is a fantastic match for your learning journey!
                  </p>
                  <p className="mt-2 text-gray-600 text-sm">
                    {peer.role === 'teacher' 
                      ? "Their teaching approach directly aligns with how you consume information best."
                      : "Their learning goals complement your interests, making for a solid mutual study buddy."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {peer.role === 'teacher' && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900 text-lg">Quick Book</h3>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                  Full calendar
                </button>
              </div>
              <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center mb-4 text-gray-700 font-medium pb-3 border-b border-gray-100">
                  <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                  Select a Date & Time
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['Mon, Oct 15', 'Tue, Oct 16', 'Wed, Oct 17'].map((date, i) => (
                    <button 
                      key={i}
                      className="p-3 text-center border-2 border-transparent bg-gray-50 rounded-lg hover:border-blue-500 focus:border-blue-600 focus:bg-blue-50 transition outline-none"
                    >
                      <span className="block text-sm font-bold text-gray-900">{date.split(',')[0]}</span>
                      <span className="block text-gray-500 text-xs mt-1">{date.split(',')[1]}</span>
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {['2:00 PM', '3:00 PM', '4:30 PM', '5:45 PM'].map((time, i) => (
                    <button 
                      key={i}
                      className="p-2 text-sm border-2 border-transparent bg-gray-50 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-700 focus:border-blue-600 focus:bg-blue-50 font-medium transition outline-none"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              onClick={() => {
                onClose();
                navigate(`/messages?peerId=${peer.id}`);
              }}
              className="flex-1 py-3.5 bg-white border-2 border-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Send Message
            </button>
            {peer.role === 'teacher' ? (
              <button className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition">
                Confirm Booking
              </button>
            ) : (
              <button className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg transition flex items-center justify-center">
                Send Connection Request
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PeerModal;
