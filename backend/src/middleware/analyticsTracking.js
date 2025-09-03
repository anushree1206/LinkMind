import Analytics from '../models/Analytics.js';

// Middleware to track analytics when contacts are created/updated
export const trackContactAnalytics = async (req, res, next) => {
  try {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override res.json to track analytics after successful response
    res.json = function(data) {
      // Only track if the response is successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Track analytics asynchronously (don't wait for it)
        trackAnalyticsAsync(req.user?.id, 'contact', req.method, data);
      }
      return originalJson.call(this, data);
    };
    
    // Override res.send for other response types
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        trackAnalyticsAsync(req.user?.id, 'contact', req.method, data);
      }
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Error in trackContactAnalytics middleware:', error);
    next(); // Continue even if analytics tracking fails
  }
};

// Middleware to track analytics when interactions are created/updated
export const trackInteractionAnalytics = async (req, res, next) => {
  try {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override res.json to track analytics after successful response
    res.json = function(data) {
      // Only track if the response is successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Track analytics asynchronously (don't wait for it)
        trackAnalyticsAsync(req.user?.id, 'interaction', req.method, data);
      }
      return originalJson.call(this, data);
    };
    
    // Override res.send for other response types
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        trackAnalyticsAsync(req.user?.id, 'interaction', req.method, data);
      }
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Error in trackInteractionAnalytics middleware:', error);
    next(); // Continue even if analytics tracking fails
  }
};

// Async function to track analytics without blocking the response
const trackAnalyticsAsync = async (userId, type, method, responseData) => {
  try {
    if (!userId) return;
    
    // Only track for successful operations
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      // Generate analytics for today
      await Analytics.generateDailyAnalytics(userId, new Date());
    }
  } catch (error) {
    console.error('Error tracking analytics:', error);
    // Don't throw error - analytics tracking should not break the main flow
  }
};

// Middleware to ensure analytics are generated for the current day
export const ensureDailyAnalytics = async (req, res, next) => {
  try {
    if (req.user?.id) {
      // Check if analytics exist for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingAnalytics = await Analytics.findOne({
        user: req.user.id,
        date: today
      });
      
      // If no analytics for today, generate them
      if (!existingAnalytics) {
        // Generate analytics asynchronously
        Analytics.generateDailyAnalytics(req.user.id, today)
          .catch(error => {
            console.error('Error generating daily analytics:', error);
          });
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in ensureDailyAnalytics middleware:', error);
    next(); // Continue even if analytics generation fails
  }
};

// Background job to generate analytics for all users
export const generateAnalyticsForAllUsers = async () => {
  try {
    const User = (await import('../models/User.js')).default;
    const users = await User.find({ isActive: true }).select('_id');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const promises = users.map(user => 
      Analytics.generateDailyAnalytics(user._id, today)
        .catch(error => {
          console.error(`Error generating analytics for user ${user._id}:`, error);
        })
    );
    
    await Promise.allSettled(promises);
    console.log(`Generated analytics for ${users.length} users`);
    
  } catch (error) {
    console.error('Error generating analytics for all users:', error);
  }
};

// Schedule analytics generation (can be called from a cron job)
export const scheduleAnalyticsGeneration = () => {
  // Generate analytics for all users every day at midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    generateAnalyticsForAllUsers();
    
    // Schedule next generation (24 hours later)
    setInterval(generateAnalyticsForAllUsers, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
  
  console.log('Analytics generation scheduled');
};

