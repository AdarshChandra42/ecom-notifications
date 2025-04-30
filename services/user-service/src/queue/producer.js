import { getChannel } from '../config/rabbitmq.js';

export const publishUserCreated = async (user) => {
  try {
    const channel = getChannel();
    const exchange = 'user-events';
    const routingKey = 'user.created';
    
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      createdAt: user.createdAt
    };
    
    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(userData)),
      { persistent: true }
    );
    
    console.log(`Published user.created event for user ${user._id}`);
  } catch (error) {
    console.error('Error publishing user event:', error);
  }
};

export const publishPreferencesUpdated = async (user) => {
  try {
    const channel = getChannel();
    const exchange = 'user-events';
    const routingKey = 'user.preferences.updated';
    
    const preferencesData = {
      userId: user._id,
      preferences: user.preferences,
      updatedAt: new Date()
    };
    
    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(preferencesData)),
      { persistent: true }
    );
    
    console.log(`Published preferences.updated event for user ${user._id}`);
  } catch (error) {
    console.error('Error publishing preferences event:', error);
  }
};
