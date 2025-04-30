// Main service entry point
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { connectDB } from './config/db.js';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { authContext } from './middleware/auth.js';
import { setupConsumers } from './queue/consumer.js';
import { setupCronJobs } from './schedulers/cronJobs.js';
import { generateMockProducts } from './utils/mockDataGenerator.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

// Connect to MongoDB
connectDB();

// Set up RabbitMQ consumers
setupConsumers();

// Set up scheduled jobs
setupCronJobs();

// Create Apollo Server
const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  context: authContext
});

const startServer = async () => {
  // Generate mock data if needed
  if (process.env.GENERATE_MOCK_DATA === 'true') {
    await generateMockProducts();
  }
  
  await server.start();
  server.applyMiddleware({ app });
  
  app.listen(PORT, () => {
    console.log(`Recommendation service running at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer().catch(err => {
  console.error('Error starting server:', err);
});
