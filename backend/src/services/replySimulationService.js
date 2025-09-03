import Message from '../models/Message.js';

class ReplySimulationService {
  constructor() {
    this.activeTimeouts = new Map(); // Track active timeouts for cleanup
  }

  /**
   * Schedule a fake reply for a message with random delay
   * @param {string} messageId - The message ID to schedule reply for
   * @param {number} minDelayMs - Minimum delay in milliseconds (default: 30 seconds)
   * @param {number} maxDelayMs - Maximum delay in milliseconds (default: 40 seconds)
   */
  async scheduleReply(messageId, minDelayMs = 30000, maxDelayMs = 40000) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        console.error(`Message ${messageId} not found for reply simulation`);
        return;
      }

      if (message.status !== 'pending') {
        console.log(`Message ${messageId} is not pending, skipping reply simulation`);
        return;
      }

      // Generate random delay between min and max
      const randomDelay = Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs;
      
      console.log(`Scheduling reply for message ${messageId} in ${Math.round(randomDelay / 1000)} seconds`);

      // Schedule the reply
      const timeoutId = setTimeout(async () => {
        await this.executeReply(messageId);
        this.activeTimeouts.delete(messageId);
      }, randomDelay);

      // Store timeout ID for potential cleanup
      this.activeTimeouts.set(messageId, timeoutId);
      
      // Update message with timeout reference
      message.replyTimeoutId = timeoutId.toString();
      await message.save();

    } catch (error) {
      console.error(`Error scheduling reply for message ${messageId}:`, error);
    }
  }

  /**
   * Execute the reply simulation for a message
   * @param {string} messageId - The message ID to reply to
   */
  async executeReply(messageId) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        console.error(`Message ${messageId} not found for reply execution`);
        return;
      }

      if (message.status !== 'pending') {
        console.log(`Message ${messageId} is no longer pending, skipping reply`);
        return;
      }

      // Simulate the reply
      await message.simulateReply();
      console.log(`Reply simulated for message ${messageId}`);

      // Update contact's lastContacted field
      const Contact = (await import('../models/Contact.js')).default;
      await Contact.findByIdAndUpdate(message.contact, {
        lastContacted: new Date()
      });

    } catch (error) {
      console.error(`Error executing reply for message ${messageId}:`, error);
    }
  }

  /**
   * Cancel a scheduled reply
   * @param {string} messageId - The message ID to cancel reply for
   */
  async cancelScheduledReply(messageId) {
    try {
      const timeoutId = this.activeTimeouts.get(messageId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.activeTimeouts.delete(messageId);
        
        // Clear timeout reference in message
        await Message.findByIdAndUpdate(messageId, {
          replyTimeoutId: null
        });
        
        console.log(`Cancelled scheduled reply for message ${messageId}`);
      }
    } catch (error) {
      console.error(`Error cancelling reply for message ${messageId}:`, error);
    }
  }

  /**
   * Calculate response rate for a user
   * @param {string} userId - The user ID
   * @returns {Promise<number>} Response rate percentage
   */
  async calculateResponseRate(userId) {
    try {
      const stats = await Message.getUserStats(userId);
      if (!stats || stats.length === 0) {
        return 0;
      }

      const { totalMessages, respondedMessages } = stats[0];
      if (totalMessages === 0) return 0;
      
      return Math.round((respondedMessages / totalMessages) * 100);
    } catch (error) {
      console.error(`Error calculating response rate for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Get count of pending follow-ups for a user
   * @param {string} userId - The user ID
   * @returns {Promise<number>} Count of pending messages
   */
  async getPendingFollowUpsCount(userId) {
    try {
      const pendingCount = await Message.countDocuments({
        user: userId,
        status: 'pending'
      });
      
      return pendingCount;
    } catch (error) {
      console.error(`Error getting pending follow-ups for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Get detailed analytics for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Detailed analytics object
   */
  async getUserAnalytics(userId) {
    try {
      const stats = await Message.getUserStats(userId);
      const pendingCount = await this.getPendingFollowUpsCount(userId);
      const responseRate = await this.calculateResponseRate(userId);

      if (!stats || stats.length === 0) {
        return {
          totalMessages: 0,
          pendingMessages: 0,
          respondedMessages: 0,
          noResponseMessages: 0,
          responseRate: 0,
          pendingFollowUps: 0,
          averageResponseTimeHours: 0
        };
      }

      const {
        totalMessages,
        pendingMessages,
        respondedMessages,
        noResponseMessages,
        averageResponseTime
      } = stats[0];

      return {
        totalMessages,
        pendingMessages,
        respondedMessages,
        noResponseMessages,
        responseRate,
        pendingFollowUps: pendingCount,
        averageResponseTimeHours: Math.round(averageResponseTime || 0)
      };
    } catch (error) {
      console.error(`Error getting user analytics for ${userId}:`, error);
      return {
        totalMessages: 0,
        pendingMessages: 0,
        respondedMessages: 0,
        noResponseMessages: 0,
        responseRate: 0,
        pendingFollowUps: 0,
        averageResponseTimeHours: 0
      };
    }
  }

  /**
   * Cleanup expired timeouts (useful for server restarts)
   */
  async cleanupExpiredTimeouts() {
    try {
      // Find messages with timeout IDs that are still pending
      const messagesWithTimeouts = await Message.find({
        status: 'pending',
        replyTimeoutId: { $ne: null }
      });

      for (const message of messagesWithTimeouts) {
        // Check if message is old enough to have expired timeout
        const messageAge = Date.now() - new Date(message.createdAt).getTime();
        const maxTimeout = 300000; // 5 minutes max timeout
        
        if (messageAge > maxTimeout) {
          // Reschedule with shorter delay
          const shortDelay = Math.floor(Math.random() * 60000) + 10000; // 10-70 seconds
          await this.scheduleReply(message._id.toString(), shortDelay, shortDelay + 30000);
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired timeouts:', error);
    }
  }
}

// Export singleton instance
const replySimulationService = new ReplySimulationService();
export default replySimulationService;
