import { Request, Response, NextFunction } from 'express';
import * as nodemailer from 'nodemailer';
import Joi from 'joi';
import { Types } from 'mongoose';
import Booking from '../../models/booking';
import {checkSelfandAdminAccess,} from '../selfandadminAccess'; 
import { validateObjectId, isValidObjectId} from '../validateobjectid';
import {sendWelcomeEmail, sendPasswordResetEmail} from '../sendmail';
import {  generateTempPassword,isTempPasswordFormat,} from '../temppassword'

// Mock dependencies
jest.mock('nodemailer');
jest.mock('../../models/booking');

describe('Utils - checkSelfandAdminAccess', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should allow admin access for user resource', async () => {
    mockRequest.params = { id: 'user123' };
    (mockRequest as any).user = {
      id: 'admin123',
      role: 'admin'
    };

    const middleware = checkSelfandAdminAccess('user');
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should allow self access for user resource', async () => {
    mockRequest.params = { id: 'user123' };
    (mockRequest as any).user = {
      id: 'user123',
      role: 'employee'
    };

    const middleware = checkSelfandAdminAccess('user');
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should deny access for non-admin and non-self user resource', async () => {
    mockRequest.params = { id: 'user123' };
    (mockRequest as any).user = {
      id: 'otheruser',
      role: 'employee'
    };

    const middleware = checkSelfandAdminAccess('user');
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Access denied' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if no user found', async () => {
    mockRequest.params = { id: 'user123' };
    // No user set

    const middleware = checkSelfandAdminAccess('user');
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized: no user found' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should allow admin access for booking resource', async () => {
    const mockBooking = {
      _id: 'booking123',
      userId: 'user123',
      toString: () => 'booking123'
    };
    
    mockRequest.params = { id: 'booking123' };
    (mockRequest as any).user = {
      id: 'admin123',
      role: 'admin'
    };

    (Booking.findById as jest.Mock).mockResolvedValue(mockBooking);

    const middleware = checkSelfandAdminAccess('booking');
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(Booking.findById).toHaveBeenCalledWith('booking123');
    expect(mockNext).toHaveBeenCalled();
    expect((mockRequest as any).booking).toEqual(mockBooking);
  });

  it('should allow self access for booking resource', async () => {
    const mockBooking = {
      _id: 'booking123',
      userId: 'user123',
      toString: () => 'booking123'
    };
    
    mockRequest.params = { id: 'booking123' };
    (mockRequest as any).user = {
      id: 'user123',
      role: 'employee'
    };

    (Booking.findById as jest.Mock).mockResolvedValue(mockBooking);

    const middleware = checkSelfandAdminAccess('booking');
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(Booking.findById).toHaveBeenCalledWith('booking123');
    expect(mockNext).toHaveBeenCalled();
    expect((mockRequest as any).booking).toEqual(mockBooking);
  });

  it('should return 404 if booking not found', async () => {
    mockRequest.params = { id: 'nonexistent' };
    (mockRequest as any).user = {
      id: 'user123',
      role: 'employee'
    };

    (Booking.findById as jest.Mock).mockResolvedValue(null);

    const middleware = checkSelfandAdminAccess('booking');
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Booking not found' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

describe('Utils - Email Functions', () => {
  const mockSendMail = jest.fn();
  
  beforeEach(() => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail
    });
    jest.clearAllMocks();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      process.env.MAIL_USER = 'test@example.com';
      process.env.MAIL_PASS = 'password123';
      
      mockSendMail.mockResolvedValue(undefined);

      await sendWelcomeEmail('user@example.com', 'tempPassword123');

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: "gmail",
        auth: {
          user: 'test@example.com',
          pass: 'password123'
        }
      });

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'user@example.com',
        subject: 'Your Account has been created',
        html: expect.stringContaining('tempPassword123')
      }));
    });

    it('should handle email sending errors', async () => {
      const emailError = new Error('SMTP error');
      mockSendMail.mockRejectedValue(emailError);

      await expect(sendWelcomeEmail('user@example.com', 'tempPassword123'))
        .rejects.toThrow('SMTP error');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      process.env.MAIL_USER = 'test@example.com';
      process.env.MAIL_PASS = 'password123';
      process.env.FRONTEND_URL = 'http://localhost:3000';
      
      mockSendMail.mockResolvedValue(undefined);

      await sendPasswordResetEmail('user@example.com');

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'user@example.com',
        subject: 'Password Reset Required',
        html: expect.stringContaining('http://localhost:3000/reset-password')
      }));
    });

    it('should handle email sending errors for password reset', async () => {
      const emailError = new Error('SMTP error');
      mockSendMail.mockRejectedValue(emailError);

      await expect(sendPasswordResetEmail('user@example.com'))
        .rejects.toThrow('SMTP error');
    });
  });
});

