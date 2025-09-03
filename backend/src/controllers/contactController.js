import Contact from '../models/Contact.js';
import Interaction from '../models/Interaction.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Contact Controller
 * Handles all contact-related operations including CRUD, filtering, and analytics
 */

/**
 * Get all contacts for the authenticated user with optional filters
 * GET /api/contacts
 * Supports: search, tags, relationship strength, location filtering
 */
export const getContacts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    search,
    tags,
    relationshipStrength,
    location,
    page = 1,
    limit = 20,
    sortBy = 'updatedAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filters
  const filters = {};
  if (search) filters.search = search;
  if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
  if (relationshipStrength && relationshipStrength !== 'all') {
    filters.relationshipStrength = relationshipStrength;
  }
  if (location) filters.location = location;

  // Get contacts with filters
  const contacts = await Contact.findByUserWithFilters(userId, filters);

  // Apply sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  // Apply pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginatedContacts = contacts
  .sort((a, b) => {
    if (sortOrder === 'desc') {
      return b[sortBy]?.toString().localeCompare(a[sortBy]?.toString());
    } else {
      return a[sortBy]?.toString().localeCompare(b[sortBy]?.toString());
    }
  })
  .slice(skip, skip + parseInt(limit));


  // Get total count for pagination
  const totalContacts = contacts.length;
  const totalPages = Math.ceil(totalContacts / parseInt(limit));

  // Format contacts for response
  const formattedContacts = paginatedContacts.map(contact => ({
    _id: contact._id,
    fullName: contact.fullName,
    jobTitle: contact.jobTitle,
    company: contact.company,
    email: contact.email,
    phone: contact.phone,
    linkedInUrl: contact.linkedInUrl,
    relationshipStrength: contact.relationshipStrength,
    tags: contact.tags,
    location: contact.location,
    lastContacted: contact.lastContacted,
    notes: contact.notes,
    totalInteractions: contact.totalInteractions,
    daysSinceLastContact: contact.daysSinceLastContact,
    contactAge: contact.contactAge,
    isFavorite: contact.isFavorite,
    source: contact.source,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt
  }));

  res.status(200).json({
    success: true,
    message: 'Contacts retrieved successfully',
    data: {
      contacts: formattedContacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalContacts,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

/**
 * Get a single contact by ID
 * GET /api/contacts/:id
 */
export const getContactById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const contact = await Contact.findOne({ _id: id, user: userId })
    .populate('interactions', 'type content date outcome')
    .populate('user', 'fullName email');

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
      error: 'CONTACT_NOT_FOUND'
    });
  }

  // Get recent interactions
  const recentInteractions = await Interaction.find({ contact: id, user: userId })
    .sort({ date: -1 })
    .limit(10);

  const formattedContact = {
    id: contact._id,
    fullName: contact.fullName,
    jobTitle: contact.jobTitle,
    company: contact.company,
    email: contact.email,
    phone: contact.phone,
    linkedin: contact.linkedin,
    relationshipStrength: contact.relationshipStrength,
    tags: contact.tags,
    location: contact.location,
    lastContacted: contact.lastContacted,
    notes: contact.notes,
    interactions: contact.interactions,
    aiInsights: contact.aiInsights,
    preferences: contact.preferences,
    source: contact.source,
    isFavorite: contact.isFavorite,
    totalInteractions: contact.totalInteractions,
    daysSinceLastContact: contact.daysSinceLastContact,
    contactAge: contact.contactAge,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt
  };

  res.status(200).json({
    success: true,
    message: 'Contact retrieved successfully',
    data: {
      contact: formattedContact,
      recentInteractions
    }
  });
});

/**
 * Create a new contact
 * POST /api/contacts
 */
export const createContact = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    fullName,
    jobTitle,
    company,
    email,
    phone,
    linkedInUrl,
    linkedin, // Support both field names
    relationshipStrength = 'Medium',
    tags = [],
    location,
    notes = [],
    source = 'Manual'
  } = req.body;

  // Create new contact
  const contact = new Contact({
    user: userId,
    fullName,
    jobTitle,
    company,
    email,
    phone,
    linkedInUrl: linkedInUrl || linkedin, // Use either field name
    relationshipStrength,
    tags,
    location,
    notes: notes.map(note => ({ content: note })),
    source
  });

  await contact.save();

  const formattedContact = {
    id: contact._id,
    fullName: contact.fullName,
    jobTitle: contact.jobTitle,
    company: contact.company,
    email: contact.email,
    phone: contact.phone,
    linkedInUrl: contact.linkedInUrl,
    relationshipStrength: contact.relationshipStrength,
    tags: contact.tags,
    location: contact.location,
    notes: contact.notes,
    source: contact.source,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt
  };

  res.status(201).json({
    success: true,
    message: 'Contact created successfully',
    data: {
      contact: formattedContact
    }
  });
});

