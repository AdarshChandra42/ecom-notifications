// Recommendation algorithm implementation
import { UserActivity } from '../models/userActivity.js';
import { PurchaseHistory } from '../models/purchaseHistory.js';
import { Recommendation } from '../models/recommendation.js';
import { Product } from '../models/product.js';

// Main recommendation generation function
export const generateRecommendations = async (userId, count = 5) => {
  try {
    // Get existing recommendations to avoid duplicates
    const existingRecommendations = await Recommendation.find({ userId })
      .select('productId')
      .lean();
    
    const existingProductIds = new Set(existingRecommendations.map(r => r.productId));
    
    // 1. Get recommendations based on purchase history
    const purchaseBasedRecs = await getRecommendationsFromPurchaseHistory(userId, existingProductIds);
    
    // 2. Get recommendations based on browsing activity
    const browsingBasedRecs = await getRecommendationsFromBrowsing(userId, existingProductIds);
    
    // 3. Get trending products as fallback
    const trendingRecs = await getTrendingRecommendations(existingProductIds);
    
    // Combine all recommendations, sort by score, and take the top ones
    const allRecommendations = [
      ...purchaseBasedRecs, 
      ...browsingBasedRecs,
      ...trendingRecs
    ].sort((a, b) => b.score - a.score)
     .slice(0, count);
    
    // Create actual recommendation documents
    const recommendationDocs = allRecommendations.map(rec => ({
      userId,
      productId: rec.productId,
      score: rec.score,
      reason: rec.reason,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire after 7 days
    }));
    
    // Save recommendations to database
    const savedRecommendations = await Recommendation.insertMany(recommendationDocs);
    
    return savedRecommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

// Helper functions for different recommendation sources
async function getRecommendationsFromPurchaseHistory(userId, existingProductIds) {
  // Look at user's purchase history and find similar products
  const purchases = await PurchaseHistory.find({ userId })
    .sort({ purchaseDate: -1 })
    .limit(5);
  
  if (purchases.length === 0) return [];
  
  // Get all product IDs from purchases
  const purchasedProductIds = purchases.flatMap(p => 
    p.products.map(item => item.productId)
  );
  
  // Find similar products based on purchased categories
  const purchasedProducts = await Product.find({ 
    productId: { $in: purchasedProductIds } 
  });
  
  const categories = [...new Set(purchasedProducts.map(p => p.category))];
  
  // Find products in the same categories that user hasn't purchased
  const similarProducts = await Product.find({
    category: { $in: categories },
    productId: { $nin: [...purchasedProductIds, ...existingProductIds] }
  }).limit(10);
  
  // Convert to recommendation format with score
  return similarProducts.map(product => ({
    productId: product.productId,
    score: 0.8 + (Math.random() * 0.15), // Score between 0.8 and 0.95
    reason: 'purchase_history'
  }));
}

async function getRecommendationsFromBrowsing(userId, existingProductIds) {
  // Look at user's browsing history to find interests
  const activities = await UserActivity.find({ userId })
    .sort({ timestamp: -1 })
    .limit(20);
  
  if (activities.length === 0) return [];
  
  // Create a map of product IDs to view counts
  const productViews = {};
  
  activities.forEach(activity => {
    if (!productViews[activity.productId]) {
      productViews[activity.productId] = 0;
    }
    
    // Weight different activities differently
    let weight = 1;
    if (activity.activityType === 'add_to_cart') weight = 5;
    if (activity.activityType === 'wishlist') weight = 3;
    
    productViews[activity.productId] += weight;
  });
  
  // Get viewed products to find their categories
  const viewedProductIds = Object.keys(productViews);
  const viewedProducts = await Product.find({ 
    productId: { $in: viewedProductIds } 
  });
  
  // Count category views
  const categoryInterest = {};
  viewedProducts.forEach(product => {
    if (!categoryInterest[product.category]) {
      categoryInterest[product.category] = 0;
    }
    categoryInterest[product.category] += productViews[product.productId] || 1;
  });
  
  // Convert to array and sort by interest level
  const sortedCategories = Object.entries(categoryInterest)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  if (sortedCategories.length === 0) return [];
  
  // Find products in top categories that user hasn't viewed
  const recommendations = await Product.find({
    category: { $in: sortedCategories.slice(0, 3) },
    productId: { $nin: [...viewedProductIds, ...existingProductIds] }
  }).limit(15);
  
  // Convert to recommendation format with score
  return recommendations.map(product => {
    const categoryIndex = sortedCategories.indexOf(product.category);
    const categoryScore = 1 - (categoryIndex * 0.2); // Higher score for more interesting categories
    
    return {
      productId: product.productId,
      score: 0.6 + (categoryScore * 0.3), // Score between 0.6 and 0.9
      reason: 'browsing_activity'
    };
  });
}

async function getTrendingRecommendations(existingProductIds) {
  // Fallback recommendation source - trending products
  // In a real system, this would look at global activity metrics
  
  // For mock purposes, just get some random products
  const trendingProducts = await Product.find({
    productId: { $nin: [...existingProductIds] }
  })
  .sort({ updatedAt: -1 }) // Newest products first as a proxy for trending
  .limit(10);
  
  return trendingProducts.map(product => ({
    productId: product.productId,
    score: 0.5 + (Math.random() * 0.1), // Lower score between 0.5 and 0.6
    reason: 'trending'
  }));
}
