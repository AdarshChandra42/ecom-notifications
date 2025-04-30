// // RabbitMQ event consumers
// import { createChannel } from '../config/rabbitmq.js';
// import { User } from '../models/user.js';

// const EXCHANGE_NAME = 'notification_events';
// const QUEUE_NAME = 'user_service_queue';

// export const setupConsumers = async () => {
//   try {
//     const channel = await createChannel();
    
//     // Set up exchange
//     await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    
//     // Create queue
//     const { queue } = await channel.assertQueue(QUEUE_NAME, { durable: true });
    
//     // Bind to relevant events
//     await channel.bindQueue(queue, EXCHANGE_NAME, 'notification.sent');
    
//     // Set up consumer
//     channel.consume(queue, async (msg) => {
//       if (!msg) return;
      
//       try {
//         const content = JSON.parse(msg.content.toString());
//         const routingKey = msg.fields.routingKey;
        
//         console.log(`Received event: ${routingKey}`);
        
//         // Handle different event types
//         switch (routingKey) {
//           case 'notification.sent':
//             // Handle notification sent event
//             break;
//           // Add more event handlers as needed
//         }
        
//         // Acknowledge the message
//         channel.ack(msg);
//       } catch (error) {
//         console.error('Error processing message:', error);
//         // Negative acknowledgment to requeue
//         channel.nack(msg, false, true);
//       }
//     });
    
//     console.log('RabbitMQ consumers set up successfully');
//   } catch (error) {
//     console.error('Error setting up consumers:', error);
//   }
// };
