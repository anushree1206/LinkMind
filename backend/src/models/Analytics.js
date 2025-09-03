import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  // Reference to the user who owns this analytics data
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  
  // Date for this analytics snapshot (daily aggregation)
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  
  // Contact growth metrics
  contactGrowth: {
    totalContacts: {
      type: Number,
      default: 0,
      min: 0
    },
    newContactsAdded: {
      type: Number,
      default: 0,
      min: 0
    },
    contactsRemoved: {
      type: Number,
      default: 0,
      min: 0
    },
    netGrowth: {
      type: Number,
      default: 0
    }
  },
  
  // Interaction metrics
  interactionMetrics: {
    totalInteractions: {
      type: Number,
      default: 0,
      min: 0
    },
    newInteractions: {
      type: Number,
      default: 0,
      min: 0
    },
    interactionsByType: {
      email: { type: Number, default: 0 },
      call: { type: Number, default: 0 },
      message: { type: Number, default: 0 },
      meeting: { type: Number, default: 0 },
      coffee: { type: Number, default: 0 },
      lunch: { type: Number, default: 0 },
      conference: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    interactionsByOutcome: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      followUpNeeded: { type: Number, default: 0 },
      actionRequired: { type: Number, default: 0 }
    }
  },
  
  // Relationship strength distribution
  relationshipDistribution: {
    strong: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    weak: { type: Number, default: 0 }
  },
  
  // Engagement metrics
  engagementMetrics: {
    activeContacts: {
      type: Number,
      default: 0,
      min: 0
    },
    contactsWithRecentInteractions: {
      type: Number,
      default: 0,
      min: 0
    },
    averageInteractionsPerContact: {
      type: Number,
      default: 0,
      min: 0
    },
    engagementRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Network quality metrics
  networkQuality: {
    averageRelationshipScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    highValueContacts: {
      type: Number,
      default: 0,
      min: 0
    },
    referralPotential: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Growth trends (compared to previous periods)
  growthTrends: {
    contactGrowthRate: {
      type: Number,
      default: 0
    },
    interactionGrowthRate: {
      type: Number,
      default: 0
    },
    engagementGrowthRate: {
      type: Number,
      default: 0
    },
    relationshipQualityGrowthRate: {
      type: Number,
      default: 0
    }
  },
  
  // Time-based metrics
  timeMetrics: {
    totalInteractionDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    averageInteractionDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    followUpsScheduled: {
      type: Number,
      default: 0,
      min: 0
    },
    followUpsCompleted: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // AI insights and recommendations
  aiInsights: {
    networkHealthScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    growthRecommendations: [{
      type: {
        type: String,
        enum: ['Add Contacts', 'Increase Engagement', 'Strengthen Relationships', 'Follow Up', 'Diversify Network'],
        required: true
      },
      priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
      },
      description: {
        type: String,
        required: true,
        maxlength: [500, 'Recommendation description cannot exceed 500 characters']
      },
      impact: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
      }
    }],
    riskFactors: [{
      factor: {
        type: String,
        required: true,
        maxlength: [200, 'Risk factor cannot exceed 200 characters']
      },
      severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
      },
      mitigation: {
        type: String,
        maxlength: [300, 'Mitigation strategy cannot exceed 300 characters']
      }
    }]
  },
  
  // Metadata
  dataSource: {
    type: String,
    enum: ['Daily Aggregation', 'Manual Entry', 'Import', 'AI Analysis'],
    default: 'Daily Aggregation'
  },
  
  isProcessed: {
    type: Boolean,
    default: false
  },
  
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for efficient queries
analyticsSchema.index({ user: 1, date: -1 });
analyticsSchema.index({ user: 1, date: 1 });
analyticsSchema.index({ date: -1 });

