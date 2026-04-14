import mongoose from 'mongoose';

const peerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String },
  role: { type: String, enum: ['teacher', 'learner'], required: true },
  skills: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  distance: { type: String },
  matchScore: { type: Number, default: 0 },
  location: { type: String },
  hourlyRate: { type: Number },
  availability: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Peer', peerSchema);
