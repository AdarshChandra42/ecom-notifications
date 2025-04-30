// GraphQL resolvers
import { UserActivity } from '../models/userActivity.js';
import { Recommendation } from '../models/recommendation.js';
import { Product } from '../models/product.js';
import { generateRecommendations } from '../algorithms/recommendationEngine.js';
import { publishRecommendationGenerated } from '../queue/producer.js';
import { sendRecommendationNotification } from '../controllers/notificationController.js';
import { Kind } from 'graphql';

export const resolvers = {
  JSON: {
    // Custom scalar for JSON
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast) => {
      switch (ast.kind) {
        case Kind.STRING:
          return JSON.parse(ast.value);
        case Kind.INT:
          return parseInt(ast.value, 10);
        case Kind.FLOAT:
          return parseFloat(ast.value);
        case Kind.BOOLEAN:
          return ast.value;
        case Kind.OBJECT:
          return ast.fields.reduce((obj, field) => {
            obj[field.name.value] = field.value.value;
            return obj;
          }, {});
        case Kind.LIST:
          return ast.values.map((value) => value.value);
        default:
          return null;
      }
    }
  },
  
  Query: {
    getRecommendations: async (_, { userId, limit = 10 }) => {
      return await Recommendation.find({ userId })
        .sort({ score: -1 })
        .limit(limit);
    },
    
    getRecommendation: async (_, { id }) => {
      return await Recommendation.findById(id);
    },
    
    getUserActivities: async (_, { userId, limit = 20 }) => {
      return await UserActivity.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit);
    }
  },
  
  Mutation: {
    trackUserActivity: async (_, { input }) => {
      const activity = new UserActivity({
        userId: input.userId,
        productId: input.productId,
        activityType: input.activityType,
        metadata: input.metadata || {}
      });
      
      await activity.save();
      
      // Check if we need to generate new recommendations based on this activity
      if (input.activityType === 'add_to_cart' || input.activityType === 'wishlist') {
        // This could be a background job, but for simplicity we'll do it here
        generateRecommendations(input.userId, 1); // Generate 1 new recommendation
      }
      
      return activity;
    },
    
    generateRecommendations: async (_, { userId }) => {
      // Call our recommendation engine
      const recommendations = await generateRecommendations(userId, 5);
      
      // Publish event for each new recommendation
      for (const recommendation of recommendations) {
        await publishRecommendationGenerated({
          id: recommendation._id.toString(),
          userId: recommendation.userId,
          productId: recommendation.productId,
          score: recommendation.score,
          reason: recommendation.reason
        });
      }
      
      return recommendations;
    },
    
    sendRecommendationNotification: async (_, { recommendationId }) => {
      const success = await sendRecommendationNotification(recommendationId);
      return success;
    }
  },
  
  Recommendation: {
    id: (recommendation) => recommendation._id || recommendation.id,
    
    product: async (recommendation) => {
      return await Product.findOne({ productId: recommendation.productId });
    },
    
    __resolveReference: async (recommendation) => {
      return await Recommendation.findById(recommendation.id);
    }
  },
  
  UserActivity: {
    id: (activity) => activity._id || activity.id
  }
};
