import mongoose from 'mongoose';
import Review from '../models/Review.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const addReview = async (req, res) => {
  const { reviewer, reviewerName, reviewee, rating, comment } = req.body;

  if (!isDbConnected()) {
    return res.status(201).json({
      message: 'Review added (Mock Mode)',
      review: { reviewer, reviewerName, reviewee, rating, comment, createdAt: new Date() }
    });
  }

  try {
    const review = new Review({ reviewer, reviewerName, reviewee, rating, comment });
    await review.save();
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getReviews = async (req, res) => {
  const { peerId } = req.params;

  if (!isDbConnected()) {
    return res.status(200).json({
      reviews: [
        { reviewer: '1', reviewerName: 'Alex Johnson', reviewee: peerId, rating: 5, comment: 'Amazing teacher! Very patient and knowledgeable.', createdAt: new Date() },
        { reviewer: '2', reviewerName: 'Maria Garcia', reviewee: peerId, rating: 4, comment: 'Great session, learned a lot about React hooks.', createdAt: new Date() }
      ]
    });
  }

  try {
    const reviews = await Review.find({ reviewee: peerId }).sort({ createdAt: -1 });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
