// Authentication middleware
import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const authContext = ({ req }) => {
  const token = req.headers.authorization?.split(' ')[1] || '';
  
  if (!token) {
    return { user: null };
  }
  
  const decoded = verifyToken(token);
  return { user: decoded };
};
