import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Reference to the contact this message is sent to
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: [true, 'Contact reference is required'],
    index: true
  },
  
  // Reference to the user who sent this message
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  
  // Message content
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message content cannot exceed 2000 characters']
  },
  
  // Message type
  type: {
    type: String,
    enum: ['Email', 'LinkedIn', 'SMS', 'Other'],
    default: 'Email',
    index: true
  },
  
  // Message status for reply simulation
  status: {
    type: String,
    enum: ['pending', 'responded', 'no_response'],
    default: 'pending',
    index: true
  },
  
  // Reply content (when status becomes 'responded')
  replyContent: {
    type: String,
    trim: true,
    maxlength: [1000, 'Reply content cannot exceed 1000 characters']
  },
  
  // When the reply was received/simulated
  repliedAt: {
    type: Date,
    default: null
  },
  
  // Scheduled reply timeout ID (for cleanup if needed)
  replyTimeoutId: {
    type: String,
    default: null
  },
  
  // Message metadata
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if message is overdue for response
messageSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'pending') return false;
  const now = new Date();
  const sentDate = new Date(this.createdAt);
  const daysSinceSent = Math.ceil((now - sentDate) / (1000 * 60 * 60 * 24));
  return daysSinceSent > 7; // Consider overdue after 7 days
});

// Virtual for response time in hours (if responded)
messageSchema.virtual('responseTimeHours').get(function() {
  if (this.status !== 'responded' || !this.repliedAt) return null;
  const sentDate = new Date(this.createdAt);
  const replyDate = new Date(this.repliedAt);
  return Math.ceil((replyDate - sentDate) / (1000 * 60 * 60));
});

// Static method to find messages by user with filters
messageSchema.statics.findByUserWithFilters = function(userId, filters = {}) {
  const query = { user: userId };
  
  if (filters.contactId) {
    query.contact = filters.contactId;
  }
  
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  
  if (filters.type && filters.type !== 'all') {
    query.type = filters.type;
  }
  
  if (filters.dateFrom) {
    query.createdAt = { $gte: new Date(filters.dateFrom) };
  }
  
  if (filters.dateTo) {
    if (query.createdAt) {
      query.createdAt.$lte = new Date(filters.dateTo);
    } else {
      query.createdAt = { $lte: new Date(filters.dateTo) };
    }
  }
  
  return this.find(query)
    .populate('contact', 'fullName company jobTitle email')
    .sort({ createdAt: -1 });
};

// Static method to get message statistics for a user
messageSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        pendingMessages: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        respondedMessages: { $sum: { $cond: [{ $eq: ['$status', 'responded'] }, 1, 0] } },
        noResponseMessages: { $sum: { $cond: [{ $eq: ['$status', 'no_response'] }, 1, 0] } },
        messagesByType: { $push: '$type' },
        averageResponseTime: {
          $avg: {
            $cond: [
              { $and: [{ $eq: ['$status', 'responded'] }, { $ne: ['$repliedAt', null] }] },
              { $divide: [{ $subtract: ['$repliedAt', '$createdAt'] }, 1000 * 60 * 60] }, // hours
              null
            ]
          }
        }
      }
    }
  ]);
};

// Instance method to simulate reply
messageSchema.methods.simulateReply = function() {
  const replyMessages = [
    "Thanks for reaching out!",
    "I appreciate your message. Let me get back to you soon.",
    "Got your message, thanks!",
    "Thanks for the update. I'll review this and respond accordingly.",
    "Appreciate you thinking of me. Let's connect soon!",
    "Thanks for sharing this with me.",
    "I'll take a look at this and get back to you.",
    "Thanks for keeping me in the loop!",
    "Great to hear from you! Let me review and respond.",
    "Thanks for the heads up!"
  ];
  
  const randomReply = replyMessages[Math.floor(Math.random() * replyMessages.length)];
  
  this.status = 'responded';
  this.replyContent = randomReply;
  this.repliedAt = new Date();
  this.replyTimeoutId = null;
  
  return this.save();
};

// Indexes for better query performance
messageSchema.index({ user: 1, contact: 1 });
messageSchema.index({ user: 1, createdAt: -1 });
messageSchema.index({ user: 1, status: 1 });
messageSchema.index({ user: 1, type: 1 });
messageSchema.index({ contact: 1, createdAt: -1 });
messageSchema.index({ status: 1, createdAt: 1 }); // For cleanup jobs

const Message = mongoose.model('Message', messageSchema);

export default Message;
