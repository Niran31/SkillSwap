import React from 'react';
import { Star, MapPin, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Peer } from '../../types';

interface PeerCardProps {
  peer: Peer;
  onClick: (peer: Peer) => void;
}

const PeerCard: React.FC<PeerCardProps> = ({ peer, onClick }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg overflow-hidden cursor-pointer"
      onClick={() => onClick(peer)}
    >
      <div className="p-5">
        <div className="flex items-start">
          <img 
            src={peer.avatar} 
            alt={peer.name} 
            className="w-14 h-14 rounded-full object-cover mr-4"
          />
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-900">{peer.name}</h3>
              <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                peer.role === 'teacher' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {peer.role === 'teacher' ? 'Teacher' : 'Learner'}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span>{peer.rating}</span>
              <span className="mx-1">•</span>
              <span>{peer.reviews} reviews</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{peer.distance} away • {peer.location}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {peer.skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm">
                <span className="font-medium text-blue-700">{peer.matchScore}%</span>
                <span className="text-gray-500"> match</span>
              </div>
              
              <button 
                className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  // In a real app, this would open the chat
                }}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PeerCard;
