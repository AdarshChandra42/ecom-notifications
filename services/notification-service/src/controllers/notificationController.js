
import express from 'express';
import { Notification } from '../models/notification.js';
import { publishNotificationCreated } from '../queue/producer.js';

const router = express.Router();

// POST endpoint to create a notification directly
router.post('/api/notifications', async (req, res) => {
  try {
    const { userId, type, content } = req.body;
    
    // Validate input
    if (!userId || !type || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Create notification
    const notification = new Notification({
      userId,
      type,
      content: typeof content === 'object' ? JSON.stringify(content) : content,
      read: false
    });
    
    await notification.save();
    
    // Publish event
    await publishNotificationCreated({
      id: notification._id.toString(),
      userId: notification.userId,
      type: notification.type
    });
    
    return res.status(201).json({
      success: true,
      notification: {
        id: notification._id,
        userId: notification.userId,
        type: notification.type,
        sentAt: notification.sentAt
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating notification'
    });
  }
});

export default router;
