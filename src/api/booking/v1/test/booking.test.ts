// booking/v1/test/booking.test.ts
import { Request, Response, NextFunction } from 'express';
import * as bookingController from '../booking.controller';
import * as bookingService from '../booking.service';
import * as bookingValidation from '../booking.validation';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Room from '../../../../models/room';
import User from '../../../../models/user';
import Booking,{BookingDocument} from '../../../../models/booking';

// Mock the services and validation
jest.mock('../booking.service');
jest.mock('../booking.validation');

describe('Booking Controller Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      body: {},
      params: {},
      query: {},
      userId: { id: 'user123' }
    }as any;
    
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
      
      expect(bookingService.createbooking).toHaveBeenCalledWith(
        expect.objectContaining({ roomId: 'room123', userId: 'user123' })
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(jsonMock).toHaveBeenCalledWith(mockBooking);
    });

    it('should handle invalid room id error', async () => {
      (bookingService.createbooking as jest.Mock).mockRejectedValue(new Error('Invalid room id'));
      
      mockRequest.body = { roomId: 'invalid-room', startTime: new Date(), endTime: new Date(Date.now() + 3600000) };
      
      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid room id',
        message: 'The provided roomId is not valid'
      });
    });

    it('should handle room not found error', async () => {
      (bookingService.createbooking as jest.Mock).mockRejectedValue(new Error('Room not found'));
      
      mockRequest.body = { roomId: 'nonexistent-room', startTime: new Date(), endTime: new Date(Date.now() + 3600000) };
      
      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Room not found',
        message: 'The provided roomId is not valid'
      });
    });

    it('should handle room booked error', async () => {
      (bookingService.createbooking as jest.Mock).mockRejectedValue(new Error('Room is booked'));
      
      mockRequest.body = { roomId: 'room123', startTime: new Date(), endTime: new Date(Date.now() + 3600000) };
      
      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Room is booked',
        message: 'Room already booked for the requested time slot'
      });
    });

    it('should handle general error', async () => {
      (bookingService.createbooking as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      mockRequest.body = { roomId: 'room123', startTime: new Date(), endTime: new Date(Date.now() + 3600000) };
      
      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('updatebookingById', () => {
    it('should update booking successfully', async () => {
      const mockUpdatedBooking = { _id: 'booking123', title: 'Updated Meeting' };
      (bookingService.updateBooking as jest.Mock).mockResolvedValue(mockUpdatedBooking);
      
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = { title: 'Updated Meeting' };
      
      await bookingController.updatebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(bookingService.updateBooking).toHaveBeenCalledWith('booking123', { title: 'Updated Meeting' });
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
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Missing time field',
        message: 'Both startTime and endTime must be provided together'
      });
    });

    it('should handle booking not found error', async () => {
      (bookingService.updateBooking as jest.Mock).mockRejectedValue(new Error('Booking not found'));
      
      mockRequest.params = { id: 'nonexistent-booking' };
      mockRequest.body = { title: 'Updated Meeting' };
      
      await bookingController.updatebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Booking not found',
        message: 'Booking not found'
      });
    });

    it('should handle room booked error', async () => {
      (bookingService.updateBooking as jest.Mock).mockRejectedValue(new Error('Room is booked'));
      
      mockRequest.params = { id: 'booking123' };
      mockRequest.body = { startTime: new Date(), endTime: new Date(Date.now() + 3600000) };
      
      await bookingController.updatebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Room is booked',
        message: 'Room already booked for the requested time slot'
      });
    });
  });

  describe('deletebookingById', () => {
    it('should delete booking successfully', async () => {
      (bookingService.deletebookingById as jest.Mock).mockResolvedValue({ _id: 'booking123' });
      
      mockRequest.params = { id: 'booking123' };
      
      await bookingController.deletebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(bookingService.deletebookingById).toHaveBeenCalledWith('booking123');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle missing id parameter', async () => {
      mockRequest.params = {};
      
      await bookingController.deletebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Missing booking ID parameter in URL' });
    });

    it('should handle booking not found error', async () => {
      (bookingService.deletebookingById as jest.Mock).mockRejectedValue(new Error('Booking not found'));
      
      mockRequest.params = { id: 'nonexistent-booking' };
      
      await bookingController.deletebookingById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Booking not found',
        message: 'Given booking id is not present in the db'
      });
    });
  });

  describe('getAllBookings', () => {
    it('should fetch all bookings successfully', async () => {
      const mockBookings = [{ _id: 'booking1' }, { _id: 'booking2' }];
      (bookingService.getAllBookings as jest.Mock).mockResolvedValue({ data: mockBookings });
      
      mockRequest.query = { page: '1', limit: '10' };
      
      await bookingController.getAllBookings(mockRequest as Request, mockResponse as Response);
      
      expect(bookingService.getAllBookings).toHaveBeenCalledWith({
        page: '1',
        limit: '10'
      });
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Bookings fetched successfully",
        data: mockBookings
      });
    });

    it('should handle service error', async () => {
      (bookingService.getAllBookings as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      mockRequest.query = { page: '1', limit: '10' };
      
      await bookingController.getAllBookings(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Server error',
        error: 'Database error'
      });
    });

    it('should handle filters correctly', async () => {
      const mockBookings = [{ _id: 'booking1' }];
      (bookingService.getAllBookings as jest.Mock).mockResolvedValue({ data: mockBookings });
      
      mockRequest.query = {
        userId: 'user123',
        roomId: 'room456',
        status: 'confirmed',
        page: '2',
        limit: '5'
      };
      
      await bookingController.getAllBookings(mockRequest as Request, mockResponse as Response);
      
      expect(bookingService.getAllBookings).toHaveBeenCalledWith({
        userId: 'user123',
        roomId: 'room456',
        status: 'confirmed',
        page: '2',
        limit: '5'
      });
    });
  });
});

