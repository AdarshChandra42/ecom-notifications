// Error handling utilities
export class AuthenticationError extends Error {
    constructor(message = 'Not authenticated') {
      super(message);
      this.name = 'AuthenticationError';
      this.code = 'UNAUTHENTICATED';
      this.statusCode = 401;
    }
  }
  
  export class AuthorizationError extends Error {
    constructor(message = 'Not authorized') {
      super(message);
      this.name = 'AuthorizationError';
      this.code = 'FORBIDDEN';
      this.statusCode = 403;
    }
  }
  
  export class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
      super(message);
      this.name = 'NotFoundError';
      this.code = 'NOT_FOUND';
      this.statusCode = 404;
    }
  }
  
  // Custom formatter for GraphQL errors
  export const formatError = (formattedError, error) => {
    // Add a specific code based on the error
    if (error.originalError) {
      formattedError.extensions.code = error.originalError.code || 'INTERNAL_SERVER_ERROR';
      formattedError.extensions.statusCode = error.originalError.statusCode || 500;
    }
    
    // Remove the exception stack trace in production
    if (process.env.NODE_ENV === 'production') {
      delete formattedError.extensions.exception;
    }
    
    return formattedError;
  };
  