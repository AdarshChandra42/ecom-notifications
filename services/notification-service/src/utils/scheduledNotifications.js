// Scheduled notification utility
import { Notification } from '../models/notification.js';
import { publishNotificationCreated } from '../queue/producer.js';

export const sendPromotionalNotifications = async (promotionContent, userIds) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      type: 'promotion',
      content: promotionContent,
      read: false,
      sentAt: new Date()
    }));
    
    // Batch insert notifications
    const result = await Notification.insertMany(notifications);
    
    // Publish events for each notification
    for (const notification of result) {
      await publishNotificationCreated({
        id: notification._id.toString(),
        userId: notification.userId,
        type: notification.type
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error sending promotional notifications:', error);
    throw error;
  }
};

export const sendOrderStatusUpdate = async (userId, orderId, status) => {
  try {
    const content = JSON.stringify({
      orderId,
      status,
      message: `Your order #${orderId} has been ${status}.`
    });
    
    const notification = new Notification({
      userId,
      type: 'order_update',
      content
    });
    
    await notification.save();
    
    await publishNotificationCreated({
      id: notification._id.toString(),
      userId: notification.userId,
      type: notification.type
    });
    
    return notification;
  } catch (error) {
    console.error('Error sending order status update:', error);
    throw error;
  }
};