// Virtual for getting analytics age in days
analyticsSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const analyticsDate = new Date(this.date);
  const diffTime = Math.abs(now - analyticsDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for getting growth trend direction
analyticsSchema.virtual('growthDirection').get(function() {
  const netGrowth = this.contactGrowth.netGrowth;
  if (netGrowth > 0) return 'Growing';
  if (netGrowth < 0) return 'Declining';
  return 'Stable';
});

// Virtual for getting engagement level
analyticsSchema.virtual('engagementLevel').get(function() {
  const rate = this.engagementMetrics.engagementRate;
  if (rate >= 70) return 'High';
  if (rate >= 40) return 'Medium';
  return 'Low';
});

// Static method to get analytics for a date range
analyticsSchema.statics.getAnalyticsForDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: 1 });
};

// Static method to get latest analytics for a user
analyticsSchema.statics.getLatestAnalytics = function(userId, limit = 30) {
  return this.find({ user: userId })
    .sort({ date: -1 })
    .limit(limit);
};

// Static method to get growth trends for a user
analyticsSchema.statics.getGrowthTrends = function(userId, period = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalContacts: { $last: '$contactGrowth.totalContacts' },
        totalInteractions: { $sum: '$interactionMetrics.newInteractions' },
        averageEngagementRate: { $avg: '$engagementMetrics.engagementRate' },
        averageNetworkHealth: { $avg: '$aiInsights.networkHealthScore' },
        growthData: {
          $push: {
            date: '$date',
            contacts: '$contactGrowth.totalContacts',
            newContacts: '$contactGrowth.newContactsAdded',
            interactions: '$interactionMetrics.newInteractions',
            engagement: '$engagementMetrics.engagementRate'
          }
        }
      }
    }
  ]);
};

// Static method to calculate growth rates
analyticsSchema.statics.calculateGrowthRates = function(userId, currentPeriod, previousPeriod) {
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: previousPeriod.start, $lte: currentPeriod.end }
      }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $gte: ['$date', currentPeriod.start] },
            'current',
            'previous'
          ]
        },
        avgContacts: { $avg: '$contactGrowth.totalContacts' },
        avgInteractions: { $avg: '$interactionMetrics.newInteractions' },
        avgEngagement: { $avg: '$engagementMetrics.engagementRate' }
      }
    }
  ]);
};

