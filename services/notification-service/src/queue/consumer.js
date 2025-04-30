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

async function handleRecommendationGenerated(data) {
  // This will be handled by the recommendation service
  // creating notifications through the GraphQL API
  console.log('Recommendation generated for user:', data.userId);
}
