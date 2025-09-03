import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  // Reference to the contact this interaction belongs to
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: [true, 'Contact reference is required'],
    index: true
  },
  
  // Reference to the user who owns this interaction
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  
  // Interaction details
  type: {
    type: String,
    enum: ['Email', 'Call', 'Message', 'Meeting', 'Coffee', 'Lunch', 'Conference', 'Referral', 'Other'],
    required: [true, 'Interaction type is required'],
    index: true
  },
  
  content: {
    type: String,
    required: [true, 'Interaction content is required'],
    trim: true,
    maxlength: [2000, 'Interaction content cannot exceed 2000 characters']
  },
  
  // Date and time tracking
  date: {
    type: Date,
    required: [true, 'Interaction date is required'],
    default: Date.now,
    index: true
  },
  
  // Duration for meetings/calls (in minutes)
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative'],
    max: [1440, 'Duration cannot exceed 24 hours']
  },
  
  // Outcome and sentiment analysis
  outcome: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative', 'Follow-up needed', 'Action required'],
    default: 'Neutral',
    index: true
  },
  
  // Message tone (for Mail/LinkedIn drafts)
  tone: {
    type: String,
    trim: true,
    maxlength: [50, 'Tone cannot exceed 50 characters']
  },
  
  // Follow-up tracking
  followUpRequired: {
    type: Boolean,
    default: false
  },
  
  followUpDate: {
    type: Date,
    default: null
  },
  
  followUpNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Follow-up notes cannot exceed 500 characters']
  },
  
  // AI insights and analysis
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'],
      default: 'Neutral'
    },
    keyTopics: [{
      type: String,
      trim: true,
      maxlength: [100, 'Topic cannot exceed 100 characters']
    }],
    actionItems: [{
      item: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Action item cannot exceed 200 characters']
      },
      priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
      },
      dueDate: Date,
      completed: {
        type: Boolean,
        default: false
      }
    }],
    relationshipImpact: {
      type: String,
      enum: ['Strengthened', 'Maintained', 'Weakened', 'No Change'],
      default: 'No Change'
    },
    nextSteps: [{
      step: String,
      priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
      },
      timeline: String
    }]
  },
  
  // Metadata and context
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  
  participants: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Participant name cannot exceed 100 characters']
    },
    role: {
      type: String,
      trim: true,
      maxlength: [100, 'Participant role cannot exceed 100 characters']
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    }
  }],
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Reminders and notifications
  reminders: [{
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Reminder message cannot exceed 200 characters']
    },
    dueDate: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  
  // Attachments and links
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Attachment name cannot exceed 200 characters']
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Attachment URL must be a valid HTTP/HTTPS URL'
      }
    },
    type: {
      type: String,
      enum: ['Document', 'Image', 'Video', 'Audio', 'Other'],
      default: 'Document'
    }
  }],
  
  // Custom fields for flexibility
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true, // Automatically add createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting interaction age in days
interactionSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const interactionDate = new Date(this.date);
  const diffTime = Math.abs(now - interactionDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for checking if follow-up is overdue
interactionSchema.virtual('isFollowUpOverdue').get(function() {
  if (!this.followUpDate) return false;
  const now = new Date();
  const followUpDate = new Date(this.followUpDate);
  return now > followUpDate;
});

// Virtual for getting interaction summary
interactionSchema.virtual('summary').get(function() {
  const summary = `${this.type} on ${this.date.toLocaleDateString()}`;
  if (this.outcome !== 'Neutral') {
    return `${summary} - ${this.outcome}`;
  }
  return summary;
});

// Instance method to add a reminder
interactionSchema.methods.addReminder = function(message, dueDate) {
  this.reminders.push({
    message,
    dueDate: new Date(dueDate),
    sent: false
  });
  return this.save();
};

// Instance method to mark reminder as sent
interactionSchema.methods.markReminderSent = function(reminderId) {
  const reminder = this.reminders.id(reminderId);
  if (reminder) {
    reminder.sent = true;
    reminder.sentAt = new Date();
  }
  return this.save();
};

// Instance method to add action item
interactionSchema.methods.addActionItem = function(item, priority = 'Medium', dueDate = null) {
  this.aiAnalysis.actionItems.push({
    item,
    priority,
    dueDate: dueDate ? new Date(dueDate) : null,
    completed: false
  });
  return this.save();
};

// Instance method to mark action item as completed
interactionSchema.methods.completeActionItem = function(actionItemId) {
  const actionItem = this.aiAnalysis.actionItems.id(actionItemId);
  if (actionItem) {
    actionItem.completed = true;
  }
  return this.save();
};

// Instance method to add participant
interactionSchema.methods.addParticipant = function(name, role = '', company = '') {
  this.participants.push({
    name,
    role,
    company
  });
  return this.save();
};

// Instance method to add attachment
interactionSchema.methods.addAttachment = function(name, url, type = 'Document') {
  this.attachments.push({
    name,
    url,
    type
  });
  return this.save();
};

// Static method to find interactions by user with filters
interactionSchema.statics.findByUserWithFilters = function(userId, filters = {}) {
  const query = { user: userId };
  
  // Apply filters
  if (filters.contactId) {
    query.contact = filters.contactId;
  }
  
  if (filters.type && filters.type !== 'all') {
    query.type = filters.type;
  }
  
  if (filters.outcome && filters.outcome !== 'all') {
    query.outcome = filters.outcome;
  }
  
  if (filters.dateFrom) {
    query.date = { $gte: new Date(filters.dateFrom) };
  }
  
  if (filters.dateTo) {
    if (query.date) {
      query.date.$lte = new Date(filters.dateTo);
    } else {
      query.date = { $lte: new Date(filters.dateTo) };
    }
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  if (filters.followUpRequired) {
    query.followUpRequired = filters.followUpRequired;
  }
  
  return this.find(query)
    .populate('contact', 'fullName company jobTitle')
    .sort({ date: -1 });
};

// Static method to get interaction statistics for a user
interactionSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalInteractions: { $sum: 1 },
        interactionsByType: {
          $push: '$type'
        },
        interactionsByOutcome: {
          $push: '$outcome'
        },
        totalDuration: { $sum: { $ifNull: ['$duration', 0] } },
        followUpsRequired: { $sum: { $cond: ['$followUpRequired', 1, 0] } }
      }
    }
  ]);
};

// Indexes for better query performance
interactionSchema.index({ user: 1, contact: 1 });
interactionSchema.index({ user: 1, date: -1 });
interactionSchema.index({ user: 1, type: 1 });
interactionSchema.index({ user: 1, outcome: 1 });
interactionSchema.index({ user: 1, followUpRequired: 1 });
interactionSchema.index({ user: 1, 'aiAnalysis.sentiment': 1 });
interactionSchema.index({ user: 1, tags: 1 });
interactionSchema.index({ contact: 1, date: -1 });

const Interaction = mongoose.model('Interaction', interactionSchema);

export default Interaction;