// Static method to generate daily analytics for a user
analyticsSchema.statics.generateDailyAnalytics = async function(userId, date = new Date()) {
  const Contact = mongoose.model('Contact');
  const Interaction = mongoose.model('Interaction');
  
  // Set date to start of day
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Get previous day's analytics for comparison
  const previousDate = new Date(targetDate);
  previousDate.setDate(previousDate.getDate() - 1);
  
  const previousAnalytics = await this.findOne({
    user: userId,
    date: previousDate
  });
  
  // Get contact data
  const totalContacts = await Contact.countDocuments({ user: userId });
  const newContacts = await Contact.countDocuments({
    user: userId,
    createdAt: { $gte: targetDate, $lt: nextDay }
  });
  
  // Get interaction data
  const totalInteractions = await Interaction.countDocuments({ user: userId });
  const newInteractions = await Interaction.countDocuments({
    user: userId,
    date: { $gte: targetDate, $lt: nextDay }
  });
  
  // Get interaction breakdowns
  const interactionBreakdown = await Interaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: targetDate, $lt: nextDay }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const outcomeBreakdown = await Interaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: targetDate, $lt: nextDay }
      }
    },
    {
      $group: {
        _id: '$outcome',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get relationship distribution
  const relationshipDistribution = await Contact.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$relationshipStrength',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Calculate engagement metrics
  const activeContacts = await Contact.countDocuments({
    user: userId,
    lastContacted: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });
  
  const engagementRate = totalContacts > 0 ? (activeContacts / totalContacts) * 100 : 0;
  
  // Build analytics object
  const analyticsData = {
    user: userId,
    date: targetDate,
    contactGrowth: {
      totalContacts,
      newContactsAdded: newContacts,
      contactsRemoved: 0, // Would need to track deletions
      netGrowth: newContacts
    },
    interactionMetrics: {
      totalInteractions,
      newInteractions,
      interactionsByType: {
        email: 0, call: 0, message: 0, meeting: 0, coffee: 0,
        lunch: 0, conference: 0, referral: 0, other: 0
      },
      interactionsByOutcome: {
        positive: 0, neutral: 0, negative: 0, followUpNeeded: 0, actionRequired: 0
      }
    },
    relationshipDistribution: {
      strong: 0, medium: 0, weak: 0
    },
    engagementMetrics: {
      activeContacts,
      contactsWithRecentInteractions: activeContacts,
      averageInteractionsPerContact: totalContacts > 0 ? totalInteractions / totalContacts : 0,
      engagementRate
    },
    networkQuality: {
      averageRelationshipScore: 50, // Would need AI analysis
      highValueContacts: 0,
      referralPotential: 0
    },
    growthTrends: {
      contactGrowthRate: 0,
      interactionGrowthRate: 0,
      engagementGrowthRate: 0,
      relationshipQualityGrowthRate: 0
    },
    timeMetrics: {
      totalInteractionDuration: 0,
      averageInteractionDuration: 0,
      followUpsScheduled: 0,
      followUpsCompleted: 0
    },
    aiInsights: {
      networkHealthScore: Math.min(100, Math.max(0, engagementRate)),
      growthRecommendations: [],
      riskFactors: []
    },
    isProcessed: true,
    processedAt: new Date()
  };
  
  // Populate interaction breakdowns
  interactionBreakdown.forEach(item => {
    const type = item._id.toLowerCase();
    if (analyticsData.interactionMetrics.interactionsByType.hasOwnProperty(type)) {
      analyticsData.interactionMetrics.interactionsByType[type] = item.count;
    }
  });
  
  // Populate outcome breakdowns
  outcomeBreakdown.forEach(item => {
    const outcome = item._id.toLowerCase().replace(' ', '');
    if (analyticsData.interactionMetrics.interactionsByOutcome.hasOwnProperty(outcome)) {
      analyticsData.interactionMetrics.interactionsByOutcome[outcome] = item.count;
    }
  });
  
  // Populate relationship distribution
  relationshipDistribution.forEach(item => {
    const strength = item._id.toLowerCase();
    if (analyticsData.relationshipDistribution.hasOwnProperty(strength)) {
      analyticsData.relationshipDistribution[strength] = item.count;
    }
  });
  
  // Calculate growth rates if previous data exists
  if (previousAnalytics) {
    const contactGrowthRate = previousAnalytics.contactGrowth.totalContacts > 0 
      ? ((totalContacts - previousAnalytics.contactGrowth.totalContacts) / previousAnalytics.contactGrowth.totalContacts) * 100
      : 0;
    
    const interactionGrowthRate = previousAnalytics.interactionMetrics.totalInteractions > 0
      ? ((totalInteractions - previousAnalytics.interactionMetrics.totalInteractions) / previousAnalytics.interactionMetrics.totalInteractions) * 100
      : 0;
    
    const engagementGrowthRate = previousAnalytics.engagementMetrics.engagementRate > 0
      ? engagementRate - previousAnalytics.engagementMetrics.engagementRate
      : 0;
    
    analyticsData.growthTrends = {
      contactGrowthRate,
      interactionGrowthRate,
      engagementGrowthRate,
      relationshipQualityGrowthRate: 0
    };
  }
  
  // Generate AI recommendations
  if (engagementRate < 30) {
    analyticsData.aiInsights.growthRecommendations.push({
      type: 'Increase Engagement',
      priority: 'High',
      description: 'Your engagement rate is below 30%. Consider reaching out to more contacts regularly.',
      impact: 'High'
    });
  }
  
  if (newContacts < 2) {
    analyticsData.aiInsights.growthRecommendations.push({
      type: 'Add Contacts',
      priority: 'Medium',
      description: 'Consider adding more contacts to expand your network.',
      impact: 'Medium'
    });
  }
  
  // Create or update analytics record
  return this.findOneAndUpdate(
    { user: userId, date: targetDate },
    analyticsData,
    { upsert: true, new: true }
  );
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;

