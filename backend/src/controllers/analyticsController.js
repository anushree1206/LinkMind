import Analytics from '../models/Analytics.js';
import Contact from '../models/Contact.js';
import Interaction from '../models/Interaction.js';
import mongoose from 'mongoose';

// Get relationship growth trends for a user
export const getRelationshipGrowthTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 30, startDate, endDate } = req.query;
    
    let query = { user: userId };
    
    // Handle date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last N days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Get analytics data
    const analyticsData = await Analytics.find(query)
      .sort({ date: 1 })
      .select('date contactGrowth interactionMetrics engagementMetrics relationshipDistribution aiInsights');
    
    // Calculate growth trends
    const trends = {
      period: {
        start: startDate ? new Date(startDate) : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate) : new Date()
      },
      summary: {
        totalContacts: 0,
        totalInteractions: 0,
        averageEngagementRate: 0,
        networkHealthScore: 0,
        growthRate: 0
      },
      dailyData: [],
      weeklyData: [],
      monthlyData: []
    };
    
    if (analyticsData.length > 0) {
      // Calculate summary metrics
      const latest = analyticsData[analyticsData.length - 1];
      const earliest = analyticsData[0];
      
      trends.summary = {
        totalContacts: latest.contactGrowth.totalContacts,
        totalInteractions: latest.interactionMetrics.totalInteractions,
        averageEngagementRate: analyticsData.reduce((sum, data) => sum + data.engagementMetrics.engagementRate, 0) / analyticsData.length,
        networkHealthScore: latest.aiInsights.networkHealthScore,
        growthRate: earliest.contactGrowth.totalContacts > 0 
          ? ((latest.contactGrowth.totalContacts - earliest.contactGrowth.totalContacts) / earliest.contactGrowth.totalContacts) * 100
          : 0
      };
      
      // Prepare daily data for charts
      trends.dailyData = analyticsData.map(data => ({
        date: data.date,
        contacts: data.contactGrowth.totalContacts,
        newContacts: data.contactGrowth.newContactsAdded,
        interactions: data.interactionMetrics.newInteractions,
        engagementRate: data.engagementMetrics.engagementRate,
        networkHealth: data.aiInsights.networkHealthScore,
        relationshipDistribution: data.relationshipDistribution
      }));
      
      // Generate weekly aggregations
      const weeklyData = {};
      analyticsData.forEach(data => {
        const weekStart = new Date(data.date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            date: weekStart,
            contacts: 0,
            newContacts: 0,
            interactions: 0,
            engagementRate: 0,
            networkHealth: 0,
            count: 0
          };
        }
        
        weeklyData[weekKey].contacts = Math.max(weeklyData[weekKey].contacts, data.contactGrowth.totalContacts);
        weeklyData[weekKey].newContacts += data.contactGrowth.newContactsAdded;
        weeklyData[weekKey].interactions += data.interactionMetrics.newInteractions;
        weeklyData[weekKey].engagementRate += data.engagementMetrics.engagementRate;
        weeklyData[weekKey].networkHealth += data.aiInsights.networkHealthScore;
        weeklyData[weekKey].count += 1;
      });
      
      trends.weeklyData = Object.values(weeklyData).map(week => ({
        ...week,
        engagementRate: week.engagementRate / week.count,
        networkHealth: week.networkHealth / week.count
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    res.json({
      success: true,
      data: trends
    });
    
  } catch (error) {
    console.error('Error fetching relationship growth trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch relationship growth trends',
      error: error.message
    });
  }
};

// Get detailed analytics for a specific date range
export const getAnalyticsDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, granularity = 'daily' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const analyticsData = await Analytics.getAnalyticsForDateRange(
      userId, 
      startDate, 
      endDate
    );
    
    // Group data by granularity
    let groupedData = {};
    
    analyticsData.forEach(data => {
      let key;
      const date = new Date(data.date);
      
      switch (granularity) {
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          contacts: 0,
          newContacts: 0,
          interactions: 0,
          engagementRate: 0,
          networkHealth: 0,
          relationshipDistribution: { strong: 0, medium: 0, weak: 0 },
          count: 0
        };
      }
      
      groupedData[key].contacts = Math.max(groupedData[key].contacts, data.contactGrowth.totalContacts);
      groupedData[key].newContacts += data.contactGrowth.newContactsAdded;
      groupedData[key].interactions += data.interactionMetrics.newInteractions;
      groupedData[key].engagementRate += data.engagementMetrics.engagementRate;
      groupedData[key].networkHealth += data.aiInsights.networkHealthScore;
      groupedData[key].count += 1;
      
      // Aggregate relationship distribution
      Object.keys(data.relationshipDistribution).forEach(strength => {
        groupedData[key].relationshipDistribution[strength] = Math.max(
          groupedData[key].relationshipDistribution[strength],
          data.relationshipDistribution[strength]
        );
      });
    });
    
    // Calculate averages
    Object.keys(groupedData).forEach(key => {
      const data = groupedData[key];
      if (data.count > 0) {
        data.engagementRate = data.engagementRate / data.count;
        data.networkHealth = data.networkHealth / data.count;
      }
      delete data.count;
    });
    
    const result = Object.values(groupedData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    res.json({
      success: true,
      data: {
        granularity,
        period: { startDate, endDate },
        analytics: result
      }
    });
    
  } catch (error) {
    console.error('Error fetching analytics details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics details',
      error: error.message
    });
  }
};

