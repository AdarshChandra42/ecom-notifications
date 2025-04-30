// GraphQL schema using Apollo Subgraph
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type Notification @key(fields: "id") {
    id: ID!
    userId: ID!
    type: NotificationType!
    content: String!
    parsedContent: NotificationContent
    sentAt: String!
    read: Boolean!
  }

  enum NotificationType {
    promotion
    order_update
    recommendation
  }

  input NotificationInput {
    userId: ID!
    type: NotificationType!
    content: String!
  }

  # Union type for different notification content structures
union NotificationContent = RecommendationContent | OrderUpdateContent | PromotionContent

type RecommendationContent {
  productId: String!
  productName: String
  reason: String
  message: String
  imageUrl: String
  price: Float
}

type OrderUpdateContent {
  orderId: String!
  status: String!
  message: String
}

type PromotionContent {
  title: String!
  description: String
  discountPercent: Float
  expiryDate: String
}

  type Query {
    getNotifications(userId: ID!): [Notification!]!
    getUnreadNotifications(userId: ID!): [Notification!]!
    getNotification(id: ID!): Notification
  }

  type Mutation {
    createNotification(input: NotificationInput!): Notification!
    markAsRead(id: ID!): Notification!
    markAllAsRead(userId: ID!): Int!
  }
`;
