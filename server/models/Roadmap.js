import mongoose from 'mongoose';

const roadmapStepSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  milestone: { type: String, required: true },
  resources: { type: [String], default: [] },
  completed: { type: Boolean, default: false }
});

const roadmapSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  topic: { type: String, required: true },
  learningStyle: { type: String, required: true },
  steps: { type: [roadmapStepSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('Roadmap', roadmapSchema);
