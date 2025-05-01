// Controller for sending recommendation notifications
import axios from 'axios';
import { Recommendation } from '../models/recommendation.js';
import { Product } from '../models/product.js';

// GraphQL client for the notification service
const NOTIFICATION_SERVICE_URL = 'http://localhost:4000/graphql';

export const sendRecommendationNotification = async (recommendationId) => {
  try {
    // Find the recommendation
    const recommendation = await Recommendation.findById(recommendationId);
    
    if (!recommendation || recommendation.isNotified) {
      return false;
    }
    
    // Get product details
    const product = await Product.findOne({ productId: recommendation.productId });
    
    if (!product) {
      console.error(`Product not found for recommendation: ${recommendationId}`);
      return false;
    }
    
    // Prepare notification content
    const content = JSON.stringify({
      productId: product.productId,
      productName: product.name,
      reason: recommendation.reason,
      message: getRecommendationMessage(recommendation.reason, product.name),
      imageUrl: product.imageUrl,
      price: product.price
    });
    
    // Send notification via the notification service
    const mutation = `
      mutation CreateNotification($input: NotificationInput!) {
        createNotification(input: $input) {
          id
        }
      }
    `;
    
    const variables = {
      input: {
        userId: recommendation.userId,
        type: 'recommendation',
        content
      }
    };
    
    const response = await axios.post(NOTIFICATION_SERVICE_URL, {
      query: mutation,
      variables
    });
    
    // Mark recommendation as notified
    recommendation.isNotified = true;
    await recommendation.save();
    
    return true;
  } catch (error) {
    console.error('Error sending recommendation notification:', error);
    return false;
  }
};

// Helper function to generate recommendation messages
function getRecommendationMessage(reason, productName) {
  switch (reason) {
    case 'purchase_history':
      return `Based on your purchases, we think you'll love ${productName}!`;
    case 'browsing_activity':
      return `You've been looking at similar items - check out ${productName}!`;
    case 'similar_users':
      return `Customers like you are enjoying ${productName} right now!`;
    case 'trending':
      return `${productName} is trending now - don't miss out!`;
    default:
      return `We thought you might like ${productName}!`;
  }
}
