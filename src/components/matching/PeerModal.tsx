import React from 'react';
import { X, MapPin, Star, Clock, Check, Calendar, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Peer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

interface PeerModalProps {
  peer: Peer | null;
  isOpen: boolean;
  onClose: () => void;
}

const PeerModal: React.FC<PeerModalProps> = ({ peer, isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'details' | 'reviews'>('details');
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = React.useState(false);
  const [reviewForm, setReviewForm] = React.useState({ rating: 5, comment: '' });
  const [hoveredStar, setHoveredStar] = React.useState(0);
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedTime, setSelectedTime] = React.useState('');
  const [isBooking, setIsBooking] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && peer) {
      if (activeTab === 'reviews') {
        fetchReviews();
      }
    } else {
      // Reset state when closed
      setActiveTab('details');
      setReviewForm({ rating: 5, comment: '' });
    }
  }, [isOpen, peer, activeTab]);

  const fetchReviews = async () => {
    if (!peer) return;
    try {
      setIsLoadingReviews(true);
      const res = await axios.get(`/api/reviews/${peer.id}`);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !peer) {
      toast.error('You must be logged in to leave a review');
      return;
    }
    
    try {
      await axios.post('/api/reviews', {
        reviewer: user.id,
        reviewerName: user.name,
        reviewee: peer.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      
      toast.success('Review submitted successfully!');
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews(); // Refresh list
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleBookingSession = async () => {
    if (!user || !peer) {
      toast.error('You must be logged in to book a session');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select both a date and time');
      return;
    }

    try {
      setIsBooking(true);
      await axios.post('/api/sessions', {
        learnerId: user.id,
        learnerName: user.name,
        teacherId: peer.id,
        teacherName: peer.name,
        topic: `${peer.skills[0] || 'Skill'} Session`,
        date: selectedDate,
        time: selectedTime,
        duration: '60 min'
      });
      
      toast.success('Session booked successfully!');
      setSelectedDate('');
      setSelectedTime('');
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session');
    } finally {
      setIsBooking(false);
    }
  };

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
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
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
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 px-4 font-medium text-sm transition-colors relative ${
                activeTab === 'details' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
              {activeTab === 'details' && (
                <motion.div layoutId="modal-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 px-4 font-medium text-sm transition-colors relative ${
                activeTab === 'reviews' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews ({peer.reviews})
              {activeTab === 'reviews' && (
                <motion.div layoutId="modal-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
          
          {activeTab === 'details' ? (
            <>
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
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 text-center border-2 rounded-lg transition outline-none ${
                        selectedDate === date 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-transparent bg-gray-50 hover:border-blue-300'
                      }`}
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
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 text-sm border-2 rounded-lg font-medium transition outline-none ${
                        selectedTime === time
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-transparent bg-gray-50 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          </>
          ) : (
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">Leave a Review</h3>
              
              {user ? (
                <form onSubmit={submitReview} className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="mr-1 focus:outline-none transition-transform hover:scale-110"
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        >
                          <Star 
                            className={`w-8 h-8 ${
                              (hoveredStar || reviewForm.rating) >= star 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                      rows={3}
                      placeholder="Share your experience..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-gray-50 rounded-xl text-center border border-gray-100 text-gray-600">
                  Please log in to leave a review.
                </div>
              )}
              
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Past Reviews</h3>
              {isLoadingReviews ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-900">{review.reviewerName}</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment || 'No comment provided.'}</p>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-xl text-gray-500 border border-gray-100">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No reviews yet. Be the first to leave one!</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100 mt-4 rounded-b-xl">
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
            {peer.role === 'teacher' && activeTab === 'details' ? (
              <button 
                onClick={handleBookingSession}
                disabled={isBooking || !selectedDate || !selectedTime}
                className={`flex-1 py-3.5 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center ${
                  !selectedDate || !selectedTime 
                    ? 'bg-blue-400 cursor-not-allowed opacity-70' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </button>
            ) : peer.role !== 'teacher' && activeTab === 'details' ? (
              <button className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg transition flex items-center justify-center">
                Send Connection Request
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PeerModal;
