import Contact from '../models/Contact.js';
import Interaction from '../models/Interaction.js';
import Analytics from '../models/Analytics.js';
import Message from '../models/Message.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Dashboard Controller
 * Handles all dashboard-related operations including analytics, insights, and notifications
 */

/**
 * Get complete dashboard summary
 * GET /api/dashboard/summary
 * Returns: Total contacts, last 7 days activity, relationship distribution, top 3 at-risk contacts, AI insights
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get total contacts and relationship distribution
  const contactStats = await Contact.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalContacts: { $sum: 1 },
        strongRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Strong'] }, 1, 0] } },
        mediumRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Medium'] }, 1, 0] } },
        weakRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Weak'] }, 1, 0] } },
        atRiskRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'At-Risk'] }, 1, 0] } }
      }
    }
  ]);

  // Get last 7 days activity
  const weeklyActivity = await Interaction.aggregate([
    { $match: { user: userId, date: { $gte: oneWeekAgo } } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  // Get top 3 at-risk contacts
  const atRiskContacts = await Contact.find({
    user: userId,
    relationshipStrength: 'At-Risk'
  })
  .sort({ lastContacted: 1 })
  .limit(3)
  .select('fullName company jobTitle lastContacted relationshipStrength');

  // Get recent contacts (contacts with interactions in last 7 days)
  const recentContacts = await Contact.aggregate([
    { $match: { user: userId } },
    {
      $lookup: {
        from: 'interactions',
        localField: '_id',
        foreignField: 'contact',
        as: 'recentInteractions'
      }
    },
    {
      $match: {
        'recentInteractions.date': { $gte: oneWeekAgo }
      }
    },
    {
      $project: {
        _id: 1,
        fullName: 1,
        company: 1,
        jobTitle: 1,
        email: 1,
        lastContacted: 1,
        relationshipStrength: 1
      }
    },
    { $sort: { lastContacted: -1 } },
    { $limit: 5 }
  ]);

  // Generate AI insights
  const aiInsights = generateAIInsights(contactStats[0], weeklyActivity[0], atRiskContacts);

  const stats = contactStats[0] || {
    totalContacts: 0,
    strongRelationships: 0,
    mediumRelationships: 0,
    weakRelationships: 0,
    atRiskRelationships: 0
  };

  res.status(200).json({
    success: true,
    message: 'Dashboard summary retrieved successfully',
    data: {
      totalContacts: stats.totalContacts,
      last7DaysActivity: weeklyActivity[0]?.count || 0,
      relationshipDistribution: {
        Strong: stats.strongRelationships,
        Medium: stats.mediumRelationships,
        Weak: stats.weakRelationships,
        'At-Risk': stats.atRiskRelationships
      },
      top3AtRiskContacts: atRiskContacts,
      recentContacts: recentContacts,
      aiInsights: aiInsights
    }
  });
});

// Helper function to generate AI insights for dashboard summary
function generateAIInsights(contactStats, weeklyActivity, atRiskContacts) {
  const insights = [];
  
  if (!contactStats) return insights;
  
  const { totalContacts, strongRelationships, mediumRelationships, weakRelationships, atRiskRelationships } = contactStats;
  const weeklyCount = weeklyActivity?.count || 0;
  
  // Relationship strength insights
  if (strongRelationships > 0) {
    insights.push({
      type: 'positive',
      title: 'Strong Network Foundation',
      message: `You have ${strongRelationships} strong relationships. Consider leveraging these connections for referrals and introductions.`
    });
  }
  
  if (atRiskRelationships > 0) {
    insights.push({
      type: 'warning',
      title: 'At-Risk Relationships',
      message: `You have ${atRiskRelationships} contacts marked as at-risk. Prioritize reconnecting with them to strengthen your network.`
    });
  }
  
  // Activity insights
  if (weeklyCount === 0) {
    insights.push({
      type: 'info',
      title: 'Low Activity',
      message: 'No interactions recorded this week. Consider reaching out to maintain your relationships.'
    });
  } else if (weeklyCount >= 5) {
    insights.push({
      type: 'positive',
      title: 'Active Networker',
      message: `Great job! You've had ${weeklyCount} interactions this week. Keep up the momentum!`
    });
  }
  
  // Network growth insights
  if (totalContacts < 10) {
    insights.push({
      type: 'info',
      title: 'Growing Network',
      message: 'Your network is growing. Focus on quality connections and regular follow-ups.'
    });
  } else if (totalContacts >= 50) {
    insights.push({
      type: 'positive',
      title: 'Established Network',
      message: 'You have a substantial network. Focus on deepening existing relationships and strategic outreach.'
    });
  }
  
  return insights;
}

/**
 * Get dashboard overview data
 * GET /api/dashboard/overview
 * Returns: Total contacts, weekly activity, strong relationships, pending follow-ups
 */
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get current month stats
  const currentMonthStats = await Contact.aggregate([
    { $match: { user: userId, createdAt: { $gte: oneMonthAgo } } },
    {
      $group: {
        _id: null,
        totalContacts: { $sum: 1 },
        strongRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Strong'] }, 1, 0] } },
        mediumRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Medium'] }, 1, 0] } },
        weakRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Weak'] }, 1, 0] } }
      }
    }
  ]);

  // Get previous month stats for comparison
  const previousMonthStats = await Contact.aggregate([
    { $match: { user: userId, createdAt: { $gte: twoMonthsAgo, $lt: oneMonthAgo } } },
    {
      $group: {
        _id: null,
        totalContacts: { $sum: 1 },
        strongRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Strong'] }, 1, 0] } },
        mediumRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Medium'] }, 1, 0] } },
        weakRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Weak'] }, 1, 0] } }
      }
    }
  ]);

  // Get weekly activity (interactions in the last 7 days)
  const weeklyActivity = await Interaction.aggregate([
    { $match: { user: userId, date: { $gte: oneWeekAgo } } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  // Get previous week activity for comparison
  const previousWeekActivity = await Interaction.aggregate([
    { 
      $match: { 
        user: userId, 
        date: { 
          $gte: new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
          $lt: oneWeekAgo 
        } 
      } 
    },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  // Get pending follow-ups (contacts not contacted in 30+ days)
  const pendingFollowUps = await Contact.countDocuments({
    user: userId,
    lastContacted: { $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
  });

  // Calculate percentage changes
  const currentStats = currentMonthStats[0] || { totalContacts: 0, strongRelationships: 0, mediumRelationships: 0, weakRelationships: 0 };
  const previousStats = previousMonthStats[0] || { totalContacts: 0, strongRelationships: 0, mediumRelationships: 0, weakRelationships: 0 };
  const currentActivity = weeklyActivity[0]?.count || 0;
  const previousActivity = previousWeekActivity[0]?.count || 0;

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  res.status(200).json({
    success: true,
    message: 'Dashboard overview retrieved successfully',
    data: {
      overview: {
        totalContacts: {
          count: currentStats.totalContacts,
          change: calculatePercentageChange(currentStats.totalContacts, previousStats.totalContacts),
          trend: currentStats.totalContacts > previousStats.totalContacts ? 'up' : 'down'
        },
        weeklyActivity: {
          count: currentActivity,
          change: calculatePercentageChange(currentActivity, previousActivity),
          trend: currentActivity > previousActivity ? 'up' : 'down'
        },
        strongRelationships: {
          count: currentStats.strongRelationships,
          change: calculatePercentageChange(currentStats.strongRelationships, previousStats.strongRelationships),
          trend: currentStats.strongRelationships > previousStats.strongRelationships ? 'up' : 'down'
        },
        pendingFollowUps: {
          count: pendingFollowUps,
          change: 0, // No comparison for follow-ups
          trend: 'neutral'
        }
      }
    }
  });
});

/**
 * Get dashboard notifications
 * GET /api/dashboard/notifications
 * Returns: Due follow-ups, overdue contacts, AI suggestions
 */
export const getDashboardNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get contacts due for follow-up this week
  const dueThisWeek = await Contact.find({
    user: userId,
    lastContacted: { $lt: thirtyDaysAgo },
    $or: [
      { 'aiInsights.nextContactRecommendation': { $lte: oneWeekFromNow } },
      { 'interactions.followUpDate': { $lte: oneWeekFromNow } }
    ]
  })
  .limit(5)
  .select('fullName company lastContacted relationshipStrength');

  // Get overdue contacts (not contacted in 45+ days)
  const overdueContacts = await Contact.find({
    user: userId,
    lastContacted: { $lt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000) }
  })
  .limit(3)
  .select('fullName company lastContacted relationshipStrength');

  // Generate AI suggestions based on relationship strength and last contact
  const aiSuggestions = await Contact.find({
    user: userId,
    relationshipStrength: { $in: ['Weak', 'Medium'] },
    lastContacted: { $lt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) }
  })
  .limit(3)
  .select('fullName company lastContacted relationshipStrength tags');

  const notifications = [];

  // Add due this week notifications
  if (dueThisWeek.length > 0) {
    notifications.push({
      id: 'due-this-week',
      type: 'follow-up',
      title: `${dueThisWeek.length} follow-ups due this week`,
      detail: `Reach out to ${dueThisWeek.map(c => c.fullName).join(', ')}`,
      priority: 'high',
      contacts: dueThisWeek,
      time: 'Today'
    });
  }

  // Add overdue notifications
  if (overdueContacts.length > 0) {
    notifications.push({
      id: 'overdue-contacts',
      type: 'overdue',
      title: `${overdueContacts.length} contacts overdue for follow-up`,
      detail: `${overdueContacts[0]?.fullName} hasn't heard from you in ${Math.floor((now - overdueContacts[0]?.lastContacted) / (1000 * 60 * 60 * 24))} days`,
      priority: 'high',
      contacts: overdueContacts,
      time: '2h ago'
    });
  }

  // Add AI suggestions
  if (aiSuggestions.length > 0) {
    notifications.push({
      id: 'ai-suggestions',
      type: 'ai-tip',
      title: 'New AI tip',
      detail: `Try a friendly tone with ${aiSuggestions[0]?.fullName}`,
      priority: 'medium',
      contacts: aiSuggestions,
      time: 'Yesterday'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Notifications retrieved successfully',
    data: {
      notifications,
      unreadCount: notifications.length
    }
  });
});

/**
 * Get at-risk contacts
 * GET /api/dashboard/at-risk-contacts
 * Returns: Top 3 at-risk contacts with AI insights and action suggestions
 */
export const getAtRiskContacts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);

  // Get at-risk contacts (not contacted in 45+ days or weak relationships)
  const atRiskContacts = await Contact.find({
    user: userId,
    $or: [
      { lastContacted: { $lt: fortyFiveDaysAgo } },
      { relationshipStrength: 'Weak' }
    ]
  })
  .sort({ lastContacted: 1 })
  .limit(3)
  .select('fullName company jobTitle lastContacted relationshipStrength tags notes interactions');

  const formattedContacts = atRiskContacts.map(contact => {
    const daysSinceContact = contact.lastContacted 
      ? Math.floor((now - contact.lastContacted) / (1000 * 60 * 60 * 24))
      : null;

    // Generate AI insights
    const riskFactor = calculateRiskFactor(contact, daysSinceContact);
    const suggestedActions = generateSuggestedActions(contact, daysSinceContact);
    const aiInsights = generateContactAIInsights(contact, daysSinceContact);

    return {
      _id: contact._id,
      fullName: contact.fullName,
      company: contact.company,
      jobTitle: contact.jobTitle,
      lastContacted: contact.lastContacted,
      daysSinceContact,
      relationshipStrength: contact.relationshipStrength,
      tags: contact.tags,
      riskFactor,
      suggestedActions,
      aiInsights,
      // Generate message templates
      messageTemplates: {
        formal: generateMessageTemplate(contact, 'formal'),
        casual: generateMessageTemplate(contact, 'casual'),
        supportive: generateMessageTemplate(contact, 'supportive')
      }
    };
  });

  res.status(200).json({
    success: true,
    message: 'At-risk contacts retrieved successfully',
    data: {
      atRiskContacts: formattedContacts
    }
  });
});

