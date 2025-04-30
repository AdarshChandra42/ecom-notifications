// GraphQL resolvers
import { Notification } from '../models/notification.js';
import { publishNotificationCreated, publishNotificationRead } from '../queue/producer.js';

export const resolvers = {
  Query: {
    getNotifications: async (_, { userId }) => {
      return await Notification.find({ userId }).sort({ sentAt: -1 });
    },
    
    getUnreadNotifications: async (_, { userId }) => {
      return await Notification.find({ userId, read: false }).sort({ sentAt: -1 });
    },
    
    getNotification: async (_, { id }) => {
      return await Notification.findById(id);
    }
  },
  
  Mutation: {
    createNotification: async (_, { input }) => {
      const notification = new Notification({
        userId: input.userId,
        type: input.type,
        content: input.content
      });
      
      await notification.save();
      
      // Publish event to message queue
      await publishNotificationCreated({
        id: notification._id.toString(),
        userId: notification.userId,
        type: notification.type
      });
      
      return notification;
    },
    
    markAsRead: async (_, { id }) => {
      const notification = await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      );
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      // Publish event to message queue
      await publishNotificationRead({
        id: notification._id.toString(),
        userId: notification.userId
      });
      
      return notification;
    },
    
    markAllAsRead: async (_, { userId }) => {
      const result = await Notification.updateMany(
        { userId, read: false },
        { read: true }
      );
      
      // Publish bulk event
      await publishNotificationRead({
        userId,
        bulkOperation: true,
        count: result.modifiedCount
      });
      
      return result.modifiedCount;
    }
  },
  

  Notification: {
    id: (notification) => notification._id || notification.id,
    
    // Add a parsed content field that returns structured data
    parsedContent: (notification) => {
      try {
        if (typeof notification.content === 'string') {
          return JSON.parse(notification.content);
        }
        return notification.content;
      } catch (error) {
        console.error('Error parsing notification content:', error);
        return null;
      }
    },
    
    __resolveReference: async (notification) => {
      return await Notification.findById(notification.id);
    }
  }

};
