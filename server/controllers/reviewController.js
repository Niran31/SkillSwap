import mongoose from 'mongoose';
import Review from '../models/Review.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

import User from '../models/User.js';

export const addReview = async (req, res) => {
  const { reviewer, reviewee, rating, comment } = req.body;
  let { reviewerName } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  if (!reviewer || !reviewee) {
     return res.status(400).json({ message: 'Reviewer and reviewee are required' });
  }

  if (!isDbConnected()) {
    return res.status(201).json({
      message: 'Review added (Mock Mode)',
      review: { reviewer, reviewerName: reviewerName || 'Mock User', reviewee, rating, comment, createdAt: new Date() }
    });
  }

  try {
    if (!reviewerName) {
      const user = await User.findById(reviewer);
      if (user) {
        reviewerName = user.name;
      } else {
        reviewerName = 'Anonymous';
      }
    }

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

export const getAverageRating = async (req, res) => {
  const { peerId } = req.params;

  if (!isDbConnected()) {
    return res.status(200).json({ averageRating: 4.5, totalReviews: 2 });
  }

  try {
    const reviews = await Review.find({ reviewee: peerId });
    if (reviews.length === 0) {
      return res.status(200).json({ averageRating: 0, totalReviews: 0 });
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = (sum / reviews.length).toFixed(1);

    res.status(200).json({ averageRating: parseFloat(averageRating), totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
