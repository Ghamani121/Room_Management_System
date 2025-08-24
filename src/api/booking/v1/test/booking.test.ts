// booking/v1/test/booking.test.ts
import { Request, Response, NextFunction } from 'express';
import * as bookingController from '../booking.controller';
import * as bookingService from '../booking.service';
import * as bookingValidation from '../booking.validation';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../booking.service');
jest.mock('../booking.validation');
jest.mock('../../../models/booking');
jest.mock('../../../models/room');
jest.mock('../../../models/user');

describe('Booking Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    
mockRequest = { 
  body: {}, 
  user: { id: 'user123', role: 'employee' } // Add user property for tests
} as any;
    
    mockResponse = {
      status: statusMock,
      json: jsonMock,
      send: jest.fn()
    };
    
    mockNext = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('createbooking', () => {
    it('should create booking successfully', async () => {
      const mockBooking = { _id: 'booking123', roomId: 'room123', userId: 'user123' };
      (bookingService.createbooking as jest.Mock).mockResolvedValue(mockBooking);
      
      mockRequest.body = { roomId: 'room123', startTime: new Date(), endTime: new Date(Date.now() + 3600000) };
      
      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(jsonMock).toHaveBeenCalledWith(mockBooking);
    });

    it('should handle invalid room id error', async () => {
      (bookingService.createbooking as jest.Mock).mockRejectedValue(new Error('Invalid room id'));
      
      mockRequest.body = { roomId: 'invalid', startTime: new Date(), endTime: new Date(Date.now() + 3600000) };
      
      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid room id',
        message: 'The provided roomId is not valid'
      });
    });

    it('should handle room not found error', async () => {
      (bookingService.createbooking as jest.Mock).mockRejectedValue(new Error('Room not found'));
      
      mockRequest.body = { roomId: 'nonexistent', startTime: new Date(), endTime: new Date(Date.now() + 3600000) };
      
      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it('should handle room booked error', async () => {
      (bookingService.createbooking as jest.Mock).mockRejectedValue(new Error('Room is booked'));
      
      mockRequest.body = { roomId: 'room123', startTime: new Date(), endTime: new Date(Date.now() + 3600000) };
      
      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    });

    it('should handle internal server error', async () => {
      (bookingService.createbooking as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      mockRequest.body = { roomId: 'room123', startTime: new Date(), endTime: new Date(Date.now() + 3600000) };
      
      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('updatebookingById', () => {
    it('should update booking successfully', async () => {
      const mockUpdatedBooking = { _id: 'booking123', title: 'Updated Meeting' };
      (bookingService.updateBooking as jest.Mock).mockResolvedValue(mockUpdatedBooking);
      
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = { title: 'Updated Meeting' };
      
      await bookingController.updatebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockUpdatedBooking);
    });

    it('should handle missing id parameter', async () => {
      mockRequest.params = {};
      mockRequest.body = { title: 'Updated Meeting' };
      
      await bookingController.updatebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Missing booking id parameter in URL' });
    });

    it('should handle missing time field error', async () => {
      (bookingService.updateBooking as jest.Mock).mockRejectedValue(new Error('Missing time field'));
      
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = { startTime: new Date() }; // Missing endTime
      
      await bookingController.updatebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it('should handle booking not found error', async () => {
      (bookingService.updateBooking as jest.Mock).mockRejectedValue(new Error('Booking not found'));
      
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = { title: 'Updated Meeting' };
      
      await bookingController.updatebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    });

    it('should handle room booked error', async () => {
      (bookingService.updateBooking as jest.Mock).mockRejectedValue(new Error('Room is booked'));
      
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = { startTime: new Date(), endTime: new Date(Date.now() + 3600000) };
      
      await bookingController.updatebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    });
  });

  describe('deletebookingById', () => {
    it('should delete booking successfully', async () => {
      (bookingService.deletebookingById as jest.Mock).mockResolvedValue({});
      
      mockRequest.params = { id: 'booking123' };
      
      await bookingController.deletebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.send).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(204);
    });

    it('should handle missing id parameter', async () => {
      mockRequest.params = {};
      
      await bookingController.deletebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Missing booking ID parameter in URL' });
    });

    it('should handle booking not found error', async () => {
      (bookingService.deletebookingById as jest.Mock).mockRejectedValue(new Error('Booking not found'));
      
      mockRequest.params = { id: 'nonexistent' };
      
      await bookingController.deletebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    });

    it('should handle internal server error', async () => {
      (bookingService.deletebookingById as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      mockRequest.params = { id: 'booking123' };
      
      await bookingController.deletebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getAllBookings', () => {
    it('should fetch bookings successfully', async () => {
      const mockBookings = [{ _id: 'booking1' }, { _id: 'booking2' }];
      (bookingService.getAllBookings as jest.Mock).mockResolvedValue({ data: mockBookings });
      
      mockRequest.query = { page: '1', limit: '10' };
      
      await bookingController.getAllBookings(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Bookings fetched successfully",
        data: mockBookings
      });
    });

    it('should handle internal server error', async () => {
      (bookingService.getAllBookings as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      mockRequest.query = { page: '1', limit: '10' };
      
      await bookingController.getAllBookings(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});

describe('Booking Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createbooking', () => {
    it('should create booking successfully', async () => {
      const mockRoom = { _id: 'room123' };
      const mockUser = { _id: 'user123' };
      const mockBooking = { 
        _id: 'booking123', 
        roomId: 'room123', 
        userId: 'user123',
        save: jest.fn().mockResolvedValue(true)
      };
      
      const Room = require('../../../models/room');
      const User = require('../../../models/user');
      const Booking = require('../../../models/booking');
      
      Room.findById.mockResolvedValue(mockRoom);
      User.findById.mockResolvedValue(mockUser);
      Booking.findOne.mockResolvedValue(null);
      Booking.mockImplementation(() => mockBooking);
      
      const result = await bookingService.createbooking({
        roomId: 'room123',
        userId: 'user123',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000)
      });
      
      expect(result).toBeDefined();
      expect(Booking).toHaveBeenCalled();
    });

    it('should throw error for invalid room id', async () => {
      await expect(bookingService.createbooking({
        roomId: 'invalid',
        userId: 'user123',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000)
      })).rejects.toThrow('Invalid room id');
    });
  });

  describe('updateBooking', () => {
    it('should update booking successfully', async () => {
      const mockExistingBooking = { _id: 'booking123', roomId: 'room123' };
      const mockRoom = { _id: 'room123' };
      const mockUpdatedBooking = { _id: 'booking123', title: 'Updated' };
      
      const Booking = require('../../../models/booking');
      const Room = require('../../../models/room');
      
      Booking.findById.mockResolvedValue(mockExistingBooking);
      Room.findById.mockResolvedValue(mockRoom);
      Booking.findOne.mockResolvedValue(null);
      Booking.findByIdAndUpdate.mockResolvedValue(mockUpdatedBooking);
      
      const result = await bookingService.updateBooking('booking123', {
        title: 'Updated'
      });
      
      expect(result).toEqual(mockUpdatedBooking);
    });

    it('should throw error for non-existent booking', async () => {
      const Booking = require('../../../models/booking');
      Booking.findById.mockResolvedValue(null);
      
      await expect(bookingService.updateBooking('nonexistent', {
        title: 'Updated'
      })).rejects.toThrow('Booking not found');
    });
  });

  describe('deletebookingById', () => {
    it('should delete booking successfully', async () => {
      const mockDeletedBooking = { _id: 'booking123' };
      const Booking = require('../../../models/booking');
      Booking.findByIdAndDelete.mockResolvedValue(mockDeletedBooking);
      
      const result = await bookingService.deletebookingById('booking123');
      
      expect(result).toEqual(mockDeletedBooking);
    });

    it('should throw error for non-existent booking', async () => {
      const Booking = require('../../../models/booking');
      Booking.findByIdAndDelete.mockResolvedValue(null);
      
      await expect(bookingService.deletebookingById('nonexistent')).rejects.toThrow('Booking not found');
    });
  });
});

describe('Booking Validation', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = { body: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('validateCreateBooking', () => {
    it('should pass validation for valid data', () => {
      mockRequest.body = {
        roomId: 'room123',
        startTime: new Date(Date.now() + 3600000), // 1 hour from now
        endTime: new Date(Date.now() + 7200000)    // 2 hours from now
      };
      
      bookingValidation.validateCreateBooking(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for past start time', () => {
      mockRequest.body = {
        roomId: 'room123',
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        endTime: new Date(Date.now() + 3600000)    // 1 hour from now
      };
      
      bookingValidation.validateCreateBooking(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUpdateBooking', () => {
    it('should pass validation for valid update data', () => {
      mockRequest.body = {
        title: 'Updated Meeting'
      };
      
      bookingValidation.validateUpdateBooking(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for invalid status', () => {
      mockRequest.body = {
        status: 'invalid-status'
      };
      
      bookingValidation.validateUpdateBooking(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});

// Add this to your package.json scripts:
// "test:booking": "jest booking/v1/test/booking.test.ts --coverage"