describe('Booking Service Tests', () => {
  // Mock mongoose models
  const mockBooking = {
    _id: new mongoose.Types.ObjectId(),
    save: jest.fn(),
    toObject: jest.fn().mockReturnValue({ _id: 'booking123' })
  };

  const mockRoom = {
    _id: new mongoose.Types.ObjectId(),
    findById: jest.fn()
  };

  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    findById: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createbooking', () => {
    it('should create booking successfully', async () => {
      // Mock Room.findById to return a room
      (Room.findById as jest.Mock).mockResolvedValue(mockRoom);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Booking.findOne as jest.Mock).mockResolvedValue(null); // No conflict
      (Booking as any).mockImplementation(() => mockBooking);
      mockBooking.save.mockResolvedValue(mockBooking);


  const bookingData: Partial<BookingDocument> = {
  roomId: new mongoose.Types.ObjectId('64a1f2c2e4b0c2a1b2c3d4e5'),
  userId: new mongoose.Types.ObjectId('64a1f2c2e4b0c2a1b2c3d4e6'),
  startTime: new Date(),
  endTime: new Date()
};

      const result = await bookingService.createbooking(bookingData);

      expect(Room.findById).toHaveBeenCalledWith('valid-room-id');
      expect(User.findById).toHaveBeenCalledWith('valid-user-id');
      expect(Booking.findOne).toHaveBeenCalled();
      expect(mockBooking.save).toHaveBeenCalled();
      expect(result).toEqual(mockBooking);
    });

    it('should throw error for invalid room id', async () => {

  const bookingData: Partial<BookingDocument> = {
  roomId: new mongoose.Types.ObjectId('64a1f2c2e4b0c2a1b2c3d4e5'),
  userId: new mongoose.Types.ObjectId('64a1f2c2e4b0c2a1b2c3d4e6'),
  startTime: new Date(),
  endTime: new Date()
};

      await expect(bookingService.createbooking(bookingData)).rejects.toThrow('Invalid room id');
    });

    it('should throw error for non-existent room', async () => {
      (Room.findById as jest.Mock).mockResolvedValue(null);


  const bookingData: Partial<BookingDocument> = {
  roomId: new mongoose.Types.ObjectId('64a1f2c2e4b0c2a1b2c3d4e5'),
  userId: new mongoose.Types.ObjectId('64a1f2c2e4b0c2a1b2c3d4e6'),
  startTime: new Date(),
  endTime: new Date()
};
      await expect(bookingService.createbooking(bookingData)).rejects.toThrow('Room not found');
    });
  });

  describe('updateBooking', () => {
    it('should update booking successfully', async () => {
      const existingBooking = { _id: 'booking123', roomId: 'room123' };
      (Booking.findById as jest.Mock).mockResolvedValue(existingBooking);
      (Booking.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...existingBooking, title: 'Updated' });

      const result = await bookingService.updateBooking('booking123', { title: 'Updated' });

      expect(Booking.findById).toHaveBeenCalledWith('booking123');
      expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(
        'booking123',
        { title: 'Updated' },
        { new: true, runValidators: true }
      );
      expect(result).toEqual({ ...existingBooking, title: 'Updated' });
    });

    it('should throw error for non-existent booking', async () => {
      (Booking.findById as jest.Mock).mockResolvedValue(null);

      await expect(bookingService.updateBooking('nonexistent', { title: 'Updated' }))
        .rejects.toThrow('Booking not found');
    });
  });

  describe('deletebookingById', () => {
    it('should delete booking successfully', async () => {
      const deletedBooking = { _id: 'booking123' };
      (Booking.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedBooking);

      const result = await bookingService.deletebookingById('booking123');

      expect(Booking.findByIdAndDelete).toHaveBeenCalledWith('booking123');
      expect(result).toEqual(deletedBooking);
    });

    it('should throw error for non-existent booking', async () => {
      (Booking.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(bookingService.deletebookingById('nonexistent'))
        .rejects.toThrow('Booking not found');
    });
  });
});

describe('Booking Validation Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = { body: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('validateCreateBooking', () => {
    it('should pass validation for valid booking data', () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      futureDate.setHours(10, 0, 0, 0); // 10:00 AM
      
      const endTime = new Date(futureDate.getTime() + 3600000); // 11:00 AM
      
      mockRequest.body = {
        roomId: 'room123',
        startTime: futureDate,
        endTime: endTime,
        title: 'Test Meeting'
      };

      bookingValidation.validateCreateBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for missing required fields', () => {
      mockRequest.body = { title: 'Test Meeting' };

      bookingValidation.validateCreateBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should fail validation for past start time', () => {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      
      mockRequest.body = {
        roomId: 'room123',
        startTime: pastDate,
        endTime: new Date(pastDate.getTime() + 3600000)
      };

      bookingValidation.validateCreateBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUpdateBooking', () => {
    it('should pass validation for valid update data', () => {
      const futureDate = new Date(Date.now() + 86400000);
      futureDate.setHours(10, 0, 0, 0);
      
      mockRequest.body = {
        title: 'Updated Meeting',
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 3600000)
      };

      bookingValidation.validateUpdateBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for invalid time range', () => {
      const futureDate = new Date(Date.now() + 86400000);
      futureDate.setHours(10, 0, 0, 0);
      
      mockRequest.body = {
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() - 3600000) // End before start
      };

      bookingValidation.validateUpdateBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});