// Get network health insights
export const getNetworkHealthInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 30 } = req.query;
    
    // Get latest analytics
    const latestAnalytics = await Analytics.findOne({ user: userId })
      .sort({ date: -1 });
    
    if (!latestAnalytics) {
      return res.json({
        success: true,
        data: {
          networkHealth: 50,
          insights: [],
          recommendations: [],
          riskFactors: []
        }
      });
    }
    
    // Get growth trends for comparison
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const previousAnalytics = await Analytics.findOne({
      user: userId,
      date: { $lt: startDate }
    }).sort({ date: -1 });
    
    const insights = [];
    const recommendations = latestAnalytics.aiInsights.growthRecommendations || [];
    const riskFactors = latestAnalytics.aiInsights.riskFactors || [];
    
    // Generate insights based on data
    const engagementRate = latestAnalytics.engagementMetrics.engagementRate;
    const totalContacts = latestAnalytics.contactGrowth.totalContacts;
    const newContacts = latestAnalytics.contactGrowth.newContactsAdded;
    
    if (engagementRate < 30) {
      insights.push({
        type: 'warning',
        title: 'Low Engagement Rate',
        message: `Your engagement rate is ${engagementRate.toFixed(1)}%, which is below the recommended 30%.`,
        impact: 'medium'
      });
    } else if (engagementRate > 70) {
      insights.push({
        type: 'success',
        title: 'High Engagement Rate',
        message: `Excellent! Your engagement rate is ${engagementRate.toFixed(1)}%.`,
        impact: 'high'
      });
    }
    
    if (totalContacts < 50) {
      insights.push({
        type: 'info',
        title: 'Small Network',
        message: `You have ${totalContacts} contacts. Consider expanding your network for better opportunities.`,
        impact: 'medium'
      });
    }
    
    if (previousAnalytics) {
      const contactGrowth = ((totalContacts - previousAnalytics.contactGrowth.totalContacts) / previousAnalytics.contactGrowth.totalContacts) * 100;
      
      if (contactGrowth > 10) {
        insights.push({
          type: 'success',
          title: 'Growing Network',
          message: `Your network has grown by ${contactGrowth.toFixed(1)}% in the last ${period} days.`,
          impact: 'high'
        });
      } else if (contactGrowth < -5) {
        insights.push({
          type: 'warning',
          title: 'Network Decline',
          message: `Your network has decreased by ${Math.abs(contactGrowth).toFixed(1)}% in the last ${period} days.`,
          impact: 'high'
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        networkHealth: latestAnalytics.aiInsights.networkHealthScore,
        insights,
        recommendations,
        riskFactors,
        metrics: {
          totalContacts,
          engagementRate,
          newContacts,
          relationshipDistribution: latestAnalytics.relationshipDistribution
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching network health insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch network health insights',
      error: error.message
    });
  }
};

// Generate analytics for a specific date (admin/background job)
export const generateAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.body;
    
    const targetDate = date ? new Date(date) : new Date();
    
    const analytics = await Analytics.generateDailyAnalytics(userId, targetDate);
    
    res.json({
      success: true,
      message: 'Analytics generated successfully',
      data: analytics
    });
    
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics',
      error: error.message
    });
  }
};

// Get analytics summary for dashboard
export const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get latest analytics
    const latestAnalytics = await Analytics.findOne({ user: userId })
      .sort({ date: -1 });
    
    // Get growth trends for last 30 days
    const trends = await Analytics.getGrowthTrends(userId, 30);
    
    // Get contact and interaction stats
    const contactStats = await Contact.getUserStats(userId);
    const interactionStats = await Interaction.getUserStats(userId);
    
    const summary = {
      current: {
        totalContacts: contactStats[0]?.totalContacts || 0,
        totalInteractions: interactionStats[0]?.totalInteractions || 0,
        engagementRate: latestAnalytics?.engagementMetrics.engagementRate || 0,
        networkHealth: latestAnalytics?.aiInsights.networkHealthScore || 50
      },
      trends: trends[0] || {
        totalContacts: 0,
        totalInteractions: 0,
        averageEngagementRate: 0,
        averageNetworkHealth: 0,
        growthData: []
      },
      growth: {
        contacts: latestAnalytics?.growthTrends.contactGrowthRate || 0,
        interactions: latestAnalytics?.growthTrends.interactionGrowthRate || 0,
        engagement: latestAnalytics?.growthTrends.engagementGrowthRate || 0
      }
    };
    
    res.json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics summary',
      error: error.message
    });
  }
};

