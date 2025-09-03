import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import {
  addInteraction,
  getContactInteractions,
  getRecentContacts,
  getDashboardSummary
} from '../controllers/interactionController.js';

const router = express.Router();

// Validation middleware for adding interactions
const validateInteraction = [
  body('type')
    .isIn(['Email', 'Call', 'Message', 'Meeting', 'Coffee', 'Other'])
    .withMessage('Invalid interaction type'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters'),
  body('outcome')
    .optional()
    .isIn(['Positive', 'Neutral', 'Negative', 'Follow-up needed'])
    .withMessage('Invalid outcome value'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Follow-up date must be a valid date')
];

// All routes require authentication
router.use(authenticateToken);

// Add interaction to a contact
router.post('/contacts/:id/interactions', validateInteraction, addInteraction);

// Get interactions for a specific contact
router.get('/contacts/:id/interactions', getContactInteractions);

// Get recent contacts (contacts with recent interactions)
router.get('/contacts/recent', getRecentContacts);

// Get dashboard summary with all metrics
router.get('/dashboard/summary', getDashboardSummary);

export default router;
