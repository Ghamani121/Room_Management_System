import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import Booking from '../../models/booking';
import {authenticateJWT,authorizeAdmin} from '../auth.middleware'; // Update with correct path
import {checkBookingUpdatePermission} from '../bookingPermission';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/booking');

describe('Middleware Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      params: {},
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
    
    // Set JWT secret for testing
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticateJWT', () => {
    it('should return 401 if authorization header is missing', () => {
      mockRequest.headers = {};

      authenticateJWT(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Authorization header missing or malformed'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is malformed', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      authenticateJWT(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Authorization header missing or malformed'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalidToken'
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticateJWT(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid or expired token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next and set user if token is valid', () => {
      mockRequest.headers = {
        authorization: 'Bearer validToken'
      };

      const mockPayload = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'employee'
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      authenticateJWT(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('validToken', 'test-secret');
      expect((mockRequest as any).user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle case-insensitive bearer token', () => {
      mockRequest.headers = {
        authorization: 'BEARER validToken'
      };

      const mockPayload = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'employee'
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      authenticateJWT(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('validToken', 'test-secret');
      expect((mockRequest as any).user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('authorizeAdmin', () => {
    it('should return 403 if user is not admin', () => {
      (mockRequest as any).user = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'employee'
      };

      authorizeAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Admin access only'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user is missing', () => {
      // No user set on request

      authorizeAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Admin access only'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next if user is admin', () => {
      (mockRequest as any).user = {
        id: 'admin123',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      };

      authorizeAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('checkBookingUpdatePermission', () => {
    const mockBooking = {
      _id: 'booking123',
      userId: 'user123',
      toString: () => 'booking123'
    };

    beforeEach(() => {
      (Booking.findById as jest.Mock).mockResolvedValue(mockBooking);
    });

    it('should return 400 if booking ID is missing', async () => {
      mockRequest.params = {};
      (mockRequest as any).user = {
        id: 'user123',
        role: 'employee'
      };

      await checkBookingUpdatePermission(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'MISSING_BOOKING_ID',
        message: 'Booking ID is required in the URL'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 if booking not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      (mockRequest as any).user = {
        id: 'user123',
        role: 'employee'
      };

      (Booking.findById as jest.Mock).mockResolvedValue(null);

      await checkBookingUpdatePermission(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'BOOKING_NOT_FOUND',
        message: 'Booking does not exist'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow admin to update only status field', async () => {
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = {
        status: 'cancelled',
        title: 'Trying to change title', // Should be filtered out
        userId: 'trying-to-change-user' // Should be forbidden
      };
      (mockRequest as any).user = {
        id: 'admin456', // Different user ID (not owner)
        role: 'admin'
      };

      await checkBookingUpdatePermission(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({ status: 'cancelled' });
      expect((mockRequest as any).booking).toEqual(mockBooking);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow owner to update allowed fields', async () => {
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = {
        title: 'New Title',
        attendees: [{ name: 'New Attendee', email: 'new@example.com' }],
        startTime: new Date('2024-01-16T10:00:00Z'),
        endTime: new Date('2024-01-16T11:00:00Z'),
        roomId: 'room456',
        status: 'trying-to-change-status' // Should be filtered out for non-admin owner
      };
      (mockRequest as any).user = {
        id: 'user123', // Same as booking userId (owner)
        role: 'employee'
      };

      await checkBookingUpdatePermission(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        title: 'New Title',
        attendees: [{ name: 'New Attendee', email: 'new@example.com' }],
        startTime: new Date('2024-01-16T10:00:00Z'),
        endTime: new Date('2024-01-16T11:00:00Z'),
        roomId: 'room456'
      });
      expect((mockRequest as any).booking).toEqual(mockBooking);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow admin owner to update all allowed fields', async () => {
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = {
        title: 'New Title',
        attendees: [{ name: 'New Attendee', email: 'new@example.com' }],
        startTime: new Date('2024-01-16T10:00:00Z'),
        endTime: new Date('2024-01-16T11:00:00Z'),
        status: 'cancelled',
        roomId: 'room456',
        userId: 'trying-to-change-user' // Should be forbidden
      };
      (mockRequest as any).user = {
        id: 'user123', // Same as booking userId (owner)
        role: 'admin' // And also admin
      };

      await checkBookingUpdatePermission(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        title: 'New Title',
        attendees: [{ name: 'New Attendee', email: 'new@example.com' }],
        startTime: new Date('2024-01-16T10:00:00Z'),
        endTime: new Date('2024-01-16T11:00:00Z'),
        status: 'cancelled',
        roomId: 'room456'
      });
      expect((mockRequest as any).booking).toEqual(mockBooking);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 for forbidden fields', async () => {
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = {
        userId: 'trying-to-change-user', // Forbidden for everyone
        someOtherField: 'value' // Not in allowed fields
      };
      (mockRequest as any).user = {
        id: 'user123', // Owner
        role: 'employee'
      };

      await checkBookingUpdatePermission(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'FORBIDDEN_FIELDS',
        message: 'You are not allowed to update these fields: userId, someOtherField'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockRequest.params = { id: 'booking123' };
      (mockRequest as any).user = {
        id: 'user123',
        role: 'employee'
      };

      const dbError = new Error('Database connection failed');
      (Booking.findById as jest.Mock).mockRejectedValue(dbError);

      await checkBookingUpdatePermission(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'SERVER_ERROR',
        message: 'Database connection failed'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty request body gracefully', async () => {
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = {};
      (mockRequest as any).user = {
        id: 'user123', // Owner
        role: 'employee'
      };

      await checkBookingUpdatePermission(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({});
      expect((mockRequest as any).booking).toEqual(mockBooking);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});