// Get interaction trends by type
export const getInteractionTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 30, type } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const matchQuery = {
      user: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    };
    
    if (type && type !== 'all') {
      matchQuery.type = type;
    }
    
    const trends = await Interaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type'
          },
          count: { $sum: 1 },
          totalDuration: { $sum: { $ifNull: ['$duration', 0] } }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          interactions: {
            $push: {
              type: '$_id.type',
              count: '$count',
              duration: '$totalDuration'
            }
          },
          totalCount: { $sum: '$count' },
          totalDuration: { $sum: '$totalDuration' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        trends: trends.map(trend => ({
          date: trend._id,
          totalInteractions: trend.totalCount,
          totalDuration: trend.totalDuration,
          byType: trend.interactions
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching interaction trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interaction trends',
      error: error.message
    });
  }
};

// Get engagement quality breakdown
export const getEngagementQualityBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 30, startDate, endDate } = req.query;
    
    let query = { user: userId };
    
    // Handle date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last N days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Get analytics data with relationship distribution
    const analyticsData = await Analytics.find(query)
      .sort({ date: 1 })
      .select('date relationshipDistribution engagementMetrics');
    
    // Calculate engagement quality metrics
    const breakdown = {
      period: {
        start: startDate ? new Date(startDate) : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate) : new Date()
      },
      summary: {
        totalContacts: 0,
        strongRelationships: 0,
        moderateRelationships: 0,
        weakRelationships: 0,
        averageEngagementRate: 0,
        qualityTrend: 'stable' // 'improving', 'declining', 'stable'
      },
      dailyData: [],
      weeklyData: [],
      monthlyData: [],
      qualityInsights: []
    };
    
    if (analyticsData.length > 0) {
      // Calculate summary metrics from latest data
      const latest = analyticsData[analyticsData.length - 1];
      const earliest = analyticsData[0];
      
      breakdown.summary = {
        totalContacts: latest.relationshipDistribution.strong + 
                      latest.relationshipDistribution.medium + 
                      latest.relationshipDistribution.weak,
        strongRelationships: latest.relationshipDistribution.strong,
        moderateRelationships: latest.relationshipDistribution.medium,
        weakRelationships: latest.relationshipDistribution.weak,
        averageEngagementRate: analyticsData.reduce((sum, data) => sum + data.engagementMetrics.engagementRate, 0) / analyticsData.length
      };
      
      // Calculate quality trend
      const earlyStrong = earliest.relationshipDistribution.strong;
      const latestStrong = latest.relationshipDistribution.strong;
      const earlyTotal = earliest.relationshipDistribution.strong + 
                        earliest.relationshipDistribution.medium + 
                        earliest.relationshipDistribution.weak;
      const latestTotal = latest.relationshipDistribution.strong + 
                         latest.relationshipDistribution.medium + 
                         latest.relationshipDistribution.weak;
      
      if (earlyTotal > 0 && latestTotal > 0) {
        const earlyStrongRatio = earlyStrong / earlyTotal;
        const latestStrongRatio = latestStrong / latestTotal;
        const change = latestStrongRatio - earlyStrongRatio;
        
        if (change > 0.05) {
          breakdown.summary.qualityTrend = 'improving';
        } else if (change < -0.05) {
          breakdown.summary.qualityTrend = 'declining';
        } else {
          breakdown.summary.qualityTrend = 'stable';
        }
      }
      
      // Prepare daily data for charts
      breakdown.dailyData = analyticsData.map(data => ({
        date: data.date,
        strong: data.relationshipDistribution.strong,
        moderate: data.relationshipDistribution.medium,
        weak: data.relationshipDistribution.weak,
        total: data.relationshipDistribution.strong + 
               data.relationshipDistribution.medium + 
               data.relationshipDistribution.weak,
        engagementRate: data.engagementMetrics.engagementRate,
        strongPercentage: data.relationshipDistribution.strong / 
                         (data.relationshipDistribution.strong + 
                          data.relationshipDistribution.medium + 
                          data.relationshipDistribution.weak) * 100
      }));
      
      // Generate weekly aggregations
      const weeklyData = {};
      analyticsData.forEach(data => {
        const weekStart = new Date(data.date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            date: weekStart,
            strong: 0,
            moderate: 0,
            weak: 0,
            total: 0,
            engagementRate: 0,
            count: 0
          };
        }
        
        weeklyData[weekKey].strong = Math.max(weeklyData[weekKey].strong, data.relationshipDistribution.strong);
        weeklyData[weekKey].moderate = Math.max(weeklyData[weekKey].moderate, data.relationshipDistribution.medium);
        weeklyData[weekKey].weak = Math.max(weeklyData[weekKey].weak, data.relationshipDistribution.weak);
        weeklyData[weekKey].total = weeklyData[weekKey].strong + weeklyData[weekKey].moderate + weeklyData[weekKey].weak;
        weeklyData[weekKey].engagementRate += data.engagementMetrics.engagementRate;
        weeklyData[weekKey].count += 1;
      });
      
      breakdown.weeklyData = Object.values(weeklyData).map(week => ({
        ...week,
        engagementRate: week.engagementRate / week.count,
        strongPercentage: week.total > 0 ? (week.strong / week.total) * 100 : 0
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Generate quality insights
      const strongPercentage = breakdown.summary.totalContacts > 0 
        ? (breakdown.summary.strongRelationships / breakdown.summary.totalContacts) * 100 
        : 0;
      
      if (strongPercentage > 60) {
        breakdown.qualityInsights.push({
          type: 'excellent',
          title: 'Excellent Network Quality',
          message: `${strongPercentage.toFixed(1)}% of your contacts are strong relationships. You have a high-quality network!`,
          recommendation: 'Continue nurturing these relationships and consider expanding your network.'
        });
      } else if (strongPercentage > 40) {
        breakdown.qualityInsights.push({
          type: 'good',
          title: 'Good Network Quality',
          message: `${strongPercentage.toFixed(1)}% of your contacts are strong relationships.`,
          recommendation: 'Focus on strengthening moderate relationships to improve overall network quality.'
        });
      } else {
        breakdown.qualityInsights.push({
          type: 'needs-improvement',
          title: 'Network Quality Needs Improvement',
          message: `Only ${strongPercentage.toFixed(1)}% of your contacts are strong relationships.`,
          recommendation: 'Prioritize building deeper connections with existing contacts before adding new ones.'
        });
      }
      
      if (breakdown.summary.qualityTrend === 'improving') {
        breakdown.qualityInsights.push({
          type: 'positive-trend',
          title: 'Improving Quality Trend',
          message: 'Your network quality is improving over time.',
          recommendation: 'Keep up the great work! Continue investing in relationship building.'
        });
      } else if (breakdown.summary.qualityTrend === 'declining') {
        breakdown.qualityInsights.push({
          type: 'warning-trend',
          title: 'Declining Quality Trend',
          message: 'Your network quality has declined recently.',
          recommendation: 'Focus on reconnecting with existing contacts and strengthening relationships.'
        });
      }
      
      if (breakdown.summary.averageEngagementRate < 30) {
        breakdown.qualityInsights.push({
          type: 'low-engagement',
          title: 'Low Engagement Rate',
          message: `Your engagement rate is ${breakdown.summary.averageEngagementRate.toFixed(1)}%.`,
          recommendation: 'Increase regular communication with your contacts to improve relationship quality.'
        });
      }
    }
    
    res.json({
      success: true,
      data: breakdown
    });
    
  } catch (error) {
    console.error('Error fetching engagement quality breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engagement quality breakdown',
      error: error.message
    });
  }
};

