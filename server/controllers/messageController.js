import Message from '../models/Message.js';
import { isDbConnected } from '../index.js';

export const getMessages = async (req, res) => {
  const { room } = req.params;

  if (!isDbConnected()) {
    return res.status(200).json({ messages: [] });
  }

  try {
    const messages = await Message.find({ room }).sort({ createdAt: 1 }).limit(100);
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
