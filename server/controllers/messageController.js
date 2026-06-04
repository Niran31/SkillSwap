import Message from '../models/Message.js';
import { isDbConnected } from '../index.js';
import { mockMessages, mockUsers } from '../mockDb.js';
import User from '../models/User.js';

export const getMessages = async (req, res) => {
  const { room } = req.params;

  if (!isDbConnected()) {
    const messages = mockMessages.filter(m => m.room === room);
    return res.status(200).json({ messages });
  }

  try {
    const messages = await Message.find({ room }).sort({ createdAt: 1 }).limit(100);
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getConversations = async (req, res) => {
  const { userId } = req.params;

  if (!isDbConnected()) {
    const userRooms = mockMessages.filter(m => m.room.includes(userId));
    const uniquePeerIds = new Set();
    userRooms.forEach(m => {
      const parts = m.room.split('_');
      const peerId = parts.find(id => id !== userId);
      if (peerId) uniquePeerIds.add(peerId);
    });

    const { mockSessions } = await import('../mockDb.js');
    mockSessions.forEach(s => {
      if (s.learnerId === userId) uniquePeerIds.add(s.teacherId);
      if (s.teacherId === userId) uniquePeerIds.add(s.learnerId);
    });

    const conversations = Array.from(uniquePeerIds).map(peerId => {
      const peerUser = mockUsers.get(peerId);
      const peerName = peerUser ? peerUser.name : (peerId === '2' ? 'Sarah Johnson' : peerId === '3' ? 'Miguel Rodriguez' : 'David Chen');
      const peerAvatar = peerUser ? 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150' : 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150';
      const room = [userId, peerId].sort().join('_');
      const roomMsgs = mockMessages.filter(m => m.room === room);
      const lastMsg = roomMsgs[roomMsgs.length - 1];

      return {
        peerId,
        peerName,
        peerAvatar,
        room,
        lastMessage: lastMsg ? lastMsg.message : 'No messages yet',
        time: lastMsg ? lastMsg.time : ''
      };
    });

    return res.status(200).json({ conversations });
  }

  try {
    const rooms = await Message.distinct('room', { room: new RegExp(userId) });
    const conversations = [];

    for (const room of rooms) {
      const parts = room.split('_');
      const peerId = parts.find(id => id !== userId);
      if (!peerId) continue;

      const peerUser = await User.findById(peerId);
      if (!peerUser) continue;

      const lastMsg = await Message.findOne({ room }).sort({ createdAt: -1 });

      conversations.push({
        peerId,
        peerName: peerUser.name,
        peerAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        room,
        lastMessage: lastMsg ? lastMsg.message : 'No messages yet',
        time: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
      });
    }

    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