// Get AI-powered opportunity suggestions
export const getOpportunitySuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;
    
    // Get recent analytics data
    const recentAnalytics = await Analytics.findOne({ user: userId })
      .sort({ date: -1 });
    
    if (!recentAnalytics) {
      return res.json({
        success: true,
        data: {
          suggestions: [],
          insights: {
            totalContacts: 0,
            atRiskContacts: 0,
            highValueContacts: 0,
            lastAnalyzed: null
          }
        }
      });
    }
    
    // Get contacts data for analysis
    const contacts = await Contact.find({ user: userId })
      .select('fullName company jobTitle relationshipStrength lastContacted interactions createdAt')
      .populate('interactions', 'date type outcome')
      .sort({ lastContacted: 1 });
    
    const suggestions = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    // Analyze contacts and generate suggestions
    for (const contact of contacts) {
      const daysSinceLastContact = contact.lastContacted 
        ? Math.floor((now - new Date(contact.lastContacted)) / (1000 * 60 * 60 * 24))
        : Math.floor((now - new Date(contact.createdAt)) / (1000 * 60 * 60 * 24));
      
      const totalInteractions = contact.interactions ? contact.interactions.length : 0;
      const recentInteractions = contact.interactions ? 
        contact.interactions.filter(i => new Date(i.date) > thirtyDaysAgo).length : 0;
      
      // Priority scoring system
      let priority = 0;
      let suggestionType = '';
      let message = '';
      let action = '';
      let reason = '';
      
      // High-value contact at risk
      if (contact.relationshipStrength === 'Strong' && daysSinceLastContact > 60) {
        priority = 90;
        suggestionType = 'high-value-at-risk';
        message = `Reach out to ${contact.fullName} to prevent risk of losing touch.`;
        action = 'Schedule a call or meeting';
        reason = `Strong relationship, last contacted ${daysSinceLastContact} days ago`;
      }
      // Moderate relationship that could be strengthened
      else if (contact.relationshipStrength === 'Medium' && daysSinceLastContact > 30 && daysSinceLastContact < 90) {
        priority = 75;
        suggestionType = 'strengthen-relationship';
        message = `Strengthen bond with ${contact.fullName}, who could lead to opportunities.`;
        action = 'Plan a meaningful interaction';
        reason = `Moderate relationship with potential, last contacted ${daysSinceLastContact} days ago`;
      }
      // Long-term reconnection needed
      else if (daysSinceLastContact > 90) {
        priority = 80;
        suggestionType = 'reconnect';
        message = `Reconnect with ${contact.fullName}, last contacted ${daysSinceLastContact} days ago.`;
        action = 'Send a thoughtful message or call';
        reason = `Long gap in communication (${daysSinceLastContact} days)`;
      }
      // New contact needs nurturing
      else if (contact.relationshipStrength === 'Weak' && totalInteractions < 3 && daysSinceLastContact < 30) {
        priority = 65;
        suggestionType = 'nurture-new-contact';
        message = `Nurture relationship with ${contact.fullName} to build stronger connection.`;
        action = 'Follow up on previous interaction';
        reason = `New contact with only ${totalInteractions} interactions`;
      }
      // High-value contact needs regular touch
      else if (contact.relationshipStrength === 'Strong' && recentInteractions === 0 && daysSinceLastContact < 30) {
        priority = 60;
        suggestionType = 'maintain-strong-relationship';
        message = `Maintain regular contact with ${contact.fullName} to keep relationship strong.`;
        action = 'Send a quick check-in message';
        reason = `Strong relationship but no recent interactions`;
      }
      // Potential opportunity contact
      else if (contact.company && contact.jobTitle && contact.relationshipStrength === 'Medium' && daysSinceLastContact < 60) {
        priority = 55;
        suggestionType = 'opportunity-potential';
        message = `Explore opportunities with ${contact.fullName} at ${contact.company}.`;
        action = 'Discuss potential collaboration or opportunities';
        reason = `Professional contact at ${contact.company} with moderate relationship`;
      }
      
      // Add context and urgency modifiers
      if (contact.company && contact.jobTitle) {
        priority += 5; // Boost priority for professional contacts
      }
      
      if (daysSinceLastContact > 120) {
        priority += 10; // Urgent for very old contacts
      }
      
      if (totalInteractions > 5) {
        priority += 5; // Boost for contacts with history
      }
      
      // Only add if we have a valid suggestion
      if (priority > 0) {
        suggestions.push({
          id: contact._id,
          contactName: contact.fullName,
          company: contact.company || 'Unknown Company',
          jobTitle: contact.jobTitle || 'Unknown Title',
          type: suggestionType,
          priority,
          message,
          action,
          reason,
          daysSinceLastContact,
          relationshipStrength: contact.relationshipStrength,
          totalInteractions,
          recentInteractions,
          urgency: priority > 80 ? 'high' : priority > 60 ? 'medium' : 'low',
          suggestedDate: new Date(now.getTime() + (priority > 80 ? 1 : priority > 60 ? 3 : 7) * 24 * 60 * 60 * 1000)
        });
      }
    }
    
    // Sort by priority and limit results
    suggestions.sort((a, b) => b.priority - a.priority);
    const topSuggestions = suggestions.slice(0, parseInt(limit));
    
    // Calculate insights
    const atRiskContacts = contacts.filter(c => {
      const daysSince = c.lastContacted 
        ? Math.floor((now - new Date(c.lastContacted)) / (1000 * 60 * 60 * 24))
        : Math.floor((now - new Date(c.createdAt)) / (1000 * 60 * 60 * 1000));
      return daysSince > 60;
    }).length;
    
    const highValueContacts = contacts.filter(c => c.relationshipStrength === 'Strong').length;
    
    const insights = {
      totalContacts: contacts.length,
      atRiskContacts,
      highValueContacts,
      lastAnalyzed: recentAnalytics.date,
      suggestionsGenerated: topSuggestions.length,
      averagePriority: topSuggestions.length > 0 
        ? Math.round(topSuggestions.reduce((sum, s) => sum + s.priority, 0) / topSuggestions.length)
        : 0
    };
    
    res.json({
      success: true,
      data: {
        suggestions: topSuggestions,
        insights
      }
    });
    
  } catch (error) {
    console.error('Error fetching opportunity suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunity suggestions',
      error: error.message
    });
  }
};

