import mongoose from 'mongoose';

const studyCircleMilestoneSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const studyCircleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topic: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  milestones: [studyCircleMilestoneSchema],
  chatRoomId: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('StudyCircle', studyCircleSchema);
