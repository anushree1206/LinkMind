import Contact from '../models/Contact.js';
import { linkedInPool } from '../../data/linkedinPool.js';
import Interaction from '../models/Interaction.js';

// Simulate fetching new LinkedIn connections
export const syncLinkedIn = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Randomly pick 3-7 contacts from the pool
    const numContacts = Math.floor(Math.random() * 5) + 3;
    const shuffledPool = [...linkedInPool].sort(() => 0.5 - Math.random());
    const selectedContacts = shuffledPool.slice(0, numContacts);
    
    const results = {
      inserted: [],
      skipped: [],
      summary: {
        totalSelected: selectedContacts.length,
        totalInserted: 0,
        totalSkipped: 0
      }
    };
    
    for (const contactData of selectedContacts) {
      // Check if contact already exists (by email or LinkedIn URL)
      const existingContact = await Contact.findOne({
        user: userId,
        $or: [
          { email: contactData.email },
          { linkedInUrl: contactData.linkedInUrl }
        ]
      });
      
      if (existingContact) {
        results.skipped.push({
          fullName: contactData.fullName,
          reason: 'Already exists'
        });
        results.summary.totalSkipped++;
        continue;
      }
      
      // Create new contact
      const newContact = new Contact({
        user: userId,
        fullName: contactData.fullName,
        email: contactData.email,
        company: contactData.company,
        jobTitle: contactData.jobTitle,
        location: contactData.location,
        linkedInUrl: contactData.linkedInUrl,
        tags: contactData.tags,
        source: 'linkedin-sync',
        relationshipStrength: 'Weak', // New connections start as weak
        lastContacted: null
      });
      
      await newContact.save();
      
      results.inserted.push({
        _id: newContact._id,
        fullName: newContact.fullName,
        company: newContact.company,
        jobTitle: newContact.jobTitle,
        email: newContact.email
      });
      
      results.summary.totalInserted++;
    }
    
    res.json({
      success: true,
      message: `LinkedIn sync completed. ${results.summary.totalInserted} new contacts added, ${results.summary.totalSkipped} skipped.`,
      data: results
    });
    
  } catch (error) {
    console.error('LinkedIn sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync LinkedIn contacts',
      error: error.message
    });
  }
};

// Get AI suggestion for interaction
export const getAISuggestion = async (req, res) => {
  try {
    const { contactId, interactionType } = req.body;
    const userId = req.user._id;
    
    // Find the contact
    const contact = await Contact.findOne({ _id: contactId, user: userId });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    // Get last 5 interactions with this contact
    const lastInteractions = await Interaction.find({
      contact: contactId,
      user: userId,
      type: { $in: ['Email', 'LinkedIn', 'Call', 'Meeting'] }
    })
    .sort({ date: -1 })
    .limit(5)
    .lean();
    
    // Generate context from last interactions
    let context = '';
    if (lastInteractions.length > 0) {
      context = 'Previous interactions with this contact:\n';
      lastInteractions.forEach((interaction, index) => {
        const date = new Date(interaction.date).toLocaleDateString();
        context += `${index + 1}. [${date}] ${interaction.type}: ${interaction.content.substring(0, 100)}${interaction.content.length > 100 ? '...' : ''}\n`;
      });
    } else {
      context = 'No previous interactions found with this contact.';
    }
    
    // Generate AI suggestion based on contact, interaction type, and context
    let suggestion = '';
    
    if (interactionType === 'Email') {
      if (lastInteractions.length > 0) {
        // If there are previous interactions, reference them
        const lastInteraction = lastInteractions[0];
        const daysAgo = Math.floor((new Date() - new Date(lastInteraction.date)) / (1000 * 60 * 60 * 24));
        
        suggestion = `Hi ${contact.fullName.split(' ')[0]},\n\n`;
        
        if (daysAgo < 7) {
          suggestion += `I hope you're doing well since we last connected. `;
        } else if (daysAgo < 30) {
          suggestion += `I hope you've been well since we last connected a few weeks ago. `;
        } else {
          suggestion += `I hope this message finds you well. `;
        }
        
        suggestion += `I wanted to follow up on our previous conversation about ${lastInteraction.content.split(' ').slice(0, 5).join(' ')}...\n\n`;
        
        if (contact.jobTitle.toLowerCase().includes('engineer') || contact.jobTitle.toLowerCase().includes('developer')) {
          suggestion += `I've been thinking about how we could potentially collaborate on a technical project. `;
        } else if (contact.jobTitle.toLowerCase().includes('ceo') || contact.jobTitle.toLowerCase().includes('founder')) {
          suggestion += `I've been following ${contact.company}'s progress and am impressed by your recent developments. `;
        }
        
        suggestion += `Would you be available for a quick call next week to discuss this further?\n\nLooking forward to your thoughts.\n\nBest regards`;
      } else {
        // New contact email template
        if (contact.jobTitle.toLowerCase().includes('engineer') || contact.jobTitle.toLowerCase().includes('developer')) {
          suggestion = `Hi ${contact.fullName.split(' ')[0]},\n\nI hope you're doing well! I noticed your work in software development and was impressed by your expertise. I'd love to connect and learn more about your current projects at ${contact.company}.\n\nWould you be interested in a brief conversation about potential collaboration opportunities?\n\nBest regards`;
        } else if (contact.jobTitle.toLowerCase().includes('ceo') || contact.jobTitle.toLowerCase().includes('founder')) {
          suggestion = `Dear ${contact.fullName.split(' ')[0]},\n\nI hope this message finds you well. I've been following ${contact.company}'s journey and am impressed by your leadership and vision.\n\nI believe there could be valuable synergies between our work. Would you be open to a brief discussion about potential partnership opportunities?\n\nLooking forward to hearing from you.\n\nBest regards`;
        } else {
          suggestion = `Hi ${contact.fullName.split(' ')[0]},\n\nI hope you're doing well! I wanted to reach out and connect as I find your work at ${contact.company} very interesting.\n\nI'd love to learn more about your current projects and explore potential collaboration opportunities.\n\nWould you be open to a brief conversation?\n\nBest regards`;
        }
      }
    } else if (interactionType === 'LinkedIn') {
      // LinkedIn connection request template
      if (lastInteractions.length > 0) {
        suggestion = `Hi ${contact.fullName.split(' ')[0]},\n\nI hope you're doing well! I wanted to connect here as well after our recent conversation about ${lastInteractions[0].content.split(' ').slice(0, 4).join(' ')}...\n\nLooking forward to staying in touch!\n\nBest regards`;
      } else {
        suggestion = `Hi ${contact.fullName.split(' ')[0]},\n\nI hope you're doing well! I came across your profile and was impressed by your work at ${contact.company}.\n\nI'd love to connect and learn more about your experience in ${contact.jobTitle}.\n\nLooking forward to connecting!\n\nBest regards`;
      }
    }
    
    res.json({
      success: true,
      data: {
        suggestion,
        contactName: contact.fullName,
        company: contact.company,
        jobTitle: contact.jobTitle,
        context: lastInteractions.length > 0 ? 'Based on previous interactions' : 'No previous interactions found',
        lastContact: lastInteractions[0] ? new Date(lastInteractions[0].date).toLocaleDateString() : 'Never'
      }
    });
    
  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI suggestion',
      error: error.message
    });
  }
};