// Get communication channel insights
export const getCommunicationChannelInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 30, startDate, endDate } = req.query;
    
    let query = { user: userId };
    
    // Handle date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Get interaction data
    const interactions = await Interaction.find({
      user: userId,
      date: query.date
    }).select('type date');
    
    // Calculate channel breakdown
    const channelBreakdown = {
      email: 0,
      call: 0,
      message: 0,
      meeting: 0,
      coffee: 0,
      lunch: 0,
      conference: 0,
      referral: 0,
      other: 0
    };
    
    interactions.forEach(interaction => {
      const type = interaction.type.toLowerCase();
      if (channelBreakdown.hasOwnProperty(type)) {
        channelBreakdown[type]++;
      }
    });
    
    const totalInteractions = interactions.length;
    const channelPercentages = {};
    
    Object.keys(channelBreakdown).forEach(channel => {
      channelPercentages[channel] = totalInteractions > 0 
        ? Math.round((channelBreakdown[channel] / totalInteractions) * 100)
        : 0;
    });
    
    // Get insights
    const insights = [];
    const topChannel = Object.keys(channelPercentages).reduce((a, b) => 
      channelPercentages[a] > channelPercentages[b] ? a : b
    );
    
    insights.push({
      type: 'primary-channel',
      message: `Your primary communication channel is ${topChannel} (${channelPercentages[topChannel]}%)`,
      recommendation: channelPercentages[topChannel] > 60 
        ? 'Consider diversifying your communication channels for better relationship building'
        : 'Good channel diversity! Keep using multiple communication methods'
    });
    
    if (channelPercentages.email > 50) {
      insights.push({
        type: 'email-heavy',
        message: 'You rely heavily on email communication',
        recommendation: 'Try adding more phone calls or in-person meetings for stronger relationships'
      });
    }
    
    if (channelPercentages.call < 10) {
      insights.push({
        type: 'low-calls',
        message: 'Very few phone calls in your interactions',
        recommendation: 'Phone calls can build stronger relationships - consider scheduling more calls'
      });
    }
    
    res.json({
      success: true,
      data: {
        period: {
          start: startDate ? new Date(startDate) : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000),
          end: endDate ? new Date(endDate) : new Date()
        },
        totalInteractions,
        channelBreakdown,
        channelPercentages,
        insights
      }
    });
    
  } catch (error) {
    console.error('Error fetching communication channel insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication channel insights',
      error: error.message
    });
  }
};

