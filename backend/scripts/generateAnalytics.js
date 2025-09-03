/**
 * Script to generate analytics data for testing
 * Run with: node scripts/generateAnalytics.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Analytics from '../src/models/Analytics.js';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/relationship-manager');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const generateAnalyticsForAllUsers = async () => {
  try {
    console.log('Starting analytics generation...');
    
    // Get all active users
    const users = await User.find({ isActive: true }).select('_id fullName email');
    console.log(`Found ${users.length} active users`);
    
    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      return;
    }
    
    // Generate analytics for the last 30 days for each user
    const today = new Date();
    const promises = [];
    
    for (const user of users) {
      console.log(`Generating analytics for user: ${user.fullName} (${user.email})`);
      
      // Generate analytics for each day in the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        promises.push(
          Analytics.generateDailyAnalytics(user._id, date)
            .catch(error => {
              console.error(`Error generating analytics for user ${user._id} on ${date.toISOString()}:`, error.message);
            })
        );
      }
    }
    
    // Wait for all analytics to be generated
    await Promise.allSettled(promises);
    
    console.log('Analytics generation completed!');
    
    // Show summary
    for (const user of users) {
      const analyticsCount = await Analytics.countDocuments({ user: user._id });
      console.log(`${user.fullName}: ${analyticsCount} analytics records`);
    }
    
  } catch (error) {
    console.error('Error generating analytics:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await generateAnalyticsForAllUsers();
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the script
main();

