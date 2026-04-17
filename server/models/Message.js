import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  author: { type: String, required: true },
  authorName: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
