// GraphQL resolvers

import { User } from '../models/user.js';
import { publishUserCreated, publishPreferencesUpdated } from '../queue/producer.js';
import { generateToken } from '../middleware/auth.js';
import { UserExistsError, AuthenticationError } from '../errors/userErrors.js';

export const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return await User.findById(user.id);
    }, //returns the user object, auth required
    getUser: async (_, { id }) => {
      return await User.findById(id);
    } //get user by id, no auth required
  },
  
  Mutation: {
    registerUser: async (_, { input }) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: input.email });
        if (existingUser) {
          throw new UserExistsError('User with this email already exists');
        }

        // Create new user
        const user = new User({
          name: input.name,
          email: input.email,
          password: input.password,
          preferences: input.preferences || {
            promotions: true,
            order_updates: true,
            recommendations: true
          }
        });

        await user.save();

        // Publish user.created event
        await publishUserCreated({
          id: user._id,
          name: user.name,
          email: user.email,
          preferences: user.preferences
        });

        return { message: 'User registered successfully. Login to continue' };
      } catch (error) {
        throw error;
      }
    },
    
    loginUser: async (_, { email, password }) => {
      try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('User not found');
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
          throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = generateToken(user._id);

        return {
          token,
          user
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    
    updatePreferences: async (_, { preferences }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        // Find and update user preferences
        const updatedUser = await User.findByIdAndUpdate(
          user.id,
          { preferences },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error('User not found');
        }

        // Publish user.preferences.updated event
        await publishPreferencesUpdated({
          id: updatedUser._id,
          preferences: updatedUser.preferences
        });

        return updatedUser;
      } catch (error) {
        throw new Error(error.message);
      }
    }
  },
  
  User: {
    __resolveReference: async (user) => {
      return await User.findById(user.id);
    }
  }
};
