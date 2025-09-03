import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getDashboardOverview,
  getDashboardSummary,
  getDashboardNotifications,
  getAtRiskContacts,
  getRelationshipDistribution,
  getRecentContacts,
  getAIInsights
} from '../controllers/dashboardController.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

/**
 * Dashboard Routes
 * All routes require JWT authentication
 */

/**
 * GET /api/dashboard/summary
 * Get complete dashboard summary including:
 * - Total contacts count
 * - Last 7 days activity
 * - Relationship distribution (Strong/Medium/Weak/At-Risk)
 * - Top 3 at-risk contacts
 * - AI insights
 */
router.get('/summary', getDashboardSummary);

/**
 * GET /api/dashboard/overview
 * Get dashboard overview data including:
 * - Total contacts count and change
 * - Weekly activity count and change
 * - Strong relationships count and change
 * - Pending follow-ups count
 */
router.get('/overview', getDashboardOverview);

/**
 * GET /api/dashboard/notifications
 * Get dashboard notifications including:
 * - Due follow-ups this week
 * - Overdue contacts
 * - AI suggestions
 */
router.get('/notifications', getDashboardNotifications);

/**
 * GET /api/dashboard/at-risk-contacts
 * Get top 3 at-risk contacts with:
 * - Risk factor calculation
 * - Suggested actions
 * - AI insights
 * - Message templates (formal, casual, supportive)
 */
router.get('/at-risk-contacts', getAtRiskContacts);

/**
 * GET /api/dashboard/relationship-distribution
 * Get relationship distribution for pie chart:
 * - Strong relationships count
 * - Medium relationships count
 * - Weak relationships count
 * - At-risk contacts count
 */
router.get('/relationship-distribution', getRelationshipDistribution);

/**
 * GET /api/dashboard/recent-contacts
 * Get recent contacts with action buttons:
 * - Last 5 updated contacts
 * - Available actions (message, email, call, linkedin)
 */
router.get('/recent-contacts', getRecentContacts);

/**
 * GET /api/dashboard/ai-insights
 * Get AI insights and smart suggestions:
 * - Priority contacts
 * - Risk factors
 * - Suggested actions
 * - AI explanations
 */
router.get('/ai-insights', getAIInsights);

export default router;
