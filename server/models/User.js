import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  learningStyle: { type: String, default: 'Visual' },
  strengths: { type: [String], default: [] },
  bio: { type: String, default: 'I am a passionate learner on SkillSwap!' },
  customSkills: [{ 
    name: { type: String },
    level: { type: Number, default: 0 }
  }],
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  badges: { type: [String], default: ['Newcomer'] },
  lastLogin: { type: Date, default: Date.now },
  role: { type: String, enum: ['student', 'teacher', 'management', 'user'], default: 'user' },
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  courseProgress: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    completedLessons: [String],
    quizScores: [{ quizId: String, score: Number }]
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