// Get follow-up effectiveness tracker
export const getFollowUpEffectiveness = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // Get interactions with follow-ups
    const interactions = await Interaction.find({
      user: userId,
      followUpRequired: true,
      date: { $gte: startDate, $lte: endDate }
    }).select('date followUpDate outcome followUpNotes');
    
    // Calculate effectiveness metrics
    const totalFollowUps = interactions.length;
    const completedFollowUps = interactions.filter(i => i.followUpDate && new Date(i.followUpDate) <= endDate).length;
    const effectiveFollowUps = interactions.filter(i => 
      i.followUpDate && 
      new Date(i.followUpDate) <= endDate && 
      i.outcome && 
      ['Positive', 'Follow-up needed'].includes(i.outcome)
    ).length;
    
    const completionRate = totalFollowUps > 0 ? Math.round((completedFollowUps / totalFollowUps) * 100) : 0;
    const effectivenessRate = completedFollowUps > 0 ? Math.round((effectiveFollowUps / completedFollowUps) * 100) : 0;
    
    // Get overdue follow-ups
    const overdueFollowUps = interactions.filter(i => 
      i.followUpDate && 
      new Date(i.followUpDate) < new Date() && 
      !i.followUpNotes
    ).length;
    
    const insights = [];
    
    if (completionRate < 50) {
      insights.push({
        type: 'low-completion',
        message: `Only ${completionRate}% of follow-ups are completed on time`,
        recommendation: 'Set reminders and prioritize follow-up tasks to improve completion rate'
      });
    }
    
    if (effectivenessRate < 60) {
      insights.push({
        type: 'low-effectiveness',
        message: `${effectivenessRate}% of completed follow-ups are effective`,
        recommendation: 'Improve follow-up quality by being more specific and timely in your communications'
      });
    }
    
    if (overdueFollowUps > 0) {
      insights.push({
        type: 'overdue-followups',
        message: `${overdueFollowUps} follow-ups are overdue`,
        recommendation: 'Address overdue follow-ups immediately to maintain relationship quality'
      });
    }
    
    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        metrics: {
          totalFollowUps,
          completedFollowUps,
          effectiveFollowUps,
          overdueFollowUps,
          completionRate,
          effectivenessRate
        },
        insights
      }
    });
    
  } catch (error) {
    console.error('Error fetching follow-up effectiveness:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch follow-up effectiveness',
      error: error.message
    });
  }
};

// Get relationship health timeline for top contacts
export const getRelationshipHealthTimeline = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 90, limit = 5 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // Get top contacts by relationship strength and interaction count
    const contacts = await Contact.find({ user: userId })
      .select('fullName company relationshipStrength interactions lastContacted')
      .populate('interactions', 'date type')
      .sort({ relationshipStrength: -1, 'interactions': -1 })
      .limit(parseInt(limit));
    
    const timelineData = [];
    
    for (const contact of contacts) {
      const contactTimeline = {
        contactName: contact.fullName,
        company: contact.company || 'Unknown Company',
        relationshipStrength: contact.relationshipStrength,
        interactions: [],
        averageDaysBetweenContacts: 0,
        lastContactDate: contact.lastContacted,
        daysSinceLastContact: contact.lastContacted 
          ? Math.floor((endDate - new Date(contact.lastContacted)) / (1000 * 60 * 60 * 24))
          : null
      };
      
      // Get interaction dates for timeline
      if (contact.interactions && contact.interactions.length > 0) {
        const interactionDates = contact.interactions
          .map(i => new Date(i.date))
          .filter(date => date >= startDate)
          .sort((a, b) => a - b);
        
        contactTimeline.interactions = interactionDates.map(date => ({
          date: date,
          daysAgo: Math.floor((endDate - date) / (1000 * 60 * 60 * 24))
        }));
        
        // Calculate average days between contacts
        if (interactionDates.length > 1) {
          const totalDays = interactionDates.reduce((sum, date, index) => {
            if (index > 0) {
              return sum + (date - interactionDates[index - 1]) / (1000 * 60 * 60 * 24);
            }
            return sum;
          }, 0);
          contactTimeline.averageDaysBetweenContacts = Math.round(totalDays / (interactionDates.length - 1));
        }
      }
      
      timelineData.push(contactTimeline);
    }
    
    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        contacts: timelineData
      }
    });
    
  } catch (error) {
    console.error('Error fetching relationship health timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch relationship health timeline',
      error: error.message
    });
  }
};

