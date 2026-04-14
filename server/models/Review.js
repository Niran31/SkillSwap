import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: { type: String, required: true },
  reviewerName: { type: String, required: true },
  reviewee: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
