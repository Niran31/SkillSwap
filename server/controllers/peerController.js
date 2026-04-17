import mongoose from 'mongoose';
import Peer from '../models/Peer.js';
import User from '../models/User.js';

// Mock data matching the original frontend
const mockPeers = [
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

const isDbConnected = () => mongoose.connection.readyState === 1;

export const getPeers = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(200).json({ peers: mockPeers });
  }

  try {
    const users = await User.find({});
    // If DB is completely empty for some reason, return the defaults so the app still functions
    if (users.length === 0) {
      return res.status(200).json({ peers: mockPeers });
    }
    
    // Map _id to id to support frontend format and map Users to Peer structure
    const formattedPeers = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: u.customSkills && u.customSkills.length > 0 ? 'teacher' : 'learner',
      skills: u.customSkills && u.customSkills.length > 0 ? u.customSkills.map(s => s.name) : u.strengths,
      rating: 4.5 + (Math.random() * 0.5),
      reviews: Math.floor(Math.random() * 30),
      distance: `${(Math.random() * 8 + 1).toFixed(1)} miles`,
      matchScore: 80 + Math.floor(Math.random() * 19),
      location: 'San Francisco, CA',
      hourlyRate: 35 + Math.floor(Math.random() * 40),
      availability: ['Weekdays 5-8pm', 'Weekends']
    }));
    
    res.status(200).json({ peers: formattedPeers });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving peers' });
  }
};
