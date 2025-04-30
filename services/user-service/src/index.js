// Main service entry point
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { connectDB } from './config/db.js';
import { setupRabbitMQ } from './config/rabbitmq.js';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { authContext } from './middleware/auth.js';
//import { setupConsumers } from './queue/consumer.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Connect to MongoDB
await connectDB();

await setupRabbitMQ();

// Set up RabbitMQ consumers
//setupConsumers();

// Create Apollo Server
const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  context: authContext
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
  
  app.listen(PORT, () => {
    console.log(`User service running at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer().catch(err => {
  console.error('Error starting server:', err);
});
