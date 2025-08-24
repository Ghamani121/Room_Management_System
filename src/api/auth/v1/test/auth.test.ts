import { Request, Response } from 'express';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import * as authController from '../auth.controller';
import * as authService from '../auth.service';
import * as authValidation from '../auth.validation';
import router from '../auth.routing';
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
const mockUser = {
  findOne: jest.fn(),
  save: jest.fn(),
};

jest.mock('../../../../models/user', () => mockUser);

// Mock auth service
jest.mock('../auth.service', () => ({
  loginService: jest.fn(),
  logoutService: jest.fn(),
  changePasswordService: jest.fn(),
}));

// Mock auth validation
jest.mock('../auth.validation', () => ({
  validateLogin: jest.fn((req, res, next) => next()),
  validateChangePassword: jest.fn((req, res, next) => next()),
}));

// Mock controller for routing tests
jest.mock('../auth.controller', () => ({
  login: jest.fn((req, res) => res.status(200).json({ message: 'Login successful' })),
  logout: jest.fn((req, res) => res.status(200).json({ message: 'Logged out' })),
  changePassword: jest.fn((req, res) => res.status(200).json({ message: 'Password changed' })),
}));

// Create express app for routing tests
const app = express();
app.use(express.json());
app.use('/auth', router);

describe('Auth Tests', () => {
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

  // Controller Tests
  describe('Auth Controller', () => {
    describe('login', () => {
      it('should return service response on successful login', async () => {
        mockRequest.body = {
          email: 'test@example.com',
          password: 'password123'
        };

        const mockServiceResponse = {
          status: StatusCodes.OK,
          data: { message: 'Login successful', token: 'jwt-token' }
        };

        (authService.loginService as jest.Mock).mockResolvedValue(mockServiceResponse);

        await authController.login(mockRequest as Request, mockResponse as Response);

        expect(authService.loginService).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.data);
      });

      it('should handle server errors', async () => {
        mockRequest.body = {
          email: 'test@example.com',
          password: 'password123'
        };

        (authService.loginService as jest.Mock).mockRejectedValue(new Error('Service error'));

        await authController.login(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'server error' });
      });
    });

    describe('logout', () => {
      it('should return service response', async () => {
        const mockServiceResponse = {
          status: StatusCodes.OK,
          data: { message: 'Logged out successfully' }
        };

        (authService.logoutService as jest.Mock).mockResolvedValue(mockServiceResponse);

        await authController.logout(mockRequest as Request, mockResponse as Response);

        expect(authService.logoutService).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.data);
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

        (authService.changePasswordService as jest.Mock).mockResolvedValue(mockServiceResponse);

        await authController.changePassword(mockRequest as Request, mockResponse as Response);

        expect(authService.changePasswordService).toHaveBeenCalledWith(
          '507f1f77bcf86cd799439011',
          'test@example.com',
          'oldPassword123',
          'newPassword123'
        );
        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.data);
      });

      it('should handle service errors', async () => {
        mockRequest.body = {
          userId: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          oldPassword: 'oldPassword123',
          newPassword: 'newPassword123'
        };

        (authService.changePasswordService as jest.Mock).mockRejectedValue(new Error('Service error'));

        await authController.changePassword(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: 'ServerError',
          message: 'Internal Server Error'
        });
      });
    });
  });

  // Service Tests
  describe('Auth Service', () => {
    describe('loginService', () => {
      it('should return invalid email for non-existent user', async () => {
        (mockUser.findOne as jest.Mock).mockResolvedValue(null);

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

        (mockUser.findOne as jest.Mock).mockResolvedValue(user);
        (isTempPasswordFormat as jest.Mock).mockReturnValue(true);

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

        (mockUser.findOne as jest.Mock).mockResolvedValue(user);
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
          role: 'employee',
          password: 'hashedPassword'
        };

        (mockUser.findOne as jest.Mock).mockResolvedValue(user);
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

      it('should handle database errors', async () => {
        (mockUser.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

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
        (mockUser.findOne as jest.Mock).mockResolvedValue(null);

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

        (mockUser.findOne as jest.Mock).mockResolvedValue(user);
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

        (mockUser.findOne as jest.Mock).mockResolvedValue(user);
        (bcrypt.compare as jest.Mock)
          .mockResolvedValueOnce(true)  // Old password validation
          .mockResolvedValueOnce(true); // Password reuse check

        const result = await authService.changePasswordService(
          '507f1f77bcf86cd799439011',
          'test@example.com',
          'oldPassword123',
          'oldPassword123'  // Same as old password
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

        (mockUser.findOne as jest.Mock).mockResolvedValue(user);
        (bcrypt.compare as jest.Mock)
          .mockResolvedValueOnce(true)  // Old password validation
          .mockResolvedValueOnce(false); // Password reuse check
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

        (mockUser.findOne as jest.Mock).mockResolvedValue(user);
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
        (mockUser.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

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

  // Validation Tests
  describe('Auth Validation', () => {
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
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 400 for missing password', () => {
        mockRequest.body = {
          email: 'test@example.com',
          password: ''
        };

        authValidation.validateLogin(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 400 for missing email', () => {
        mockRequest.body = {
          email: '',
          password: 'password123'
        };

        authValidation.validateLogin(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockNext).not.toHaveBeenCalled();
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

      it('should return 400 for invalid userId', () => {
        mockRequest.body = {
          userId: '',
          email: 'test@example.com',
          oldPassword: 'oldPassword123',
          newPassword: 'newPassword123'
        };

        authValidation.validateChangePassword(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 400 for invalid email', () => {
        mockRequest.body = {
          userId: '507f1f77bcf86cd799439011',
          email: 'invalid-email',
          oldPassword: 'oldPassword123',
          newPassword: 'newPassword123'
        };

        authValidation.validateChangePassword(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 400 for short passwords', () => {
        mockRequest.body = {
          userId: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          oldPassword: 'short',
          newPassword: 'short'
        };

        authValidation.validateChangePassword(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  // Routing Tests
  describe('Auth Routing', () => {
    describe('POST /auth/login', () => {
      it('should call validateLogin middleware and login controller', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });

        expect(authValidation.validateLogin).toHaveBeenCalled();
        expect(authController.login).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Login successful' });
      });
    });

    describe('POST /auth/logout', () => {
      it('should call logout controller without validation', async () => {
        const response = await request(app).post('/auth/logout');

        expect(authController.logout).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Logged out' });
      });
    });

    describe('POST /auth/changepassword', () => {
      it('should call validateChangePassword middleware and changePassword controller', async () => {
        const response = await request(app)
          .post('/auth/changepassword')
          .send({
            userId: '507f1f77bcf86cd799439011',
            email: 'test@example.com',
            oldPassword: 'oldpass',
            newPassword: 'newpass'
          });

        expect(authValidation.validateChangePassword).toHaveBeenCalled();
        expect(authController.changePassword).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Password changed' });
      });
    });

    describe('Validation error handling', () => {
      it('should return 400 when validateLogin fails', async () => {
        // Mock validation to fail
        (authValidation.validateLogin as jest.Mock).mockImplementationOnce((req, res) => {
          res.status(400).json({ message: 'Validation error' });
        });

        const response = await request(app)
          .post('/auth/login')
          .send({ email: 'invalid', password: 'pass' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Validation error' });
        expect(authController.login).not.toHaveBeenCalled();
      });

      it('should return 400 when validateChangePassword fails', async () => {
        // Mock validation to fail
        (authValidation.validateChangePassword as jest.Mock).mockImplementationOnce((req, res) => {
          res.status(400).json({ message: 'Validation error' });
        });

        const response = await request(app)
          .post('/auth/changepassword')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Validation error' });
        expect(authController.changePassword).not.toHaveBeenCalled();
      });
    });
  });
});