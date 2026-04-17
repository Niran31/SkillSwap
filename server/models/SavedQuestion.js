import mongoose from 'mongoose';

const savedQuestionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  topic: { type: String, required: true },
  questionText: { type: String, required: true },
  options: { type: [String] },
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
  difficulty: { type: String }
}, { timestamps: true });

export default mongoose.model('SavedQuestion', savedQuestionSchema);
