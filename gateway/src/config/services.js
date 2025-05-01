// Configuration for federated services
export const serviceList = [
    { 
      name: 'users', 
      //url: process.env.USER_SERVICE_URL || 'http://user-service:4001/graphql' 
      url: process.env.USER_SERVICE_URL || 'http://localhost:4001/graphql' 
    },
    { 
      name: 'notifications', 
      //url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4002/graphql' 
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4002/graphql' 
    },
    { 
      name: 'recommendations', 
      //url: process.env.RECOMMENDATION_SERVICE_URL || 'http://recommendation-service:4003/graphql' 
      url: process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:4003/graphql' 
    }
  ];
  