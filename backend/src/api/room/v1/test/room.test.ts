import { Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

import * as roomController from '../room.controller';
import * as roomService from '../room.service';
import * as roomValidation from '../room.validation';
import { StatusCodes } from 'http-status-codes';
import Room from '../../../../models/room';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../room.service');
jest.mock('../room.validation');
jest.mock('../../../../models/room');

describe('Room Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    sendMock = jest.fn();
    
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user123' }
    };
    
    mockResponse = {
      status: statusMock,
      json: jsonMock,
      send: sendMock
    };
    
    jest.clearAllMocks();
  });

  describe('createroom', () => {
    it('should create room successfully with Board Room name conversion', async () => {
      const mockRoom = { _id: 'room123', name: 'Board Room', capacity: 10 };
      (roomService.createroom as jest.Mock).mockResolvedValue(mockRoom);
      
      mockRequest.body = { name: 'board room', capacity: 10, equipment: ['projector'] };
      
      await roomController.createroom(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockRoom);
    });

    it('should create room successfully with Conference Room name conversion', async () => {
      const mockRoom = { _id: 'room123', name: 'Conference Room', capacity: 15 };
      (roomService.createroom as jest.Mock).mockResolvedValue(mockRoom);
      
      mockRequest.body = { name: 'conference room', capacity: 15, equipment: ['screen'] };
      
      await roomController.createroom(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockRoom);
    });

    it('should handle duplicate room error', async () => {
      const duplicateError = new Error('Duplicate key');
      (duplicateError as any).code = 11000;
      (roomService.createroom as jest.Mock).mockRejectedValue(duplicateError);
      
      mockRequest.body = { name: 'board room', capacity: 10, equipment: ['projector'] };
      
      await roomController.createroom(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'room already exists' });
    });

    it('should handle server error', async () => {
      (roomService.createroom as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      mockRequest.body = { name: 'board room', capacity: 10, equipment: ['projector'] };
      
      await roomController.createroom(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'server error' });
    });
  });

  describe('getroom', () => {
    it('should return rooms successfully', async () => {
      const mockRooms = [{ _id: 'room1', name: 'Board Room' }, { _id: 'room2', name: 'Conference Room' }];
      (roomService.getroom as jest.Mock).mockResolvedValue(mockRooms);
      
      await roomController.getroom(mockRequest as Request, mockResponse as Response);
      
      expect(jsonMock).toHaveBeenCalledWith(mockRooms);
    });

    it('should handle no rooms found', async () => {
      (roomService.getroom as jest.Mock).mockResolvedValue([]);
      
      await roomController.getroom(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'no rooms are found in the database' });
    });

    it('should handle null rooms', async () => {
      (roomService.getroom as jest.Mock).mockResolvedValue(null);
      
      await roomController.getroom(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'no rooms are found in the database' });
    });

    it('should handle server error', async () => {
      (roomService.getroom as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      await roomController.getroom(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'server error' });
    });
  });

  describe('getroomById', () => {
    it('should return room by id successfully', async () => {
      const mockRoom = { _id: 'room123', name: 'Board Room' };
      (roomService.getroomById as jest.Mock).mockResolvedValue(mockRoom);
      
      mockRequest.params = { id: 'room123' };
      
      await roomController.getroomById(mockRequest as Request, mockResponse as Response);
      
      expect(jsonMock).toHaveBeenCalledWith(mockRoom);
    });

    it('should handle missing id parameter', async () => {
      mockRequest.params = {};
      
      await roomController.getroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ messsage: 'mising room id parameter in given url' });
    });

    it('should handle room not found', async () => {
      (roomService.getroomById as jest.Mock).mockResolvedValue(null);
      
      mockRequest.params = { id: 'nonexistent' };
      
      await roomController.getroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'room with given id not found' });
    });

    it('should handle server error', async () => {
      (roomService.getroomById as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      mockRequest.params = { id: 'room123' };
      
      await roomController.getroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'server error' });
    });
  });

  describe('updateroomById', () => {
    it('should update room successfully with name conversion', async () => {
      const mockUpdatedRoom = { _id: 'room123', name: 'Board Room', capacity: 12 };
      (roomService.updateroomById as jest.Mock).mockResolvedValue(mockUpdatedRoom);
      
      mockRequest.params = { id: 'room123' };
      mockRequest.body = { name: 'board room', capacity: 12 };
      
      await roomController.updateroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockUpdatedRoom);
    });

    it('should update room successfully with Conference Room name conversion', async () => {
      const mockUpdatedRoom = { _id: 'room123', name: 'Conference Room', capacity: 15 };
      (roomService.updateroomById as jest.Mock).mockResolvedValue(mockUpdatedRoom);
      
      mockRequest.params = { id: 'room123' };
      mockRequest.body = { name: 'conference room', capacity: 15 };
      
      await roomController.updateroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockUpdatedRoom);
    });

    it('should handle missing id parameter', async () => {
      mockRequest.params = {};
      mockRequest.body = { name: 'board room' };
      
      await roomController.updateroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ messsage: 'mising room id parameter in given url' });
    });

    it('should handle room not found', async () => {
      (roomService.updateroomById as jest.Mock).mockResolvedValue(null);
      
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = { name: 'board room' };
      
      await roomController.updateroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'room with given id not found' });
    });

    it('should handle duplicate room error', async () => {
      const duplicateError = new Error('Duplicate key');
      (duplicateError as any).code = 11000;
      (roomService.updateroomById as jest.Mock).mockRejectedValue(duplicateError);
      
      mockRequest.params = { id: 'room123' };
      mockRequest.body = { name: 'board room' };
      
      await roomController.updateroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'room name already exists' });
    });

    it('should handle server error', async () => {
      (roomService.updateroomById as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      mockRequest.params = { id: 'room123' };
      mockRequest.body = { name: 'board room' };
      
      await roomController.updateroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'server error' });
    });
  });

  describe('deleteroomById', () => {
    it('should delete room successfully', async () => {
      const mockDeletedRoom = { _id: 'room123' };
      (roomService.deleteroomById as jest.Mock).mockResolvedValue(mockDeletedRoom);
      
      mockRequest.params = { id: 'room123' };
      
      await roomController.deleteroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
      expect(sendMock).toHaveBeenCalled();
    });

    it('should handle missing id parameter', async () => {
      mockRequest.params = {};
      
      await roomController.deleteroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ messsage: 'Missing room ID parameter in given URL' });
    });

    it('should handle room not found', async () => {
      (roomService.deleteroomById as jest.Mock).mockResolvedValue(null);
      
      mockRequest.params = { id: 'nonexistent' };
      
      await roomController.deleteroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'room with given id not found' });
    });

    it('should handle server error', async () => {
      (roomService.deleteroomById as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      mockRequest.params = { id: 'room123' };
      
      await roomController.deleteroomById(mockRequest as Request, mockResponse as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'server error' });
    });
  });
});

