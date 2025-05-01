// Simple in-memory cache implementation
import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

// Create cache with TTL in seconds
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL || '300', 10), // Default 5 minutes
  checkperiod: 120 // Check for expired keys every 2 minutes
});

// Cache middleware for Apollo Server
export const responseCachePlugin = {
  // This is a simplified cache plugin implementation
  // For production, consider using Apollo's built-in caching or Redis
  async serverWillStart() {
    console.log('Cache initialized with TTL of', cache.options.stdTTL, 'seconds');
  },
  
  async requestDidStart() {
    return {
      async willSendResponse(requestContext) {
        // Only cache if it's a query (not mutation)
        if (
          requestContext.operation?.operation === 'query' && 
          // Safely check if context exists before accessing user
          (!requestContext.context || !requestContext.context.user)
        ) {
          const cacheKey = generateCacheKey(requestContext);
          const data = requestContext.response.data;
          
          if (data) {
            cache.set(cacheKey, data);
            console.log('Cache set for key:', cacheKey);
          }
        }
      },
      
      async parsingDidStart(requestContext) {
        // Only try to use cache for queries
        if (requestContext.request.operationName?.startsWith('query')) {
          const cacheKey = generateCacheKey(requestContext);
          const cachedData = cache.get(cacheKey);
          
          if (cachedData) {
            console.log('Cache hit for key:', cacheKey);
            // We could short-circuit here and return the cached response
            // but for this simple example, we'll just log the hit
          }
        }
      }
    };
  }
};

// Generate a cache key from the request
function generateCacheKey(requestContext) {
  const { query, variables, operationName } = requestContext.request;
  return `${operationName}:${JSON.stringify(variables)}`;
}

// Export cache utility functions
export const cacheUtils = {
  set: (key, value, ttl) => cache.set(key, value, ttl),
  get: (key) => cache.get(key),
  del: (key) => cache.del(key),
  flush: () => cache.flushAll(),
  stats: () => cache.getStats()
};