/**
 * Get relationship distribution for pie chart
 * GET /api/dashboard/relationship-distribution
 * Returns: Counts for Strong, Medium, Weak, At-Risk relationships
 */
export const getRelationshipDistribution = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);

  // Get relationship distribution
  const distribution = await Contact.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$relationshipStrength',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get at-risk contacts (not contacted in 45+ days)
  const atRiskCount = await Contact.countDocuments({
    user: userId,
    lastContacted: { $lt: fortyFiveDaysAgo }
  });

  // Format the data for pie chart
  const formattedDistribution = [
    { name: 'Strong', value: 0, color: '#10B981' },
    { name: 'Medium', value: 0, color: '#F59E0B' },
    { name: 'Weak', value: 0, color: '#EF4444' },
    { name: 'At-Risk', value: atRiskCount, color: '#8B5CF6' }
  ];

  // Map the aggregated data
  distribution.forEach(item => {
    const index = formattedDistribution.findIndex(d => d.name === item._id);
    if (index !== -1) {
      formattedDistribution[index].value = item.count;
    }
  });

  res.status(200).json({
    success: true,
    message: 'Relationship distribution retrieved successfully',
    data: {
      distribution: formattedDistribution,
      totalContacts: formattedDistribution.reduce((sum, item) => sum + item.value, 0)
    }
  });
});

