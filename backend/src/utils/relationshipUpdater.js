import Contact from '../models/Contact.js';

/**
 * Update relationship strengths for all contacts based on last interaction dates
 */
export const updateAllRelationshipStrengths = async () => {
  try {
    console.log('Starting relationship strength update job...');
    
    // Get all contacts
    const contacts = await Contact.find({});
    let updatedCount = 0;
    
    for (const contact of contacts) {
      const oldStrength = contact.relationshipStrength;
      contact.updateRelationshipStrengthByDate();
      
      // Only save if strength changed
      if (contact.relationshipStrength !== oldStrength) {
        await contact.save();
        updatedCount++;
        console.log(`Updated ${contact.fullName}: ${oldStrength} → ${contact.relationshipStrength}`);
      }
    }
    
    console.log(`Relationship strength update completed. ${updatedCount} contacts updated out of ${contacts.length} total.`);
    return { totalContacts: contacts.length, updatedCount };
    
  } catch (error) {
    console.error('Error updating relationship strengths:', error);
    throw error;
  }
};

/**
 * Update relationship strength for a specific user's contacts
 */
export const updateUserRelationshipStrengths = async (userId) => {
  try {
    console.log(`Starting relationship strength update for user ${userId}...`);
    
    const contacts = await Contact.find({ user: userId });
    let updatedCount = 0;
    
    for (const contact of contacts) {
      const oldStrength = contact.relationshipStrength;
      contact.updateRelationshipStrengthByDate();
      
      if (contact.relationshipStrength !== oldStrength) {
        await contact.save();
        updatedCount++;
      }
    }
    
    console.log(`User relationship strength update completed. ${updatedCount} contacts updated.`);
    return { totalContacts: contacts.length, updatedCount };
    
  } catch (error) {
    console.error('Error updating user relationship strengths:', error);
    throw error;
  }
};

/**
 * Get contacts that need attention (At-Risk or haven't been contacted in a while)
 */
export const getContactsNeedingAttention = async (userId) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    
    const atRiskContacts = await Contact.find({
      user: userId,
      $or: [
        { relationshipStrength: 'At-Risk' },
        { lastContacted: { $lt: thirtyDaysAgo } },
        { lastContacted: null, createdAt: { $lt: sixtyDaysAgo } }
      ]
    }).select('fullName company relationshipStrength lastContacted createdAt')
      .sort({ lastContacted: 1 })
      .limit(10);
    
    return atRiskContacts;
  } catch (error) {
    console.error('Error getting contacts needing attention:', error);
    throw error;
  }
};
