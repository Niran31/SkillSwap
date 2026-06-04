import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  resources: [{ type: String }],
  quiz: [{
    id: { type: Number },
    question: { type: String },
    type: { type: String },
    explanation: { type: String },
    answerOptions: [{ type: String }],
    correctAnswer: { type: String }
  }]
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academy: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  modules: [moduleSchema],
  category: { type: String, default: 'General' },
  difficulty: { type: String, default: 'Beginner' },
  image: { type: String, default: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=300' }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