/**
 * Get recent contacts
 * GET /api/dashboard/recent-contacts
 * Returns: Recent contacts with action buttons
 */
export const getRecentContacts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const recentContacts = await Contact.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('fullName company jobTitle email relationshipStrength tags lastContacted');

  // Get message data for each contact
  const contactIds = recentContacts.map(contact => contact._id);
  const messages = await Message.find({
    user: userId,
    contact: { $in: contactIds }
  }).sort({ createdAt: -1 });

  // Group messages by contact
  const messagesByContact = {};
  messages.forEach(message => {
    const contactId = message.contact.toString();
    if (!messagesByContact[contactId]) {
      messagesByContact[contactId] = [];
    }
    messagesByContact[contactId].push(message);
  });

  const formattedContacts = recentContacts.map(contact => {
    const contactMessages = messagesByContact[contact._id.toString()] || [];
    const respondedMessages = contactMessages.filter(msg => msg.status === 'responded');
    const pendingMessages = contactMessages.filter(msg => msg.status === 'pending');
    
    // Find latest replied message
    const latestReply = respondedMessages.find(msg => msg.repliedAt);
    
    return {
      _id: contact._id,
      fullName: contact.fullName,
      company: contact.company,
      jobTitle: contact.jobTitle,
      email: contact.email,
      relationshipStrength: contact.relationshipStrength,
      tags: contact.tags,
      lastContacted: contact.lastContacted,
      messageStats: {
        totalMessages: contactMessages.length,
        respondedMessages: respondedMessages.length,
        pendingMessages: pendingMessages.length,
        hasReplied: respondedMessages.length > 0,
        lastReplyDate: latestReply?.repliedAt || null,
        lastReplyContent: latestReply?.replyContent || null,
        responseRate: contactMessages.length > 0 ? Math.round((respondedMessages.length / contactMessages.length) * 100) : 0
      },
      actions: {
        message: true,
        email: !!contact.email,
        call: true,
        linkedin: true
      }
    };
  });

  res.status(200).json({
    success: true,
    message: 'Recent contacts retrieved successfully',
    data: {
      recentContacts: formattedContacts
    }
  });
});

