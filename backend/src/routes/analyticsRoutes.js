import express from 'express';
import {
  getRelationshipGrowthTrends,
  getAnalyticsDetails,
  getNetworkHealthInsights,
  generateAnalytics,
  getAnalyticsSummary,
  getInteractionTrends,
  getEngagementQualityBreakdown,
  getOpportunitySuggestions,
  getCommunicationChannelInsights,
  getFollowUpEffectiveness,
  getRelationshipHealthTimeline,
  getRiskContactsAnalysis,
  getNetworkingScore
} from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Get relationship growth trends (main analytics endpoint)
// GET /api/analytics/growth-trends?period=30&startDate=2024-01-01&endDate=2024-01-31
router.get('/growth-trends', getRelationshipGrowthTrends);

// Get detailed analytics for a specific date range
// GET /api/analytics/details?startDate=2024-01-01&endDate=2024-01-31&granularity=daily
router.get('/details', getAnalyticsDetails);

// Get network health insights and recommendations
// GET /api/analytics/network-health?period=30
router.get('/network-health', getNetworkHealthInsights);

// Get analytics summary for dashboard
// GET /api/analytics/summary
router.get('/summary', getAnalyticsSummary);

// Get interaction trends by type
// GET /api/analytics/interaction-trends?period=30&type=email
router.get('/interaction-trends', getInteractionTrends);

// Generate analytics for a specific date (background job)
// POST /api/analytics/generate
router.post('/generate', generateAnalytics);

// Get engagement quality breakdown
// GET /api/analytics/engagement-quality?period=30&startDate=2024-01-01&endDate=2024-01-31
router.get('/engagement-quality', getEngagementQualityBreakdown);

// Get AI-powered opportunity suggestions
// GET /api/analytics/opportunity-suggestions?limit=5
router.get('/opportunity-suggestions', getOpportunitySuggestions);

// Get communication channel insights
// GET /api/analytics/communication-channels?period=30&startDate=2024-01-01&endDate=2024-01-31
router.get('/communication-channels', getCommunicationChannelInsights);

// Get follow-up effectiveness tracker
// GET /api/analytics/follow-up-effectiveness?period=30
router.get('/follow-up-effectiveness', getFollowUpEffectiveness);

// Get relationship health timeline
// GET /api/analytics/relationship-health-timeline?period=90&limit=5
router.get('/relationship-health-timeline', getRelationshipHealthTimeline);

// Get detailed risk contacts analysis
// GET /api/analytics/risk-contacts?limit=10
router.get('/risk-contacts', getRiskContactsAnalysis);

// Get networking score
// GET /api/analytics/networking-score
router.get('/networking-score', getNetworkingScore);

export default router;