describe('Utils - Password Functions', () => {
  describe('generateTempPassword', () => {
    it('should generate temp password in correct format', () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.5); // Consistent random values

      const password = generateTempPassword();

      expect(password).toMatch(/^TEMP-[A-Z]{6}-\d{4}$/);
      expect(password).toBe('TEMP-NNNNNN-5000'); // Based on mock random

      jest.spyOn(global.Math, 'random').mockRestore();
    });

    it('should generate different passwords on multiple calls', () => {
      const password1 = generateTempPassword();
      const password2 = generateTempPassword();

      expect(password1).not.toBe(password2);
      expect(password1).toMatch(/^TEMP-[A-Z]{6}-\d{4}$/);
      expect(password2).toMatch(/^TEMP-[A-Z]{6}-\d{4}$/);
    });
  });

  describe('isTempPasswordFormat', () => {
    it('should return true for valid temp password format', () => {
      expect(isTempPasswordFormat('TEMP-ABCDEF-1234')).toBe(true);
      expect(isTempPasswordFormat('TEMP-ZYXWVU-9876')).toBe(true);
    });

    it('should return false for invalid temp password format', () => {
      expect(isTempPasswordFormat('')).toBe(false);
      expect(isTempPasswordFormat('TEMP-ABCDE-1234')).toBe(false); // 5 letters
      expect(isTempPasswordFormat('TEMP-ABCDEF-123')).toBe(false); // 3 digits
      expect(isTempPasswordFormat('temp-abcdef-1234')).toBe(false); // lowercase
      expect(isTempPasswordFormat('TEMP-ABCDEF-12345')).toBe(false); // 5 digits
      expect(isTempPasswordFormat('TEMP-123456-1234')).toBe(false); // numbers in letters part
      expect(isTempPasswordFormat('TEMP-ABCDEF-ABCD')).toBe(false); // letters in digits part
      expect(isTempPasswordFormat('PASSWORD-123')).toBe(false); // wrong prefix
    });
  });
});

describe('Utils - ObjectId Validation', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      params: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateObjectId middleware', () => {
    it('should validate valid ObjectId and call next', () => {
      mockRequest.params = { id: '507f1f77bcf86cd799439011' };

      const middleware = validateObjectId('id');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid ObjectId', () => {
      mockRequest.params = { id: 'invalid-id' };

      const middleware = validateObjectId('id');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Invalid id')
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should validate ObjectId from Types.ObjectId directly', () => {
      const objectId = new Types.ObjectId();
      
      const middleware = validateObjectId(objectId);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('isValidObjectId function', () => {
    it('should return true for valid ObjectId string', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('should return true for valid Types.ObjectId', () => {
      const objectId = new Types.ObjectId();
      expect(isValidObjectId(objectId)).toBe(true);
    });

    it('should return false for invalid ObjectId string', () => {
      expect(isValidObjectId('invalid')).toBe(false);
      expect(isValidObjectId('507f1f77bcf86cd7994390')).toBe(false); // too short
      expect(isValidObjectId('507f1f77bcf86cd7994390111')).toBe(false); // too long
      expect(isValidObjectId('507f1f77bcf86cd79943901g')).toBe(false); // non-hex character
    });

    it('should return false for null or undefined', () => {
      expect(isValidObjectId(null as any)).toBe(false);
      expect(isValidObjectId(undefined as any)).toBe(false);
      expect(isValidObjectId('')).toBe(false);
    });
  });
});