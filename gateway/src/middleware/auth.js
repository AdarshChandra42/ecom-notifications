// Authentication middleware for GraphQL Gateway
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Express middleware for authentication
export const authMiddleware = (req, res, next) => {
  // Get auth header
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (token) {
      try {
        // Verify token
        const user = verifyToken(token);
        if (user) {
          // Add user to request
          req.user = user;
        }
      } catch (err) {
        console.error('Token verification error:', err.message);
      }
    }
  }
  
  next();
};

// GraphQL context builder
export const buildContext = ({ req }) => {
  return { 
    user: req.user || null,
    token: req.headers.authorization?.split(' ')[1] || '' 
  };
};