/**
 * Update an existing contact
 * PUT /api/contacts/:id
 */
export const updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updateData = req.body;

  const contact = await Contact.findOne({ _id: id, user: userId });

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
      error: 'CONTACT_NOT_FOUND'
    });
  }

  // Update allowed fields
  const allowedFields = [
    'fullName', 'jobTitle', 'company', 'email', 'phone', 'linkedin',
    'relationshipStrength', 'tags', 'location', 'source', 'isFavorite'
  ];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      contact[field] = updateData[field];
    }
  });

  // Handle notes separately (array of strings)
  if (updateData.notes && Array.isArray(updateData.notes)) {
    contact.notes = updateData.notes.map(note => ({ content: note }));
  }

  // Handle preferences
  if (updateData.preferences) {
    contact.preferences = { ...contact.preferences, ...updateData.preferences };
  }

  await contact.save();

  const formattedContact = {
    id: contact._id,
    fullName: contact.fullName,
    jobTitle: contact.jobTitle,
    company: contact.company,
    email: contact.email,
    phone: contact.phone,
    linkedin: contact.linkedin,
    relationshipStrength: contact.relationshipStrength,
    tags: contact.tags,
    location: contact.location,
    notes: contact.notes,
    preferences: contact.preferences,
    source: contact.source,
    isFavorite: contact.isFavorite,
    updatedAt: contact.updatedAt
  };

  res.status(200).json({
    success: true,
    message: 'Contact updated successfully',
    data: {
      contact: formattedContact
    }
  });
});

/**
 * Delete a contact
 * DELETE /api/contacts/:id
 */
export const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const contact = await Contact.findOne({ _id: id, user: userId });

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
      error: 'CONTACT_NOT_FOUND'
    });
  }

  // Delete associated interactions first
  await Interaction.deleteMany({ contact: id, user: userId });

  // Delete the contact
  await Contact.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Contact deleted successfully'
  });
});

/**
 * Add a note to a contact
 * POST /api/contacts/:id/notes
 */
export const addNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { content, isImportant = false } = req.body;

  const contact = await Contact.findOne({ _id: id, user: userId });

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
      error: 'CONTACT_NOT_FOUND'
    });
  }

  await contact.addNote(content, isImportant);

  res.status(200).json({
    success: true,
    message: 'Note added successfully',
    data: {
      notes: contact.notes
    }
  });
});

/**
 * Add an interaction to a contact
 * POST /api/contacts/:id/interactions
 */
export const addInteraction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { type, content, outcome = 'Positive', followUpDate = null, tone } = req.body;

  // Validate interaction type
  if (!['Email', 'LinkedIn'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid interaction type. Only Email and LinkedIn are supported.',
      error: 'INVALID_INTERACTION_TYPE'
    });
  }

  const contact = await Contact.findOne({ _id: id, user: userId });

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
      error: 'CONTACT_NOT_FOUND'
      });
  }

  // Create interaction record
  const interaction = new Interaction({
    contact: id,
    user: userId,
    type,
    content,
    outcome,
    tone,
    followUpDate,
    date: new Date()
  });

  await interaction.save();

  // Update contact's lastContacted and add interaction reference
  contact.lastContacted = new Date();
  contact.interactions.push(interaction._id);
  
  // Keep only last 5 interactions
  if (contact.interactions.length > 5) {
    const toRemove = contact.interactions.slice(0, contact.interactions.length - 5);
    await Interaction.deleteMany({ _id: { $in: toRemove } });
    contact.interactions = contact.interactions.slice(-5);
  }
  
  // Recompute relationship strength based on lastContacted
  const days = 0;
  const now = new Date();
  const diffDays = 0;
  
  // Set by rules: Strong 3–5 days, Medium 7–9 days, Weak >15 days
  const daysSince = 0;
  if (contact.lastContacted) {
    const ms = now - new Date(contact.lastContacted);
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (d >= 3 && d <= 5) contact.relationshipStrength = 'Strong';
    else if (d >= 7 && d <= 9) contact.relationshipStrength = 'Medium';
    else if (d > 15) contact.relationshipStrength = 'Weak';
  }
  
  await contact.save();

  res.status(200).json({
    success: true,
    message: 'Interaction added successfully',
    data: {
      interaction: {
        id: interaction._id,
        type: interaction.type,
        content: interaction.content,
        date: interaction.date,
        outcome: interaction.outcome,
        followUpDate: interaction.followUpDate
      },
      lastContacted: contact.lastContacted
    }
  });
});

/**
 * Update relationship strength
 * PUT /api/contacts/:id/relationship-strength
 */
