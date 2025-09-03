import Contact from '../models/Contact.js';
import { linkedInPool } from '../../data/linkedinPool.js';
import Interaction from '../models/Interaction.js';

// Simulate fetching new LinkedIn connections
export const syncLinkedIn = async (req, res) => {
  try {
    const userId = req.user.id;
    
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
    const userId = req.user.id;
    
    // Find the contact
    const contact = await Contact.findOne({ _id: contactId, user: userId });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    // Generate AI suggestion based on contact and interaction type
    let suggestion = '';
    
    if (interactionType === 'Email') {
      if (contact.jobTitle.toLowerCase().includes('engineer') || contact.jobTitle.toLowerCase().includes('developer')) {
        suggestion = `Hi ${contact.fullName.split(' ')[0]},\n\nI hope you're doing well! I noticed your work in software development and was impressed by your expertise. I'd love to connect and learn more about your current projects at ${contact.company}.\n\nWould you be interested in a brief conversation about potential collaboration opportunities?\n\nBest regards`;
      } else if (contact.jobTitle.toLowerCase().includes('ceo') || contact.jobTitle.toLowerCase().includes('founder')) {
        suggestion = `Dear ${contact.fullName.split(' ')[0]},\n\nI hope this message finds you well. I've been following ${contact.company}'s journey and am impressed by your leadership and vision.\n\nI believe there could be valuable synergies between our work. Would you be open to a brief discussion about potential partnership opportunities?\n\nLooking forward to hearing from you.\n\nBest regards`;
      } else if (contact.jobTitle.toLowerCase().includes('designer') || contact.jobTitle.toLowerCase().includes('creative')) {
        suggestion = `Hi ${contact.fullName.split(' ')[0]},\n\nI hope you're having a great day! I came across your creative work and was truly inspired by your design approach.\n\nI'd love to connect and discuss potential creative collaborations or simply share insights about design trends in our industry.\n\nWould you be interested in a quick chat?\n\nBest regards`;
      } else {
        suggestion = `Hi ${contact.fullName.split(' ')[0]},\n\nI hope you're doing well! I wanted to reach out and connect as I find your work at ${contact.company} very interesting.\n\nI'd love to learn more about your current projects and explore potential collaboration opportunities.\n\nWould you be open to a brief conversation?\n\nBest regards`;
      }
    } else if (interactionType === 'LinkedIn') {
      suggestion = `Hi ${contact.fullName.split(' ')[0]},\n\nI hope you're doing well! I came across your profile and was impressed by your work at ${contact.company}.\n\nI'd love to connect and learn more about your experience in ${contact.jobTitle}.\n\nLooking forward to connecting!\n\nBest regards`;
    }
    
    res.json({
      success: true,
      data: {
        suggestion,
        contactName: contact.fullName,
        company: contact.company,
        jobTitle: contact.jobTitle
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
