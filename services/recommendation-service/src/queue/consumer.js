// RabbitMQ event consumers
import { createChannel } from '../config/rabbitmq.js';
import { UserActivity } from '../models/userActivity.js';
import { PurchaseHistory } from '../models/purchaseHistory.js';
import { generateRecommendations } from '../algorithms/recommendationEngine.js';

const EXCHANGE_NAME = 'notification_events';
const QUEUE_NAME = 'recommendation_service_queue';

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
    await channel.bindQueue(queue, EXCHANGE_NAME, 'order.created');
    
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
          case 'order.created':
            await handleOrderCreated(content);
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
  // Generate initial recommendations for new users
  setTimeout(async () => {
    try {
      await generateRecommendations(data.id, 3);
    } catch (error) {
      console.error('Error generating initial recommendations:', error);
    }
  }, 5000);
}

async function handlePreferencesUpdated(data) {
  // Optionally regenerate recommendations when preferences change
  if (data.preferences?.recommendations) {
    try {
      await generateRecommendations(data.id, 5);
    } catch (error) {
      console.error('Error regenerating recommendations after preference update:', error);
    }
  }
}

async function handleOrderCreated(data) {
  try {
    // Store purchase history
    const purchase = new PurchaseHistory({
      userId: data.userId,
      orderId: data.orderId,
      products: data.products,
      totalAmount: data.totalAmount,
      purchaseDate: new Date()
    });
    
    await purchase.save();
    
    // Generate new recommendations based on purchase
    setTimeout(async () => {
      try {
        await generateRecommendations(data.userId, 3);
      } catch (error) {
        console.error('Error generating recommendations after purchase:', error);
      }
    }, 3000);
  } catch (error) {
    console.error('Error processing order creation:', error);
  }
}