export const updateRelationshipStrength = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { relationshipStrength } = req.body;

  const contact = await Contact.findOne({ _id: id, user: userId });

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
      error: 'CONTACT_NOT_FOUND'
    });
  }

  await contact.updateRelationshipStrength(relationshipStrength);

  res.status(200).json({
    success: true,
    message: 'Relationship strength updated successfully',
    data: {
      relationshipStrength: contact.relationshipStrength
    }
  });
});

/**
 * Get contact statistics for dashboard
 * GET /api/contacts/stats
 */
export const getContactStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await Contact.getUserStats(userId);
  const contactStats = stats[0] || {
    totalContacts: 0,
    strongRelationships: 0,
    mediumRelationships: 0,
    weakRelationships: 0,
    contactsWithInteractions: 0
  };

  // Get recent contacts
  const recentContacts = await Contact.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('fullName company relationshipStrength lastContacted');

  // Get contacts that need follow-up
  const followUpContacts = await Contact.find({
    user: userId,
    lastContacted: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days ago
  })
    .sort({ lastContacted: 1 })
    .limit(10)
    .select('fullName company lastContacted relationshipStrength');

  res.status(200).json({
    success: true,
    message: 'Contact statistics retrieved successfully',
    data: {
      stats: contactStats,
      recentContacts,
      followUpContacts
    }
  });
});

/**
 * Search contacts with advanced filters
 * GET /api/contacts/search
 */
export const searchContacts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    query,
    tags,
    relationshipStrength,
    location,
    hasInteractions,
    lastContactedAfter,
    lastContactedBefore
  } = req.query;

  let searchQuery = { user: userId };

  // Text search
  if (query) {
    searchQuery.$or = [
      { fullName: { $regex: query, $options: 'i' } },
      { company: { $regex: query, $options: 'i' } },
      { jobTitle: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ];
  }

  // Tag filter
  if (tags && tags.length > 0) {
    searchQuery.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }

  // Relationship strength filter
  if (relationshipStrength && relationshipStrength !== 'all') {
    searchQuery.relationshipStrength = relationshipStrength;
  }

  // Location filter
  if (location) {
    searchQuery.location = { $regex: location, $options: 'i' };
  }

  // Has interactions filter
  if (hasInteractions === 'true') {
    searchQuery['interactions.0'] = { $exists: true };
  } else if (hasInteractions === 'false') {
    searchQuery.interactions = { $size: 0 };
  }

  // Last contacted date range
  if (lastContactedAfter || lastContactedBefore) {
    searchQuery.lastContacted = {};
    if (lastContactedAfter) {
      searchQuery.lastContacted.$gte = new Date(lastContactedAfter);
    }
    if (lastContactedBefore) {
      searchQuery.lastContacted.$lte = new Date(lastContactedBefore);
    }
  }

  const contacts = await Contact.find(searchQuery)
    .sort({ updatedAt: -1 })
    .select('fullName jobTitle company email relationshipStrength tags lastContacted');

  res.status(200).json({
    success: true,
    message: 'Search completed successfully',
    data: {
      contacts,
      totalResults: contacts.length
    }
  });
});

/**
 * Bulk update contacts (e.g., add tags, update relationship strength)
 * PUT /api/contacts/bulk-update
 */
export const bulkUpdateContacts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { contactIds, updates } = req.body;

  if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Contact IDs are required',
      error: 'CONTACT_IDS_REQUIRED'
    });
  }

  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Updates are required',
      error: 'UPDATES_REQUIRED'
    });
  }

  // Validate that all contacts belong to the user
  const contacts = await Contact.find({
    _id: { $in: contactIds },
    user: userId
  });

  if (contacts.length !== contactIds.length) {
    return res.status(400).json({
      success: false,
      message: 'Some contacts not found or access denied',
      error: 'INVALID_CONTACT_ACCESS'
    });
  }

  // Prepare update operation
  const updateOperation = {};
  const allowedFields = ['tags', 'relationshipStrength', 'isFavorite'];

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      updateOperation[field] = updates[field];
    }
  });

  // Add tags if specified
  if (updates.addTags && Array.isArray(updates.addTags)) {
    updateOperation.$addToSet = { tags: { $each: updates.addTags } };
  }

  // Remove tags if specified
  if (updates.removeTags && Array.isArray(updates.removeTags)) {
    updateOperation.$pull = { tags: { $in: updates.removeTags } };
  }

  // Perform bulk update
  const result = await Contact.updateMany(
    { _id: { $in: contactIds }, user: userId },
    updateOperation
  );

  res.status(200).json({
    success: true,
    message: 'Contacts updated successfully',
    data: {
      modifiedCount: result.modifiedCount,
      totalContacts: contactIds.length
    }
  });
});

export default {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  addNote,
  addInteraction,
  updateRelationshipStrength,
  getContactStats,
  searchContacts,
  bulkUpdateContacts
};
