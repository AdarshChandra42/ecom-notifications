// Custom error class 
export class UserExistsError extends Error {
    constructor(message) {
      super(message);
      this.name = 'UserExistsError';
      this.code = 'USER_ALREADY_EXISTS';
      this.statusCode = 409; // Conflict
    }
  }

export class AuthenticationError extends Error {
    constructor(message = 'Not authenticated') {
      super(message);
      this.name = 'AuthenticationError';
      this.code = 'UNAUTHORIZED';
      this.statusCode = 401;
    }
  }
  
