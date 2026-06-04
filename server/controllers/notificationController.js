import { mockNotifications } from '../mockDb.js';
import { isDbConnected } from '../index.js';

export const getNotifications = async (req, res) => {
  const { userId } = req.params;

  if (!isDbConnected()) {
    const notifications = mockNotifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json({ notifications });
  }

  // For DB mode, would query from a Notification model
  return res.status(200).json({ notifications: [] });
};

export const markNotificationRead = async (req, res) => {
  const { id } = req.params;

  if (!isDbConnected()) {
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return res.status(200).json({ message: 'Notification marked as read' });
  }

  return res.status(200).json({ message: 'Notification marked as read' });
};

export const markAllRead = async (req, res) => {
  const { userId } = req.params;

  if (!isDbConnected()) {
    mockNotifications
      .filter(n => n.userId === userId)
      .forEach(n => { n.read = true; });
    return res.status(200).json({ message: 'All notifications marked as read' });
  }

  return res.status(200).json({ message: 'All notifications marked as read' });
};

export const dismissNotification = async (req, res) => {
  const { id } = req.params;

  if (!isDbConnected()) {
    const idx = mockNotifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      mockNotifications.splice(idx, 1);
    }
    return res.status(200).json({ message: 'Notification dismissed' });
  }

  return res.status(200).json({ message: 'Notification dismissed' });
};
