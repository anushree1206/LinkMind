import express from 'express';
import { syncLinkedIn, getAISuggestion } from '../controllers/integrationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// LinkedIn sync route
router.post('/linkedin/sync', syncLinkedIn);

// AI suggestion route
router.post('/ai/suggest', getAISuggestion);

export default router;
