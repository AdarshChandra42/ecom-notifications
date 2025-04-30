// RabbitMQ event producers
import { createChannel } from '../config/rabbitmq.js';

const EXCHANGE_NAME = 'notification_events';

const publishEvent = async (routingKey, data) => {
  try {
    const channel = await createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    
    const message = Buffer.from(JSON.stringify(data));
    channel.publish(EXCHANGE_NAME, routingKey, message);
    
    console.log(`Event published: ${routingKey}`);
  } catch (error) {
    console.error('Error publishing event:', error);
  }
};

export const publishUserCreated = async (userData) => {
  await publishEvent('user.created', userData);
};

export const publishPreferencesUpdated = async (userData) => {
  await publishEvent('user.preferences.updated', userData);
};