// Get detailed risk contacts analysis
export const getRiskContactsAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    // Get all contacts with risk analysis
    const contacts = await Contact.find({ user: userId })
      .select('fullName company jobTitle relationshipStrength lastContacted interactions createdAt email phone')
      .populate('interactions', 'date type outcome')
      .sort({ lastContacted: 1 });
    
    const riskContacts = [];
    
    for (const contact of contacts) {
      const daysSinceLastContact = contact.lastContacted 
        ? Math.floor((now - new Date(contact.lastContacted)) / (1000 * 60 * 60 * 24))
        : Math.floor((now - new Date(contact.createdAt)) / (1000 * 60 * 60 * 24));
      
      const totalInteractions = contact.interactions ? contact.interactions.length : 0;
      const recentInteractions = contact.interactions ? 
        contact.interactions.filter(i => new Date(i.date) > thirtyDaysAgo).length : 0;
      
      // Calculate risk level
      let riskLevel = 'Low';
      let riskScore = 0;
      let suggestedAction = '';
      let actionType = '';
      
      if (contact.relationshipStrength === 'Strong' && daysSinceLastContact > 60) {
        riskLevel = 'High';
        riskScore = 90;
        suggestedAction = 'Schedule an immediate call or meeting to reconnect';
        actionType = 'schedule_call';
      } else if (contact.relationshipStrength === 'Strong' && daysSinceLastContact > 30) {
        riskLevel = 'Medium';
        riskScore = 70;
        suggestedAction = 'Send a personalized message to maintain connection';
        actionType = 'send_message';
      } else if (contact.relationshipStrength === 'Medium' && daysSinceLastContact > 90) {
        riskLevel = 'High';
        riskScore = 85;
        suggestedAction = 'Reach out with a meaningful update or question';
        actionType = 'send_message';
      } else if (daysSinceLastContact > 120) {
        riskLevel = 'High';
        riskScore = 95;
        suggestedAction = 'Send a reconnection message or call';
        actionType = 'reconnect';
      } else if (contact.relationshipStrength === 'Medium' && daysSinceLastContact > 60) {
        riskLevel = 'Medium';
        riskScore = 60;
        suggestedAction = 'Plan a coffee meeting or phone call';
        actionType = 'schedule_meeting';
      } else if (totalInteractions === 0 && daysSinceLastContact > 30) {
        riskLevel = 'Medium';
        riskScore = 65;
        suggestedAction = 'Initiate first meaningful interaction';
        actionType = 'first_contact';
      }
      
      // Only include contacts with some level of risk
      if (riskScore > 0) {
        riskContacts.push({
          id: contact._id,
          contactName: contact.fullName,
          company: contact.company || 'Unknown Company',
          jobTitle: contact.jobTitle || 'Unknown Title',
          email: contact.email,
          phone: contact.phone,
          relationshipStrength: contact.relationshipStrength,
          riskLevel,
          riskScore,
          daysSinceLastContact,
          lastInteractionDate: contact.lastContacted,
          totalInteractions,
          recentInteractions,
          suggestedAction,
          actionType,
          contactMethods: {
            hasEmail: !!contact.email,
            hasPhone: !!contact.phone
          }
        });
      }
    }
    
    // Sort by risk score and limit results
    riskContacts.sort((a, b) => b.riskScore - a.riskScore);
    const topRiskContacts = riskContacts.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        totalRiskContacts: riskContacts.length,
        highRiskContacts: riskContacts.filter(c => c.riskLevel === 'High').length,
        mediumRiskContacts: riskContacts.filter(c => c.riskLevel === 'Medium').length,
        lowRiskContacts: riskContacts.filter(c => c.riskLevel === 'Low').length,
        contacts: topRiskContacts
      }
    });
    
  } catch (error) {
    console.error('Error fetching risk contacts analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk contacts analysis',
      error: error.message
    });
  }
};

