// src/api/auth/v1/test/auth.test.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import * as authController from '../auth.controller';
import * as authService from '../auth.service';
import * as authValidation from '../auth.validation';
import { sendPasswordResetEmail } from '../../../../utils/sendmail';
import { isTempPasswordFormat } from '../../../../utils/temppassword';

// Mock dependencies
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('../../../../utils/sendmail', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock('../../../../utils/temppassword', () => ({
  isTempPasswordFormat: jest.fn(),
}));

// Mock User model
jest.mock('../../../../models/user', () => ({
  findOne: jest.fn(),
  save: jest.fn(),
}));

// Import User after mocking
import User from '../../../../models/user';

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    
    mockRequest = {
      body: {},
      headers: {}
    };
    
    mockResponse = {
      status: statusMock,
      json: jsonMock,
      send: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return service response on successful login', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockServiceResponse = {
        status: StatusCodes.OK,
        data: {
          message: 'Login successful',
          token: 'jwt-token',
          user: {
            id: '507f1f77bcf86cd799439011',
            name: 'Test User',
            email: 'test@example.com',
            role: 'employee' as const // Fix: use 'as const' to ensure exact type
          }
        }
      };

      jest.spyOn(authService, 'loginService').mockResolvedValue(mockServiceResponse);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(authService.loginService).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockServiceResponse.data);
    });

    it('should handle server errors', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      jest.spyOn(authService, 'loginService').mockRejectedValue(new Error('Service error'));

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'server error' });
    });
  });

  describe('logout', () => {
    it('should return service response', async () => {
      const mockServiceResponse = {
        status: StatusCodes.OK,
        data: { message: 'Logged out successfully' }
      };

      jest.spyOn(authService, 'logoutService').mockResolvedValue(mockServiceResponse);

      await authController.logout(mockRequest as Request, mockResponse as Response);

      expect(authService.logoutService).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockServiceResponse.data);
    });
  });

  describe('changePassword', () => {
    it('should return service response on successful password change', async () => {
      mockRequest.body = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123'
      };

      const mockServiceResponse = {
        status: StatusCodes.OK,
        data: { error: null, message: 'Password changed successfully' }
      };

      jest.spyOn(authService, 'changePasswordService').mockResolvedValue(mockServiceResponse);

      await authController.changePassword(mockRequest as Request, mockResponse as Response);

      expect(authService.changePasswordService).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'test@example.com',
        'oldPassword123',
        'newPassword123'
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockServiceResponse.data);
    });

    it('should handle service errors', async () => {
      mockRequest.body = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123'
      };

      jest.spyOn(authService, 'changePasswordService').mockRejectedValue(new Error('Service error'));

      await authController.changePassword(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'ServerError',
        message: 'Internal Server Error'
      });
    });
  });
});

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('loginService', () => {
    it('should return invalid email for non-existent user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await authService.loginService('nonexistent@example.com', 'password123');

      expect(result.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(result.data.message).toBe('Invalid email');
    });

    it('should detect temp password and send reset email', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      (User.findOne as jest.Mock).mockResolvedValue(user);
      (isTempPasswordFormat as jest.Mock).mockReturnValue(true);
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.loginService('test@example.com', 'TEMP-ABCDEF-1234');

      expect(sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
      expect(result.status).toBe(StatusCodes.OK);
      expect(result.data.message).toContain('Temporary password detected');
    });

    it('should return invalid password for wrong password', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      (User.findOne as jest.Mock).mockResolvedValue(user);
      (isTempPasswordFormat as jest.Mock).mockReturnValue(false);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.loginService('test@example.com', 'wrongpassword');

      expect(result.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(result.data.message).toBe('invalid password');
    });

    it('should return success with token for valid credentials', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        role: 'employee' as const, // Fix: use 'as const' for exact type
        password: 'hashedPassword'
      };

      (User.findOne as jest.Mock).mockResolvedValue(user);
      (isTempPasswordFormat as jest.Mock).mockReturnValue(false);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('jwt-token');

      const result = await authService.loginService('test@example.com', 'correctpassword');

      expect(result.status).toBe(StatusCodes.OK);
      expect(result.data.message).toBe('Login Successful');
      expect(result.data.token).toBe('jwt-token');
      expect(result.data.user).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        role: 'employee'
      });
    });

    it('should return success with token for admin user', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin' as const, // Fix: use 'as const' for exact type
        password: 'hashedPassword'
      };

      (User.findOne as jest.Mock).mockResolvedValue(user);
      (isTempPasswordFormat as jest.Mock).mockReturnValue(false);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('jwt-token');

      const result = await authService.loginService('admin@example.com', 'correctpassword');

      expect(result.status).toBe(StatusCodes.OK);
      expect(result.data.message).toBe('Login Successful');
      expect(result.data.token).toBe('jwt-token');
      expect(result.data.user).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      });
    });

    it('should handle database errors', async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await authService.loginService('test@example.com', 'password123');

      expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.data.message).toBe('Internal server error');
    });
  });

  describe('logoutService', () => {
    it('should return success message', async () => {
      const result = await authService.logoutService();

      expect(result.status).toBe(StatusCodes.OK);
      expect(result.data.message).toBe('logged out successfully');
    });
  });

  describe('changePasswordService', () => {
    it('should return user not found for non-existent user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await authService.changePasswordService(
        '507f1f77bcf86cd799439011',
        'test@example.com',
        'oldPassword123',
        'newPassword123'
      );

      expect(result.status).toBe(StatusCodes.BAD_REQUEST);
      expect(result.data.message).toBe('User not found in the db');
    });

    it('should return invalid old password for wrong password', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedOldPassword',
        save: jest.fn()
      };

      (User.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.changePasswordService(
        '507f1f77bcf86cd799439011',
        'test@example.com',
        'wrongOldPassword',
        'newPassword123'
      );

      expect(result.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(result.data.message).toBe('Invalid old password');
    });

    it('should return error for password reuse', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedOldPassword',
        save: jest.fn()
      };

      (User.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      const result = await authService.changePasswordService(
        '507f1f77bcf86cd799439011',
        'test@example.com',
        'oldPassword123',
        'oldPassword123'
      );

      expect(result.status).toBe(StatusCodes.BAD_REQUEST);
      expect(result.data.message).toBe('New password cannot be same as old password');
    });

    it('should change password successfully', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedOldPassword',
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');

      const result = await authService.changePasswordService(
        '507f1f77bcf86cd799439011',
        'test@example.com',
        'oldPassword123',
        'newPassword123'
      );

      expect(result.status).toBe(StatusCodes.OK);
      expect(result.data.message).toBe('Password changed successfully');
      expect(user.save).toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedOldPassword',
        save: jest.fn().mockRejectedValue(new Error('Save error'))
      };

      (User.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');

      const result = await authService.changePasswordService(
        '507f1f77bcf86cd799439011',
        'test@example.com',
        'oldPassword123',
        'newPassword123'
      );

      expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.data.message).toBe('Internal server error');
    });

    it('should handle database errors', async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await authService.changePasswordService(
        '507f1f77bcf86cd799439011',
        'test@example.com',
        'oldPassword123',
        'newPassword123'
      );

      expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.data.message).toBe('Internal server error');
    });
  });
});

