import { GoogleGenerativeAI } from '@google/generative-ai';
import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { calculateDaysSinceLastContact, getSuggestedFollowUpDate } from '../utils/dateUtils.js';

// Initialize Google's Generative AI
const genAI = process.env.GOOGLE_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
  : null;

/**
 * @desc    Get AI-powered recommendations with connection suggestions
 * @route   GET /api/ai/recommendations
 * @access  Private
 */
export const getAIRecommendations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Fetch recent contacts with their interactions and messages
    const contacts = await Contact.aggregate([
      {
        $match: {
          user: userId,
          $or: [
            { lastContacted: { $exists: true } },
            { 'interactions.0': { $exists: true } }
          ]
        }
      },
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'contact',
          as: 'recentMessages',
          pipeline: [
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 }
          ]
        }
      },
      { $sort: { lastContacted: -1 } },
      { $limit: 20 }
    ]);

    if (!contacts || contacts.length === 0) {
      return res.json({
        success: true,
        data: {
          recommendations: [],
          connectionSuggestions: [],
          quickTips: [
            {
              tip: 'Start by adding contacts and interacting with them to receive personalized recommendations',
              category: 'Getting Started'
            },
            {
              tip: 'Send your first message to a contact to begin building your relationship history',
              category: 'First Steps'
            }
          ]
        }
      });
    }

    // Process contacts for AI analysis
    const contactAnalysis = contacts.map(contact => {
      const daysSinceLastContact = contact.lastContacted 
        ? calculateDaysSinceLastContact(contact.lastContacted) 
        : 90; // Default to 90 days if never contacted
      
      const interactionCount = contact.interactions?.length || 0;
      const recentMessages = (contact.recentMessages || []).map(msg => ({
        type: msg.type,
        content: msg.content,
        date: msg.createdAt,
        direction: msg.senderType === 'user' ? 'outgoing' : 'incoming'
      }));

      return {
        name: contact.fullName,
        jobTitle: contact.jobTitle,
        company: contact.company,
        lastContact: contact.lastContacted || null,
        daysSinceLastContact,
        interactionCount,
        relationshipStrength: contact.relationshipStrength || 3, // 1-5 scale
        tags: contact.tags || [],
        recentMessages,
        suggestedFollowUp: getSuggestedFollowUpDate(contact.lastContacted, interactionCount)
      };
    });

    // Generate AI-powered recommendations
    const recommendations = await generateAISuggestions(contactAnalysis);
    
    // Generate connection suggestions
    const connectionSuggestions = generateConnectionSuggestions(contactAnalysis);

    res.json({
      success: true,
      data: {
        recommendations,
        connectionSuggestions,
        quickTips: [
          {
            tip: 'The best time to follow up is 2-3 days after your last interaction',
            category: 'Follow-up Timing'
          },
          {
            tip: 'Reference past conversations to make your messages more personal',
            category: 'Messaging Tip'
          },
          {
            tip: 'Aim for a balance between professional and personal topics in your messages',
            category: 'Relationship Building'
          }
        ]
      }
    });

  } catch (error) {
    console.error('AI Recommendations Error:', error);
    // Fallback with sample data
    res.json({
      success: true,
      data: getFallbackRecommendations()
    });
  }
});

/**
 * Generate AI-powered suggestions using Gemini API
 */
async function generateAISuggestions(contacts) {
  if (!genAI) return [];

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a professional networking assistant. Analyze the following contact information and provide 3-5 specific, actionable recommendations. 
    Focus on when to connect, who to prioritize, and what to say. Format your response as a JSON array of objects with these exact fields:
    - title: Short title (max 6 words)
    - description: Detailed recommendation
    - priority: high/medium/low
    - suggestedAction: Specific action to take
    - suggestedMessage: Example message (be concise)
    - contactName: Name of the contact this applies to
    
    Contact Data: ${JSON.stringify(contacts, null, 2)}
    
    Return only the JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text());
    
    // Validate and format response
    return Array.isArray(response) 
      ? response.map(rec => ({
          ...rec,
          priority: ['high', 'medium', 'low'].includes(rec.priority?.toLowerCase()) 
            ? rec.priority.toLowerCase() 
            : 'medium'
        }))
      : [];
      
  } catch (error) {
    console.error('AI Suggestion Generation Error:', error);
    return [];
  }
}

/**
 * Generate connection suggestions based on interaction patterns
 */
function generateConnectionSuggestions(contacts) {
  const now = new Date();
  
  return contacts
    .filter(contact => {
      // Filter for contacts who should be followed up with soon
      const needsFollowUp = contact.daysSinceLastContact >= 14; // 2+ weeks since last contact
      const hasRecentMessages = contact.recentMessages?.length > 0;
      return needsFollowUp && hasRecentMessages;
    })
    .map(contact => {
      const lastInteraction = contact.recentMessages[0];
      const suggestedDate = contact.suggestedFollowUp;
      
      return {
        contactId: contact._id,
        contactName: contact.name,
        lastInteraction: contact.lastContact,
        daysSinceLastContact: contact.daysSinceLastContact,
        suggestedDate,
        suggestedMessage: generateSuggestedMessage(contact, lastInteraction)
      };
    })
    .sort((a, b) => a.daysSinceLastContact - b.daysSinceLastContact) // Most overdue first
    .slice(0, 5); // Limit to top 5 suggestions
}

/**
 * Generate a personalized follow-up message
 */
function generateSuggestedMessage(contact, lastInteraction) {
  const { name, jobTitle, company, recentMessages = [] } = contact;
  const lastMessage = recentMessages[0];
  
  if (lastMessage?.direction === 'outgoing') {
    // Following up on your last message
    return `Hi ${name.split(' ')[0]}, just following up on my last message. ${jobTitle ? `Hope everything's going well at ${company}!` : 'Hope you're doing well!'}`;
  } else if (lastMessage?.direction === 'incoming') {
    // Responding to their last message
    return `Hi ${name.split(' ')[0]}, thanks for your message! ${jobTitle ? `How's everything going at ${company}?` : 'How have you been?'}`;
  } else {
    // Generic follow-up
    return `Hi ${name.split(' ')[0]}, it's been a while! ${jobTitle ? `How's everything going at ${company}?` : 'How have you been?'} Would love to catch up soon.`;
  }
}

/**
 * Fallback recommendations when AI service is unavailable
 */
function getFallbackRecommendations() {
  return {
    recommendations: [
      {
        title: 'Follow up with key contacts',
        description: 'Reach out to contacts you haven\'t connected with in the last 2 weeks',
        priority: 'high',
        suggestedAction: 'Send a follow-up message',
        suggestedMessage: 'Hi [Name], just wanted to check in and see how you\'ve been!',
        contactName: 'Multiple contacts'
      },
      {
        title: 'Update contact details',
        description: 'Review and update contact information for accuracy',
        priority: 'medium',
        suggestedAction: 'Verify contact details',
        suggestedMessage: '',
        contactName: 'All contacts'
      }
    ],
    connectionSuggestions: [],
    quickTips: [
      {
        tip: 'Personalize your messages by referencing past conversations',
        category: 'Messaging Tip'
      },
      {
        tip: 'Aim to follow up within 2-3 days after meeting someone new',
        category: 'Best Practice'
      }
    ]
  };
}

export default {
  getAIRecommendations,
};
