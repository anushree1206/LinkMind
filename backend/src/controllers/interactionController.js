import Contact from '../models/Contact.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

/**
 * Add a new interaction to a contact
 * POST /api/contacts/:id/interactions
 */
export const addInteraction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { type, content, outcome = 'Neutral', followUpDate } = req.body;
    const userId = req.user.id;

    // Find the contact and ensure it belongs to the user
    const contact = await Contact.findOne({ _id: id, user: userId });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Add the interaction
    await contact.addInteraction(type, content, outcome, followUpDate ? new Date(followUpDate) : null);

    // Fetch the updated contact with interactions
    const updatedContact = await Contact.findById(id).populate('user', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Interaction added successfully',
      data: {
        contact: updatedContact,
        interaction: updatedContact.interactions[updatedContact.interactions.length - 1]
      }
    });

  } catch (error) {
    console.error('Error adding interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get interactions for a specific contact
 * GET /api/contacts/:id/interactions
 */
export const getContactInteractions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the contact and ensure it belongs to the user
    const contact = await Contact.findOne({ _id: id, user: userId });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Sort interactions by date (most recent first)
    const interactions = contact.interactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        contact: {
          _id: contact._id,
          fullName: contact.fullName,
          company: contact.company,
          jobTitle: contact.jobTitle
        },
        interactions
      }
    });

  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get recent contacts (contacts with recent interactions)
 * GET /api/contacts/recent
 */
export const getRecentContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Find contacts with interactions in the last 30 days, sorted by most recent interaction
    const recentContacts = await Contact.find({
      user: userId,
      'interactions.date': {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      }
    })
    .sort({ lastContacted: -1 })
    .limit(parseInt(limit))
    .select('fullName jobTitle company email relationshipStrength lastContacted interactions tags');

    res.json({
      success: true,
      data: {
        contacts: recentContacts
      }
    });

  } catch (error) {
    console.error('Error fetching recent contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get dashboard summary with all key metrics
 * GET /api/dashboard/summary
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total contacts count
    const totalContacts = await Contact.countDocuments({ user: userId });

    // Get contacts with interactions in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekActivity = await Contact.countDocuments({
      user: userId,
      'interactions.date': { $gte: sevenDaysAgo }
    });

    // Get relationship strength distribution
    const relationshipDistribution = await Contact.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$relationshipStrength',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get strong relationships count
    const strongRelationships = relationshipDistribution.find(r => r._id === 'Strong')?.count || 0;

    // Get pending follow-ups (contacts with follow-up dates in the past)
    const pendingFollowUps = await Contact.countDocuments({
      user: userId,
      'interactions.followUpDate': { $lte: new Date() }
    });

    // Get top 3 at-risk contacts (least recently contacted, lowest strength)
    const atRiskContacts = await Contact.find({
      user: userId,
      $or: [
        { lastContacted: null },
        { lastContacted: { $lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } } // 14 days ago
      ]
    })
    .sort({ lastContacted: 1, relationshipStrength: 1 })
    .limit(3)
    .select('fullName jobTitle company email relationshipStrength lastContacted interactions tags');

    // Calculate AI insights
    const aiInsights = await generateAIInsights(userId);

    res.json({
      success: true,
      data: {
        overview: {
          totalContacts,
          thisWeekActivity,
          strongRelationships,
          pendingFollowUps
        },
        relationshipDistribution: relationshipDistribution.map(item => ({
          strength: item._id,
          count: item.count
        })),
        atRiskContacts,
        aiInsights
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Generate AI insights for the user's contacts
 */
const generateAIInsights = async (userId) => {
  try {
    // Get contacts that need attention (no recent interactions or weak relationships)
    const contactsNeedingAttention = await Contact.find({
      user: userId,
      $or: [
        { lastContacted: null },
        { lastContacted: { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        { relationshipStrength: 'Weak' }
      ]
    })
    .sort({ lastContacted: 1 })
    .limit(5);

    const insights = contactsNeedingAttention.map(contact => {
      const daysSinceContact = contact.lastContacted 
        ? Math.floor((new Date() - new Date(contact.lastContacted)) / (1000 * 60 * 60 * 24))
        : null;

      // Calculate risk factor
      let riskFactor = 0;
      if (!contact.lastContacted) riskFactor += 50;
      else if (daysSinceContact > 30) riskFactor += 40;
      else if (daysSinceContact > 14) riskFactor += 20;

      if (contact.relationshipStrength === 'Weak') riskFactor += 30;
      else if (contact.relationshipStrength === 'Medium') riskFactor += 10;

      // Generate AI explanation
      let explanation = '';
      if (!contact.lastContacted) {
        explanation = 'No previous contact recorded. Consider reaching out to establish the relationship.';
      } else if (daysSinceContact > 30) {
        explanation = `Haven't been in touch for ${daysSinceContact} days. The relationship may be cooling off.`;
      } else if (contact.relationshipStrength === 'Weak') {
        explanation = 'Relationship strength is weak. Regular communication can help strengthen the connection.';
      }

      // Generate suggested actions
      const suggestedActions = [];
      if (contact.jobTitle?.toLowerCase().includes('engineer') || contact.jobTitle?.toLowerCase().includes('developer')) {
        suggestedActions.push('Share a technical article', 'Ask about their latest project');
      } else if (contact.jobTitle?.toLowerCase().includes('ceo') || contact.jobTitle?.toLowerCase().includes('founder')) {
        suggestedActions.push('Discuss industry trends', 'Explore partnership opportunities');
      } else if (contact.jobTitle?.toLowerCase().includes('designer') || contact.jobTitle?.toLowerCase().includes('creative')) {
        suggestedActions.push('Share design inspiration', 'Discuss creative trends');
      } else {
        suggestedActions.push('Ask about current projects', 'Share industry insights');
      }

      return {
        _id: contact._id,
        fullName: contact.fullName,
        company: contact.company,
        jobTitle: contact.jobTitle,
        lastContacted: contact.lastContacted,
        daysSinceContact,
        relationshipStrength: contact.relationshipStrength,
        priority: riskFactor > 70 ? 'high' : riskFactor > 40 ? 'medium' : 'low',
        suggestedActions,
        aiExplanation: explanation,
        riskFactor
      };
    });

    return insights;

  } catch (error) {
    console.error('Error generating AI insights:', error);
    return [];
  }
};
