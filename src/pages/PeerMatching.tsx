import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  MessageSquare, 
  Calendar, 
  ArrowRight,
  X,
  ChevronDown,
  Check,
  Clock,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Peer {
  id: string;
  name: string;
  avatar: string;
  role: 'teacher' | 'learner';
  skills: string[];
  rating: number;
  reviews: number;
  distance: string;
  matchScore: number;
  location: string;
  hourlyRate?: number;
  availability?: string[];
}

// Mock data for peers
const mockPeers: Peer[] = [
  {
    id: '1',
    name: 'David Chen',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'teacher',
    skills: ['JavaScript', 'React', 'Node.js'],
    rating: 4.8,
    reviews: 24,
    distance: '2.5 miles',
    matchScore: 92,
    location: 'San Francisco, CA',
    hourlyRate: 45,
    availability: ['Mon 3-6pm', 'Wed 2-8pm', 'Fri 1-5pm']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'learner',
    skills: ['UX Design', 'Figma', 'User Research'],
    rating: 4.6,
    reviews: 12,
    distance: '4.2 miles',
    matchScore: 88,
    location: 'Oakland, CA'
  },
  {
    id: '3',
    name: 'Miguel Rodriguez',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'teacher',
    skills: ['Python', 'Data Science', 'Machine Learning'],
    rating: 4.9,
    reviews: 37,
    distance: '1.8 miles',
    matchScore: 95,
    location: 'San Francisco, CA',
    hourlyRate: 55,
    availability: ['Tue 5-9pm', 'Thu 6-8pm', 'Sat 10am-2pm']
  },
  {
    id: '4',
    name: 'Emily Chang',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'learner',
    skills: ['JavaScript', 'React Native', 'Mobile Development'],
    rating: 4.5,
    reviews: 8,
    distance: '3.5 miles',
    matchScore: 84,
    location: 'Berkeley, CA'
  },
  {
    id: '5',
    name: 'James Wilson',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'teacher',
    skills: ['UI Design', 'Adobe XD', 'Sketch'],
    rating: 4.7,
    reviews: 19,
    distance: '5.1 miles',
    matchScore: 90,
    location: 'San Francisco, CA',
    hourlyRate: 40,
    availability: ['Mon 4-8pm', 'Wed 6-9pm', 'Sun 1-6pm']
  },
  {
    id: '6',
    name: 'Sofia Martinez',
    avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'learner',
    skills: ['Content Writing', 'SEO', 'Digital Marketing'],
    rating: 4.3,
    reviews: 5,
    distance: '6.8 miles',
    matchScore: 82,
    location: 'Daly City, CA'
  }
];

type FilterRole = 'all' | 'teacher' | 'learner';
type SortOption = 'match' | 'rating' | 'distance';