/**
 * Get AI insights and smart suggestions
 * GET /api/dashboard/ai-insights
 * Returns: Priority contacts with AI-generated insights
 */
export const getAIInsights = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();

  // Get contacts that need attention based on various factors
  const priorityContacts = await Contact.find({
    user: userId,
    $or: [
      { relationshipStrength: 'Weak' },
      { lastContacted: { $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
      { 'interactions': { $size: 0 } } // No interactions yet
    ]
  })
  .sort({ lastContacted: 1 })
  .limit(5)
  .select('fullName company jobTitle lastContacted relationshipStrength tags notes interactions');

  const insights = priorityContacts.map(contact => {
    const daysSinceContact = contact.lastContacted 
      ? Math.floor((now - contact.lastContacted) / (1000 * 60 * 60 * 24))
      : null;

    const priority = calculatePriority(contact, daysSinceContact);
    const suggestedActions = generatePriorityActions(contact, daysSinceContact);
    const aiExplanation = generateAIExplanation(contact, daysSinceContact);

    return {
      id: contact._id,
      fullName: contact.fullName,
      company: contact.company,
      jobTitle: contact.jobTitle,
      lastContacted: contact.lastContacted,
      daysSinceContact,
      relationshipStrength: contact.relationshipStrength,
      priority,
      suggestedActions,
      aiExplanation,
      riskFactor: calculateRiskFactor(contact, daysSinceContact)
    };
  });

  res.status(200).json({
    success: true,
    message: 'AI insights retrieved successfully',
    data: {
      insights,
      totalPriorityContacts: insights.length
    }
  });
});

// Helper functions for AI insights and calculations

