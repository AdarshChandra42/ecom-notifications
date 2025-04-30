// RabbitMQ connection configuration
import amqplib from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let connection = null;

export const getConnection = async () => {
  if (connection) return connection;
  
  connection = await amqplib.connect(process.env.RABBITMQ_URI);
  return connection;
};

export const createChannel = async () => {
  const connection = await getConnection();
  return connection.createChannel();
};
