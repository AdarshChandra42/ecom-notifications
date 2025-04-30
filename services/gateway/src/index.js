// Main entry point for Apollo Gateway
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { serviceList } from './config/services.js';
import { authMiddleware, buildContext } from './middleware/auth.js';
import { responseCachePlugin } from './cache/index.js';
import { formatError } from './utils/errorHandler.js';

dotenv.config();

// Custom DataSource to forward the authorization header
class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    // Forward the auth token to the services
    if (context.token) {
      request.http.headers.set('Authorization', `Bearer ${context.token}`);
    }
  }
}

// Create Apollo Gateway
const gateway = new ApolloGateway({
  serviceList,
  buildService({ name, url }) {
    return new AuthenticatedDataSource({
      url,
    });
  },
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(authMiddleware);

async function startServer() {
  // Create Apollo Server
  const server = new ApolloServer({
    gateway,
    plugins: [responseCachePlugin],
    context: buildContext,
    formatError,
    // Disable introspection and playground in production
    introspection: process.env.NODE_ENV !== 'production',
    playground: process.env.NODE_ENV !== 'production'
  });

  await server.start();
  
  // Apply middleware to Express
  server.applyMiddleware({ app, path: '/graphql' });
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`🚀 Gateway ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start gateway:', err);
});
