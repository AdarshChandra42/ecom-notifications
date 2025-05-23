// Main service entry point
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { connectDB } from './config/db.js';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { authContext } from './middleware/auth.js';
import { setupConsumers } from './queue/consumer.js';
import dotenv from 'dotenv';
import notificationController from './controllers/notificationController.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(notificationController);
const PORT = process.env.PORT || 4002;

// Connect to MongoDB
connectDB();

// Set up RabbitMQ consumers
setupConsumers();

// Create Apollo Server
const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  context: authContext
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
  
  app.listen(PORT, () => {
    console.log(`Notification service running at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer().catch(err => {
  console.error('Error starting server:', err);
});
