// GraphQL schema using Apollo Subgraph
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  type User @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
    preferences: Preferences!
    createdAt: String!
    updatedAt: String!
  }

  type Preferences {
    promotions: Boolean!
    order_updates: Boolean!
    recommendations: Boolean!
  }

  input RegisterUserInput {
    name: String!
    email: String!
    password: String!
    preferences: PreferencesInput
  }

  input PreferencesInput {
    promotions: Boolean
    order_updates: Boolean
    recommendations: Boolean
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    getUser(id: ID!): User
  }

  type Mutation {
    registerUser(input: RegisterUserInput!): RegistrationResponse
    loginUser(email: String!, password: String!): AuthPayload
    updatePreferences(preferences: PreferencesInput!): User
  }
  type RegistrationResponse{
    message: String!
  }
`;