// Get networking score
export const getNetworkingScore = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get comprehensive analytics data
    const [contacts, interactions, analytics] = await Promise.all([
      Contact.find({ user: userId }),
      Interaction.find({ user: userId }),
      Analytics.findOne({ user: userId }).sort({ date: -1 })
    ]);
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    // Calculate networking score components
    let totalScore = 0;
    const maxScore = 100;
    const components = {};
    
    // 1. Network Size (20 points)
    const networkSizeScore = Math.min(20, (contacts.length / 50) * 20);
    components.networkSize = {
      score: Math.round(networkSizeScore),
      maxScore: 20,
      description: 'Network size and reach',
      details: `${contacts.length} contacts`
    };
    totalScore += networkSizeScore;
    
    // 2. Relationship Quality (25 points)
    const strongRelationships = contacts.filter(c => c.relationshipStrength === 'Strong').length;
    const relationshipQualityScore = contacts.length > 0 
      ? (strongRelationships / contacts.length) * 25
      : 0;
    components.relationshipQuality = {
      score: Math.round(relationshipQualityScore),
      maxScore: 25,
      description: 'Quality of relationships',
      details: `${strongRelationships}/${contacts.length} strong relationships`
    };
    totalScore += relationshipQualityScore;
    
    // 3. Activity Level (20 points)
    const recentInteractions = interactions.filter(i => new Date(i.date) > thirtyDaysAgo).length;
    const activityScore = Math.min(20, (recentInteractions / 20) * 20);
    components.activityLevel = {
      score: Math.round(activityScore),
      maxScore: 20,
      description: 'Recent activity level',
      details: `${recentInteractions} interactions in last 30 days`
    };
    totalScore += activityScore;
    
    // 4. Consistency (15 points)
    const interactionsByMonth = {};
    interactions.forEach(interaction => {
      const month = new Date(interaction.date).toISOString().substring(0, 7);
      interactionsByMonth[month] = (interactionsByMonth[month] || 0) + 1;
    });
    const monthsWithActivity = Object.keys(interactionsByMonth).length;
    const consistencyScore = Math.min(15, (monthsWithActivity / 6) * 15);
    components.consistency = {
      score: Math.round(consistencyScore),
      maxScore: 15,
      description: 'Consistency over time',
      details: `${monthsWithActivity} months with activity`
    };
    totalScore += consistencyScore;
    
    // 5. Channel Diversity (10 points)
    const channelCount = new Set(interactions.map(i => i.type)).size;
    const diversityScore = Math.min(10, (channelCount / 5) * 10);
    components.channelDiversity = {
      score: Math.round(diversityScore),
      maxScore: 10,
      description: 'Communication channel diversity',
      details: `${channelCount} different channels used`
    };
    totalScore += diversityScore;
    
    // 6. Follow-up Effectiveness (10 points)
    const followUpInteractions = interactions.filter(i => i.followUpRequired);
    const completedFollowUps = followUpInteractions.filter(i => 
      i.followUpDate && new Date(i.followUpDate) <= now
    ).length;
    const followUpScore = followUpInteractions.length > 0 
      ? (completedFollowUps / followUpInteractions.length) * 10
      : 5; // Neutral score if no follow-ups
    components.followUpEffectiveness = {
      score: Math.round(followUpScore),
      maxScore: 10,
      description: 'Follow-up completion rate',
      details: `${completedFollowUps}/${followUpInteractions.length} follow-ups completed`
    };
    totalScore += followUpScore;
    
    const finalScore = Math.round(Math.min(maxScore, totalScore));
    
    // Determine score category
    let scoreCategory = 'Poor';
    let scoreColor = 'red';
    if (finalScore >= 80) {
      scoreCategory = 'Excellent';
      scoreColor = 'green';
    } else if (finalScore >= 60) {
      scoreCategory = 'Good';
      scoreColor = 'blue';
    } else if (finalScore >= 40) {
      scoreCategory = 'Fair';
      scoreColor = 'yellow';
    }
    
    // Generate recommendations
    const recommendations = [];
    if (components.networkSize.score < 15) {
      recommendations.push('Expand your network by attending events and reaching out to new contacts');
    }
    if (components.relationshipQuality.score < 20) {
      recommendations.push('Focus on building deeper relationships with existing contacts');
    }
    if (components.activityLevel.score < 15) {
      recommendations.push('Increase your interaction frequency to maintain relationships');
    }
    if (components.consistency.score < 10) {
      recommendations.push('Maintain regular contact patterns throughout the year');
    }
    if (components.channelDiversity.score < 7) {
      recommendations.push('Diversify your communication channels (calls, meetings, etc.)');
    }
    if (components.followUpEffectiveness.score < 7) {
      recommendations.push('Improve your follow-up completion rate');
    }
    
    res.json({
      success: true,
      data: {
        overallScore: finalScore,
        maxScore,
        scoreCategory,
        scoreColor,
        components,
        recommendations,
        lastCalculated: now
      }
    });
    
  } catch (error) {
    console.error('Error calculating networking score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate networking score',
      error: error.message
    });
  }
};

