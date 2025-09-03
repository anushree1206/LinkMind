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

// Get communication medium effectiveness
// GET /api/analytics/communication-medium-effectiveness?period=30&viewMode=overall&contactId=123
router.get('/communication-medium-effectiveness', (req, res) => {
  const { period = '30', viewMode = 'overall', contactId } = req.query;
  
  const overallData = [
    {
      medium: 'LinkedIn',
      interactions: 45,
      responses: 38,
      responseRate: 84,
      effectiveness: 89
    },
    {
      medium: 'Email',
      interactions: 32,
      responses: 24,
      responseRate: 75,
      effectiveness: 78
    },
    {
      medium: 'Phone',
      interactions: 18,
      responses: 16,
      responseRate: 89,
      effectiveness: 92
    },
    {
      medium: 'In-person',
      interactions: 12,
      responses: 11,
      responseRate: 92,
      effectiveness: 95
    }
  ];

  const contactData = [
    {
      contactId: 'contact1',
      contactName: 'Sarah Chen',
      mediums: [
        { medium: 'LinkedIn', interactions: 8, responses: 7, responseRate: 88, effectiveness: 91 },
        { medium: 'Email', interactions: 5, responses: 4, responseRate: 80, effectiveness: 85 },
        { medium: 'Phone', interactions: 2, responses: 2, responseRate: 100, effectiveness: 95 }
      ]
    },
    {
      contactId: 'contact2',
      contactName: 'John Smith',
      mediums: [
        { medium: 'LinkedIn', interactions: 12, responses: 9, responseRate: 75, effectiveness: 82 },
        { medium: 'Email', interactions: 8, responses: 6, responseRate: 75, effectiveness: 78 },
        { medium: 'Phone', interactions: 3, responses: 3, responseRate: 100, effectiveness: 90 }
      ]
    },
    {
      contactId: 'contact3',
      contactName: 'Emily Rodriguez',
      mediums: [
        { medium: 'LinkedIn', interactions: 15, responses: 13, responseRate: 87, effectiveness: 90 },
        { medium: 'Email', interactions: 10, responses: 7, responseRate: 70, effectiveness: 75 },
        { medium: 'In-person', interactions: 4, responses: 4, responseRate: 100, effectiveness: 98 }
      ]
    }
  ];

  if (viewMode === 'overall') {
    res.json({
      success: true,
      data: {
        overall: overallData,
        period: period
      }
    });
  } else {
    res.json({
      success: true,
      data: {
        byContact: contactData,
        period: period
      }
    });
  }
});

export default router;

