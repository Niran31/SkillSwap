import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  learnerId: { type: String, required: true },
  learnerName: { type: String, required: true },
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  topic: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: String, default: '60 min' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