function calculateRiskFactor(contact, daysSinceContact) {
  let riskFactor = 0;
  
  // Base risk on relationship strength
  switch (contact.relationshipStrength) {
    case 'Weak':
      riskFactor += 40;
      break;
    case 'Medium':
      riskFactor += 20;
      break;
    case 'Strong':
      riskFactor += 5;
      break;
  }

  // Add risk based on days since last contact
  if (daysSinceContact) {
    if (daysSinceContact > 60) riskFactor += 30;
    else if (daysSinceContact > 30) riskFactor += 20;
    else if (daysSinceContact > 14) riskFactor += 10;
  }

  // Add risk if no interactions
  if (!contact.interactions || contact.interactions.length === 0) {
    riskFactor += 25;
  }

  return Math.min(riskFactor, 100);
}

function generateSuggestedActions(contact, daysSinceContact) {
  const actions = [];

  if (daysSinceContact && daysSinceContact > 30) {
    actions.push({
      action: 'Send a catch-up email',
      priority: 'High',
      reason: 'Been too long since last contact'
    });
  }

  if (contact.relationshipStrength === 'Weak') {
    actions.push({
      action: 'Schedule a coffee meeting',
      priority: 'Medium',
      reason: 'Strengthen weak relationship'
    });
  }

  if (!contact.interactions || contact.interactions.length === 0) {
    actions.push({
      action: 'Send initial outreach',
      priority: 'High',
      reason: 'No previous interactions'
    });
  }

  return actions;
}

function generateContactAIInsights(contact, daysSinceContact) {
  const insights = [];

  if (daysSinceContact && daysSinceContact > 45) {
    insights.push('This contact is at high risk of becoming inactive. Immediate outreach recommended.');
  }

  if (contact.relationshipStrength === 'Weak') {
    insights.push('Relationship strength is weak. Consider more personal interactions to strengthen the connection.');
  }

  if (contact.tags && contact.tags.includes('Work')) {
    insights.push('Professional contact - maintain formal but friendly communication.');
  }

  return insights;
}

function generateMessageTemplate(contact, tone) {
  const templates = {
    formal: `Hi ${contact.fullName.split(' ')[0]},\n\nI hope this message finds you well. I wanted to reach out and see how things are going at ${contact.company}.\n\nBest regards,\n[Your name]`,
    casual: `Hey ${contact.fullName.split(' ')[0]}!\n\nJust wanted to check in and see how you're doing. How's everything at ${contact.company}?\n\nCheers,\n[Your name]`,
    supportive: `Hi ${contact.fullName.split(' ')[0]},\n\nI was thinking about you and wanted to see if there's anything I can help you with. I know how busy things can get at ${contact.company}.\n\nTake care,\n[Your name]`
  };

  return templates[tone] || templates.formal;
}

function calculatePriority(contact, daysSinceContact) {
  let priority = 0;

  if (contact.relationshipStrength === 'Weak') priority += 3;
  else if (contact.relationshipStrength === 'Medium') priority += 2;
  else priority += 1;

  if (daysSinceContact && daysSinceContact > 45) priority += 3;
  else if (daysSinceContact && daysSinceContact > 30) priority += 2;
  else if (daysSinceContact && daysSinceContact > 14) priority += 1;

  if (!contact.interactions || contact.interactions.length === 0) priority += 2;

  return Math.min(priority, 5);
}

function generatePriorityActions(contact, daysSinceContact) {
  const actions = [];

  if (daysSinceContact && daysSinceContact > 45) {
    actions.push('Immediate outreach needed');
  }

  if (contact.relationshipStrength === 'Weak') {
    actions.push('Strengthen relationship');
  }

  if (!contact.interactions || contact.interactions.length === 0) {
    actions.push('Initial contact required');
  }

  return actions;
}

function generateAIExplanation(contact, daysSinceContact) {
  let explanation = '';

  if (daysSinceContact && daysSinceContact > 45) {
    explanation += 'High priority due to extended period without contact. ';
  }

  if (contact.relationshipStrength === 'Weak') {
    explanation += 'Weak relationship requires attention to prevent loss of connection. ';
  }

  if (!contact.interactions || contact.interactions.length === 0) {
    explanation += 'No previous interactions indicate this contact needs initial outreach. ';
  }

  return explanation || 'Regular follow-up recommended to maintain relationship.';
}

export default {
  getDashboardOverview,
  getDashboardNotifications,
  getAtRiskContacts,
  getRelationshipDistribution,
  getRecentContacts,
  getAIInsights
};
