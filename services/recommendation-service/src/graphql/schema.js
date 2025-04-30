// GraphQL schema using Apollo Subgraph
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type Recommendation @key(fields: "id") {
    id: ID!
    userId: ID!
    productId: ID!
    product: Product
    score: Float!
    reason: RecommendationReason!
    createdAt: String!
  }

  type Product {
    id: ID!
    name: String!
    category: String!
    price: Float!
    description: String
    imageUrl: String
  }

  enum RecommendationReason {
    purchase_history
    browsing_activity
    similar_users
    trending
  }

  type UserActivity {
    id: ID!
    userId: ID!
    productId: ID!
    activityType: ActivityType!
    timestamp: String!
  }

  enum ActivityType {
    view
    search
    add_to_cart
    wishlist
  }

  input UserActivityInput {
    userId: ID!
    productId: ID!
    activityType: ActivityType!
    metadata: JSON
  }

  # Use a scalar for JSON data
  scalar JSON

  type Query {
    getRecommendations(userId: ID!, limit: Int): [Recommendation!]!
    getRecommendation(id: ID!): Recommendation
    getUserActivities(userId: ID!, limit: Int): [UserActivity!]!
  }

  type Mutation {
    trackUserActivity(input: UserActivityInput!): UserActivity!
    generateRecommendations(userId: ID!): [Recommendation!]!
    sendRecommendationNotification(recommendationId: ID!): Boolean!
  }
`;
