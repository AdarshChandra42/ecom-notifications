// RabbitMQ connection configuration
import amqplib from 'amqplib';

let connection = null;

export const getConnection = async () => {
  if (connection) return connection;
  
  connection = await amqplib.connect(process.env.RABBITMQ_URI);
  
  // Handle connection close and attempt reconnection
  connection.on('close', async (err) => {
    console.log('RabbitMQ connection closed, attempting to reconnect...');
    connection = null;
    setTimeout(async () => {
      await getConnection();
    }, 5000);
  });
  
  return connection;
};

export const createChannel = async () => {
  const connection = await getConnection();
  return connection.createChannel();
};
