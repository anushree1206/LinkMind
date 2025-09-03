import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { limit = 20, offset = 0 } = req.query;

  const notifications = await Notification.find({ user: userId })
    .populate('relatedContact', 'fullName')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const unreadCount = await Notification.getUnreadCount(userId);

  res.status(200).json({
    success: true,
    message: 'Notifications retrieved successfully',
    data: {
      notifications,
      unreadCount,
      total: notifications.length
    }
  });
}));

/**
 * PUT /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.put('/:id/read', asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notificationId = req.params.id;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { notification }
  });
}));

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the user
 */
router.put('/read-all', asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await Notification.markAsRead(userId);

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notifications marked as read`,
    data: { modifiedCount: result.modifiedCount }
  });
}));

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notificationId = req.params.id;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
}));

export default router;