const PeerMatching: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [peers, setPeers] = useState<Peer[]>(mockPeers);
  const [filteredPeers, setFilteredPeers] = useState<Peer[]>(mockPeers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // All available skills from the peers
  const allSkills = Array.from(new Set(peers.flatMap(peer => peer.skills))).sort();

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const applyFilters = () => {
    let result = [...peers];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(peer => 
        peer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        peer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by role
    if (filterRole !== 'all') {
      result = result.filter(peer => peer.role === filterRole);
    }
    
    // Filter by skills
    if (selectedSkills.length > 0) {
      result = result.filter(peer => 
        selectedSkills.some(skill => peer.skills.includes(skill))
      );
    }
    
    // Filter by distance
    if (maxDistance < 10) {
      result = result.filter(peer => {
        const distanceValue = parseFloat(peer.distance.split(' ')[0]);
        return distanceValue <= maxDistance;
      });
    }
    
    // Sort results
    result.sort((a, b) => {
      if (sortBy === 'match') {
        return b.matchScore - a.matchScore;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else { // distance
        const distanceA = parseFloat(a.distance.split(' ')[0]);
        const distanceB = parseFloat(b.distance.split(' ')[0]);
        return distanceA - distanceB;
      }
    });
    
    setFilteredPeers(result);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setSelectedSkills([]);
    setMaxDistance(10);
    setSortBy('match');
    setFilteredPeers(peers);
    setShowFilters(false);
  };

  const handlePeerSelect = (peer: Peer) => {
    setSelectedPeer(peer);
    setShowModal(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Peer Matching</h1>
          <p className="text-gray-600 mb-8">
            You need to be logged in to use the Peer Matching feature. Please sign in or create an account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Find Your Perfect Learning Match</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Connect with peers and teachers who match your learning style, skill interests, and goals.
            Our AI-powered matching algorithm finds the perfect learning partners for you.
          </p>
        </div>
        
        {/* Search Bar and Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-8">
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search skills, topics, or names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <div className="relative">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as FilterRole)}
                  className="appearance-none pl-3 pr-10 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="teacher">Teachers</option>
                  <option value="learner">Learners</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-3 pr-10 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="match">Best Match</option>
                  <option value="rating">Highest Rated</option>
                  <option value="distance">Nearest</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <Filter className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              
              <button
                onClick={applyFilters}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-800">Advanced Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                          selectedSkills.includes(skill)
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Distance: {maxDistance} miles
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 mile</span>
                    <span>5 miles</span>
                    <span>10+ miles</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Results Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              {filteredPeers.length} Matches Found
            </h2>
            {filteredPeers.length !== peers.length && (
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                Clear filters
                <X className="ml-1 w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeers.map((peer) => (
              <div 
                key={peer.id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
                onClick={() => handlePeerSelect(peer)}
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
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="font-medium text-blue-700">{peer.matchScore}%</span>
                          <span className="text-gray-500"> match with your profile</span>
                        </div>
                        
                        <button className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredPeers.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No matches found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Expand Your Network Section */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
          <div className="py-8 px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h2 className="text-2xl font-bold text-white mb-2">Expand Your Learning Network</h2>
                <p className="text-purple-100">
                  Share your profile and connect with more peers and teachers who match 
                  your learning goals and teaching style.
                </p>
              </div>
              <button className="px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:shadow-lg transition transform hover:-translate-y-1 whitespace-nowrap flex items-center justify-center">
                Share Profile
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Peer Details Modal */}
      {showModal && selectedPeer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden transition-all duration-300 transform"
            style={{
              opacity: showModal ? 1 : 0,
              scale: showModal ? 1 : 0.95,
            }}
          >
            <div className="relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                <div className="flex items-start mb-6">
                  <img 
                    src={selectedPeer.avatar} 
                    alt={selectedPeer.name} 
                    className="w-20 h-20 rounded-full object-cover mr-5"
                  />
                  <div>
                    <div className="flex items-center mb-1">
                      <h2 className="text-2xl font-bold text-gray-900 mr-2">{selectedPeer.name}</h2>
                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                        selectedPeer.role === 'teacher' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedPeer.role === 'teacher' ? 'Teacher' : 'Learner'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{selectedPeer.location} ({selectedPeer.distance} away)</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center mr-3">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{selectedPeer.rating}</span>
                        <span className="text-gray-500 text-sm ml-1">({selectedPeer.reviews} reviews)</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-blue-700">{selectedPeer.matchScore}%</span>
                        <span className="text-gray-500"> match</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPeer.skills.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {selectedPeer.role === 'teacher' && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Availability</h3>
                      <div className="space-y-2">
                        {selectedPeer.availability?.map((slot, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-gray-500 mr-2" />
                            <span>{slot}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-gray-600">
                        Hourly Rate: <span className="font-medium">${selectedPeer.hourlyRate}</span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Why You Match</h3>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Check className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          Based on your {user?.learningStyle} learning style and interests in 
                          {selectedPeer.skills.slice(0, 2).map((skill, i) => (
                            <span key={i}> {skill}{i < 1 ? ' and' : ''}</span>
                          ))}, {selectedPeer.name} is a great match for your learning journey.
                        </p>
                        <p className="mt-2 text-gray-700">
                          {selectedPeer.role === 'teacher' 
                            ? `Their teaching approach aligns well with your learning preferences.`
                            : `Their learning goals complement your interests, making for great mutual learning.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedPeer.role === 'teacher' && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Schedule a Session</h3>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                          <span className="font-medium">Select a Date & Time</span>
                        </div>
                        <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                          See more availability
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {['Mon, Oct 15', 'Tue, Oct 16', 'Wed, Oct 17'].map((date, i) => (
                          <button 
                            key={i}
                            className="p-2 text-center border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                          >
                            <span className="block text-sm font-medium">{date.split(',')[0]}</span>
                            <span className="block text-gray-500 text-sm">{date.split(',')[1]}</span>
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {['2:00 PM', '3:00 PM', '4:30 PM', '5:45 PM'].map((time, i) => (
                          <button 
                            key={i}
                            className="p-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Message
                  </button>
                  {selectedPeer.role === 'teacher' ? (
                    <button className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                      Book a Session
                    </button>
                  ) : (
                    <button className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerMatching;