import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Reference to the user who should receive this notification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  
  // Notification type
  type: {
    type: String,
    enum: ['reply', 'follow-up', 'overdue', 'ai-tip', 'system'],
    required: [true, 'Notification type is required'],
    index: true
  },
  
  // Notification title
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  // Notification detail/message
  detail: {
    type: String,
    required: [true, 'Notification detail is required'],
    trim: true,
    maxlength: [500, 'Detail cannot exceed 500 characters']
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Whether the notification has been read
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Reference to related entities (contact, message, etc.)
  relatedContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    default: null
  },
  
  relatedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time display
notificationSchema.virtual('timeDisplay').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffMs = now - created;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return created.toLocaleDateString();
});

// Static method to create reply notification
notificationSchema.statics.createReplyNotification = function(userId, contactId, messageId, contactName) {
  return this.create({
    user: userId,
    type: 'reply',
    title: 'New Reply Received',
    detail: `${contactName} replied to your message`,
    priority: 'high',
    relatedContact: contactId,
    relatedMessage: messageId
  });
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    user: userId,
    isRead: false
  });
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId, notificationIds = null) {
  const query = { user: userId };
  if (notificationIds) {
    query._id = { $in: notificationIds };
  }
  
  return this.updateMany(query, { isRead: true });
};

// Indexes for better query performance
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
