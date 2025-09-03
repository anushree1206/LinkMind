import express from 'express';
import {
  createMessage,
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
  getMessageStats
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All message routes require authentication
router.use(authenticateToken);

// Create a new message and schedule reply simulation
// POST /api/messages
router.post('/', createMessage);

// Get messages for a user with filters
// GET /api/messages?contactId=123&status=pending&type=Email&page=1&limit=20
router.get('/', getMessages);

// Get message statistics
// GET /api/messages/stats
router.get('/stats', getMessageStats);

// Get a specific message by ID
// GET /api/messages/:messageId
router.get('/:messageId', getMessageById);

// Update message status (for manual testing)
// PUT /api/messages/:messageId/status
router.put('/:messageId/status', updateMessageStatus);

// Delete a message
// DELETE /api/messages/:messageId
router.delete('/:messageId', deleteMessage);

export default router;