describe('Room Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createroom', () => {
    it('should create room successfully', async () => {
      const mockRoom = { 
        _id: 'room123', 
        name: 'Board Room', 
        capacity: 10,
        save: jest.fn().mockResolvedValue(true)
      };
      
      const Room = require('../../../models/room');
      Room.mockImplementation(() => mockRoom);
      
      const result = await roomService.createroom({
        name: 'Board Room',
        capacity: 10,
        equipment: ['projector']
      });
      
      expect(result).toBeDefined();
      expect(Room).toHaveBeenCalled();
    });
  });

  describe('getroom', () => {
    it('should return all rooms', async () => {
      const mockRooms = [{ _id: 'room1' }, { _id: 'room2' }];
      const Room = require('../../../models/room');
      Room.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRooms)
      });
      
      const result = await roomService.getroom();
      
      expect(result).toEqual(mockRooms);
      expect(Room.find).toHaveBeenCalled();
    });
  });

  describe('getroomById', () => {
    it('should return room by id', async () => {
      const mockRoom = { _id: 'room123' };
      const Room = require('../../../models/room');
      Room.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRoom)
      });
      
      const result = await roomService.getroomById('room123');
      
      expect(result).toEqual(mockRoom);
      expect(Room.findById).toHaveBeenCalledWith('room123');
    });

    it('should return null for non-existent room', async () => {
      const Room = require('../../../models/room');
      Room.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      
      const result = await roomService.getroomById('nonexistent');
      
      expect(result).toBeNull();
    });
  });

  describe('updateroomById', () => {
    it('should update room successfully', async () => {
      const mockUpdatedRoom = { _id: 'room123', name: 'Updated Room' };
      const Room = require('../../../models/room');
      Room.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedRoom)
      });
      
      const result = await roomService.updateroomById('room123', {
        name: 'Board Room'
      });
      
      expect(result).toEqual(mockUpdatedRoom);
      expect(Room.findByIdAndUpdate).toHaveBeenCalledWith(
        'room123', 
        { name: 'Updated Room' }, 
        { new: true, runValidators: true }
      );
    });

    it('should return null for non-existent room', async () => {
      const Room = require('../../../models/room');
      Room.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      
      const result = await roomService.updateroomById('nonexistent', {
        name: 'Board Room'
      });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteroomById', () => {
    it('should delete room successfully', async () => {
      const mockDeletedRoom = { _id: 'room123' };
      const Room = require('../../../models/room');
      Room.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDeletedRoom)
      });
      
      const result = await roomService.deleteroomById('room123');
      
      expect(result).toEqual(mockDeletedRoom);
      expect(Room.findByIdAndDelete).toHaveBeenCalledWith('room123');
    });

    it('should return null for non-existent room', async () => {
      const Room = require('../../../models/room');
      Room.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      
      const result = await roomService.deleteroomById('nonexistent');
      
      expect(result).toBeNull();
    });
  });
});

