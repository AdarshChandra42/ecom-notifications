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

export const publishRecommendationGenerated = async (recommendationData) => {
  await publishEvent('recommendation.generated', recommendationData);
};

export const publishUserActivityTracked = async (activityData) => {
  await publishEvent('user.activity.tracked', activityData);
};
