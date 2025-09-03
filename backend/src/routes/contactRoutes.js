import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { trackContactAnalytics, trackInteractionAnalytics } from '../middleware/analyticsTracking.js';
import {
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
} from '../controllers/contactController.js';

const router = express.Router();

// Apply authentication middleware to all contact routes
router.use(authenticateToken);

// Validation middleware
const validateContactCreation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Job title cannot exceed 100 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('linkedin')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),
  body('relationshipStrength')
    .optional()
    .isIn(['Weak', 'Medium', 'Strong'])
    .withMessage('Relationship strength must be Weak, Medium, or Strong'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('notes')
    .optional()
    .isArray()
    .withMessage('Notes must be an array'),
  body('notes.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Each note must be between 1 and 1000 characters'),
  body('source')
    .optional()
    .isIn(['Manual', 'Import', 'LinkedIn', 'Referral', 'Event', 'Other'])
    .withMessage('Invalid source value')
];

const validateContactUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Job title cannot exceed 100 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('linkedin')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),
  body('relationshipStrength')
    .optional()
    .isIn(['Weak', 'Medium', 'Strong'])
    .withMessage('Relationship strength must be Weak, Medium, or Strong'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('notes')
    .optional()
    .isArray()
    .withMessage('Notes must be an array'),
  body('notes.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Each note must be between 1 and 1000 characters'),
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean value')
];

const validateNoteAddition = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Note content must be between 1 and 1000 characters'),
  body('isImportant')
    .optional()
    .isBoolean()
    .withMessage('isImportant must be a boolean value')
];

const validateInteractionAddition = [
  body('type')
    .isIn(['Email', 'Call', 'Message', 'Meeting', 'Coffee', 'Lunch', 'Conference', 'Referral', 'Other'])
    .withMessage('Invalid interaction type'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Interaction content must be between 1 and 2000 characters'),
  body('outcome')
    .optional()
    .isIn(['Positive', 'Neutral', 'Negative', 'Follow-up needed', 'Action required'])
    .withMessage('Invalid outcome value'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Follow-up date must be a valid ISO 8601 date')
];

const validateRelationshipStrengthUpdate = [
  body('relationshipStrength')
    .isIn(['Weak', 'Medium', 'Strong'])
    .withMessage('Relationship strength must be Weak, Medium, or Strong')
];

const validateBulkUpdate = [
  body('contactIds')
    .isArray({ min: 1 })
    .withMessage('Contact IDs must be a non-empty array'),
  body('contactIds.*')
    .isMongoId()
    .withMessage('Each contact ID must be a valid MongoDB ObjectId'),
  body('updates')
    .isObject()
    .withMessage('Updates must be an object')
];

const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['fullName', 'company', 'relationshipStrength', 'lastContacted', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('relationshipStrength')
    .optional()
    .isIn(['Weak', 'Medium', 'Strong', 'all'])
    .withMessage('Invalid relationship strength filter'),
  query('tags')
    .optional()
    .custom(value => {
      if (Array.isArray(value)) {
        return value.every(tag => typeof tag === 'string' && tag.length > 0);
      }
      return typeof value === 'string' && value.length > 0;
    })
    .withMessage('Tags must be a string or array of strings')
];

const validateSearchParams = [
  query('query')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty'),
  query('tags')
    .optional()
    .custom(value => {
      if (Array.isArray(value)) {
        return value.every(tag => typeof tag === 'string' && tag.length > 0);
      }
      return typeof value === 'string' && value.length > 0;
    })
    .withMessage('Tags must be a string or array of strings'),
  query('relationshipStrength')
    .optional()
    .isIn(['Weak', 'Medium', 'Strong', 'all'])
    .withMessage('Invalid relationship strength filter'),
  query('hasInteractions')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('hasInteractions must be true or false'),
  query('lastContactedAfter')
    .optional()
    .isISO8601()
    .withMessage('lastContactedAfter must be a valid ISO 8601 date'),
  query('lastContactedBefore')
    .optional()
    .isISO8601()
    .withMessage('lastContactedBefore must be a valid ISO 8601 date')
];

const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid contact ID format')
];

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts with optional filtering and pagination
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @query   { search?, tags?, relationshipStrength?, location?, page?, limit?, sortBy?, sortOrder? }
 */
router.get('/', validateQueryParams, handleValidationErrors, getContacts);

/**
 * @route   GET /api/contacts/stats
 * @desc    Get contact statistics for dashboard
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.get('/stats', getContactStats);

/**
 * @route   GET /api/contacts/search
 * @desc    Search contacts with advanced filters
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @query   { query?, tags?, relationshipStrength?, location?, hasInteractions?, lastContactedAfter?, lastContactedBefore? }
 */
router.get('/search', validateSearchParams, handleValidationErrors, searchContacts);

/**
 * @route   POST /api/contacts
 * @desc    Create a new contact
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @body    { fullName, jobTitle?, company?, email?, phone?, linkedin?, relationshipStrength?, tags?, location?, notes?, source? }
 */
router.post('/', validateContactCreation, handleValidationErrors, trackContactAnalytics, createContact);

/**
 * @route   PUT /api/contacts/bulk-update
 * @desc    Bulk update multiple contacts
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @body    { contactIds: [string], updates: object }
 */
router.put('/bulk-update', validateBulkUpdate, handleValidationErrors, bulkUpdateContacts);

/**
 * @route   GET /api/contacts/:id
 * @desc    Get a single contact by ID
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @param   { id } - Contact ID
 */
router.get('/:id', validateObjectId, handleValidationErrors, getContactById);

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update an existing contact
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @param   { id } - Contact ID
 * @body    { fullName?, jobTitle?, company?, email?, phone?, linkedin?, relationshipStrength?, tags?, location?, notes?, isFavorite? }
 */
router.put('/:id', validateObjectId, validateContactUpdate, handleValidationErrors, trackContactAnalytics, updateContact);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete a contact
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @param   { id } - Contact ID
 */
router.delete('/:id', validateObjectId, handleValidationErrors, deleteContact);

/**
 * @route   POST /api/contacts/:id/notes
 * @desc    Add a note to a contact
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @param   { id } - Contact ID
 * @body    { content, isImportant? }
 */
router.post('/:id/notes', validateObjectId, validateNoteAddition, handleValidationErrors, addNote);

/**
 * @route   POST /api/contacts/:id/interactions
 * @desc    Add an interaction to a contact
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @param   { id } - Contact ID
 * @body    { type, content, outcome?, followUpDate? }
 */
router.post('/:id/interactions', validateObjectId, validateInteractionAddition, handleValidationErrors, trackInteractionAnalytics, addInteraction);

/**
 * @route   PUT /api/contacts/:id/relationship-strength
 * @desc    Update relationship strength
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @param   { id } - Contact ID
 * @body    { relationshipStrength }
 */
router.put('/:id/relationship-strength', validateObjectId, validateRelationshipStrengthUpdate, handleValidationErrors, updateRelationshipStrength);

export default router;