describe('Room Validation', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = { body: {}, params: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('createroomValidation', () => {
    it('should pass validation for valid data', () => {
      mockRequest.body = {
        name: 'board room',
        capacity: 10,
        equipment: ['projector']
      };
      
      roomValidation.createroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for invalid name', () => {
      mockRequest.body = {
        name: 'invalid room',
        capacity: 10,
        equipment: ['projector']
      };
      
      roomValidation.createroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for invalid capacity', () => {
      mockRequest.body = {
        name: 'board room',
        capacity: 0, // Invalid - min is 1
        equipment: ['projector']
      };
      
      roomValidation.createroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for missing equipment', () => {
      mockRequest.body = {
        name: 'board room',
        capacity: 10
        // equipment missing
      };
      
      roomValidation.createroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateroomValidation', () => {
    it('should pass validation for valid update data', () => {
      mockRequest.body = {
        name: 'conference room'
      };
      
      roomValidation.updateroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should pass validation for capacity update', () => {
      mockRequest.body = {
        capacity: 15
      };
      
      roomValidation.updateroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should pass validation for equipment update', () => {
      mockRequest.body = {
        equipment: ['projector', 'screen']
      };
      
      roomValidation.updateroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for empty update', () => {
      mockRequest.body = {};
      
      roomValidation.updateroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for invalid name', () => {
      mockRequest.body = {
        name: 'invalid room'
      };
      
      roomValidation.updateroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteroomValidation', () => {
    it('should pass validation for valid object id', () => {
      mockRequest.params = { id: '507f1f77bcf86cd799439011' }; // Valid MongoDB ID
      
      roomValidation.deleteroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for invalid object id', () => {
      mockRequest.params = { id: 'invalid-id' };
      
      roomValidation.deleteroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for missing id', () => {
      mockRequest.params = {};
      
      roomValidation.deleteroomValidation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});

// Test the router endpoints
describe('Room Router', () => {
  it('should handle PUT without id', async () => {
    const router = require('../room.router');
    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    
    // Test the route handler directly
    const routeHandler = router.stack.find((layer: any) => layer.route?.path === '/').route.stack[0].handle;
    routeHandler(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'id is required' });
  });

  it('should handle DELETE without id', async () => {
    const router = require('../room.router');
    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    
    // Test the route handler directly
    const routeHandler = router.stack.find((layer: any) => layer.route?.path === '/').route.stack[1].handle;
    routeHandler(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'id is required' });
  });
});