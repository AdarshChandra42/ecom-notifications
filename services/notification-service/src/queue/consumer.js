// RabbitMQ event consumers
import { createChannel } from '../config/rabbitmq.js';
import { Notification } from '../models/notification.js';

const EXCHANGE_NAME = 'notification_events';     
const QUEUE_NAME = 'notification_service_queue';

export const setupConsumers = async () => {
  try {
    const channel = await createChannel();
    
    // Set up exchange
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    
    // Create queue
    const { queue } = await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    // Bind to relevant events
    await channel.bindQueue(queue, EXCHANGE_NAME, 'user.created');
    await channel.bindQueue(queue, EXCHANGE_NAME, 'user.preferences.updated');
    await channel.bindQueue(queue, EXCHANGE_NAME, 'recommendation.generated');
    await channel.bindQueue(queue, EXCHANGE_NAME, 'user.purchase');
    //should I add promotions and order-updates here? 
    
    // Set up consumer
    channel.consume(queue, async (msg) => {
      if (!msg) return;
      
      try {
        const content = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;
        
        console.log(`Received event: ${routingKey}`);
        
        // Handle different event types
        switch (routingKey) {
          case 'user.created':
            await handleUserCreated(content);
            break;
          case 'user.preferences.updated':
            await handlePreferencesUpdated(content);
            break;
          case 'recommendation.generated':
            await handleRecommendationGenerated(content);
            break;
        }
        
        // Acknowledge the message
        channel.ack(msg);
      } catch (error) {
        console.error('Error processing message:', error);
        // Negative acknowledgment to requeue
        channel.nack(msg, false, true);
      }
    });
    
    console.log('RabbitMQ consumers set up successfully');
  } catch (error) {
    console.error('Error setting up consumers:', error);
  }
};

// Event handlers
async function handleUserCreated(data) {
  // Create welcome notification
  const notification = new Notification({
    userId: data.id,
    type: 'promotion',
    content: `Welcome to our platform, ${data.name}! Explore our products and enjoy shopping.`
  });
  
  await notification.save();
}

async function handlePreferencesUpdated(data) {
  // Optionally create a notification about preferences update
  const notification = new Notification({
    userId: data.id,
    type: 'order_update',
    content: 'Your notification preferences have been updated.'
  });
  
  await notification.save();
}

async function handlePurchase(data) {
  // Create purchase notification
  try {
    const { orderId, products, totalAmount } = data;
    const productCount = products.length;
    
    let notificationContent;
    if (productCount === 1) {
      notificationContent = `Your order #${orderId} for ${products[0].quantity} item(s) has been confirmed! Total: $${totalAmount}`;
    } else {
      notificationContent = `Your order #${orderId} for ${productCount} different products has been confirmed! Total: $${totalAmount}`;
    }
    
    const notification = new Notification({
      userId: data.userId,
      type: 'order_update',
      content: notificationContent
    });
  
    await notification.save();
    console.log(`Created purchase notification for user ${data.userId}, order ${orderId}`);
  } catch (error) {
    console.error('Error processing purchase event:', error);
  }
}


async function handleRecommendationGenerated(data) {
  try {
    // Get product details from data or fetch if needed
    const content = JSON.stringify({
      productId: data.productId,
      score: data.score,
      reason: data.reason,
      // The actual product details will be filled in by the recommendation service
      // or we could fetch them here if needed
    });
    
    // Create notification
    const notification = new Notification({
      userId: data.userId,
      type: 'recommendation',
      content: content,
      read: false
    });
    
    await notification.save();
    console.log(`Created recommendation notification for user ${data.userId}`);
  } catch (error) {
    console.error('Error processing recommendation event:', error);
  }
}
