import amqp from 'amqplib';

let channel = null;

export const setupRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URI);
    channel = await connection.createChannel();
    
    // Declare exchange for user events
    await channel.assertExchange('user-events', 'topic', { durable: true });
    
    console.log('Connected to RabbitMQ');
    return channel;
  } catch (error) {
    console.error(`RabbitMQ Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
};