describe('Auth Validation', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateLogin', () => {
    it('should call next for valid login data', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      authValidation.validateLogin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email', () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'password123'
      };

      authValidation.validateLogin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 for missing password', () => {
      mockRequest.body = {
        email: 'test@example.com'
        // password missing
      };

      authValidation.validateLogin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });
  });

  describe('validateChangePassword', () => {
    it('should call next for valid change password data', () => {
      mockRequest.body = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123'
      };

      authValidation.validateChangePassword(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 with validation errors for invalid data', () => {
      mockRequest.body = {
        userId: '',
        email: 'invalid-email',
        oldPassword: 'short',
        newPassword: 'short'
      };

      authValidation.validateChangePassword(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});

// Test Auth Routing
describe('Auth Routing', () => {
  it('should have correct route definitions', () => {
    const router = require('../auth.routing');
    
    expect(router).toBeDefined();
    expect(typeof router).toBe('function');
  });
});

// Test JWT Secret validation
describe('JWT Secret Validation', () => {
  it('should throw error if JWT_SECRET is not defined', async () => {
    const originalJWTSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    
    // Re-import to trigger the error
    jest.resetModules();
    
    await expect(async () => {
      await require('../auth.service').loginService('test@example.com', 'password');
    }).rejects.toThrow();
    
    // Restore
    process.env.JWT_SECRET = originalJWTSecret;
  });
});

// Test edge cases
describe('Edge Cases', () => {
  it('should handle empty email in loginService', async () => {
    const result = await authService.loginService('', 'password');
    expect(result.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should handle empty password in loginService', async () => {
    const user = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      password: 'hashedPassword'
    };
    (User.findOne as jest.Mock).mockResolvedValue(user);
    
    const result = await authService.loginService('test@example.com', '');
    expect(result.status).toBe(StatusCodes.UNAUTHORIZED);
  });
});