// Scheduled recommendation tasks using node-cron
// src/schedulers/cronJobs.js
import cron from 'node-cron';
import axios from 'axios';
import { generateRecommendations } from '../algorithms/recommendationEngine.js';
import { sendRecommendationNotification } from '../controllers/notificationController.js';
import { Recommendation } from '../models/recommendation.js';

// GraphQL endpoint for the user service
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:4001/graphql';

// Set up all cron jobs
export const setupCronJobs = () => {
  // Schedule weekly recommendation generation for all users
  // Run at 2 AM every Sunday
  cron.schedule('0 2 * * 0', async () => {
    console.log('Running weekly recommendation generation');
    await generateRecommendationsForAllUsers();
  });
  
  // Send recommendation notifications daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('Sending daily recommendation notifications');
    await sendPendingRecommendationNotifications();
  });
};

// Generate recommendations for all users
async function generateRecommendationsForAllUsers() {
  try {
    // Get all users who have opted into recommendations via GraphQL API
    const query = `
      query GetUsersWithRecommendationEnabled {
        getUsers(filters: { recommendationsEnabled: true }) {
          id
        }
      }
    `;
    
    const response = await axios.post(USER_SERVICE_URL, { query });
    const users = response.data.data.getUsers || [];
    
    console.log(`Generating recommendations for ${users.length} users`);
    
    // Process in batches to avoid overwhelming the system
    const batchSize = 50;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      // Process each user in the batch
      await Promise.allSettled(
        batch.map(user => generateRecommendations(user._id, 5))
      );
      
      // Small delay between batches
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log('Weekly recommendation generation completed');
  } catch (error) {
    console.error('Error in weekly recommendation generation:', error);
  }
}

// Send pending recommendation notifications
async function sendPendingRecommendationNotifications() {
  try {
    // Find recommendations that haven't been notified yet
    const pendingRecommendations = await Recommendation.find({
      isNotified: false
    }).sort({ score: -1 }).limit(200);
    
    console.log(`Sending notifications for ${pendingRecommendations.length} recommendations`);
    
    // Process in batches
    const batchSize = 20;
    for (let i = 0; i < pendingRecommendations.length; i += batchSize) {
      const batch = pendingRecommendations.slice(i, i + batchSize);
      
      // Send notifications for each recommendation in the batch
      await Promise.allSettled(
        batch.map(recommendation => 
          sendRecommendationNotification(recommendation._id)
        )
      );
      
      // Small delay between batches
      if (i + batchSize < pendingRecommendations.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('Daily recommendation notifications sent');
  } catch (error) {
    console.error('Error sending recommendation notifications:', error);
  }
}
