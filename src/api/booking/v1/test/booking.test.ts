// src/api/booking/v1/test/booking.test.ts
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

// Mock dependencies
jest.mock("../booking.service", () => ({
  createbooking: jest.fn(),
  updateBooking: jest.fn(),
  deletebookingById: jest.fn(),
  getAllBookings: jest.fn()
}));

jest.mock("../booking.validation", () => ({
  validateCreateBooking: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
  validateUpdateBooking: jest.fn((req: Request, res: Response, next: NextFunction) => next())
}));

jest.mock("../../../../models/booking", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      save: jest.fn()
    }))
  };
});

jest.mock("../../../../models/room", () => ({
  findById: jest.fn()
}));

jest.mock("../../../../models/user", () => ({
  findById: jest.fn()
}));

jest.mock("../../../../utils/validateobjectid", () => ({
  isValidObjectId: jest.fn()
}));

import * as bookingController from "../booking.controller";
import * as bookingService from "../booking.service";
import * as bookingValidation from "../booking.validation";
import Room from "../../../../models/room";
import User from "../../../../models/user";
import { isValidObjectId } from "../../../../utils/validateobjectid";

describe("Booking Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock, send: sendMock }));
    sendMock = jest.fn();
    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
      send: sendMock
    };
    jest.clearAllMocks();
  });

  describe("createbooking", () => {
    it("should create a booking and return 201", async () => {
      (isValidObjectId as jest.Mock).mockReturnValue(true);
      (Room.findById as jest.Mock).mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
      (User.findById as jest.Mock).mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
      const bookingMock = { _id: new mongoose.Types.ObjectId(), title: "Meeting" };
      (bookingService.createbooking as jest.Mock).mockResolvedValue(bookingMock);

      mockRequest.body = {
        roomId: new mongoose.Types.ObjectId().toHexString(),
        title: "Meeting",
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000)
      };
      (mockRequest as any).user = { id: new mongoose.Types.ObjectId().toHexString() };

      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(jsonMock).toHaveBeenCalledWith(bookingMock);
    });

    it("should handle invalid room id error", async () => {
      (isValidObjectId as jest.Mock).mockReturnValue(false);
      mockRequest.body = {
        roomId: "invalid",
        title: "Meeting",
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000)
      };
      (mockRequest as any).user = { id: new mongoose.Types.ObjectId().toHexString() };

      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid room id",
        message: "The provided roomId is not valid"
      });
    });

    it("should handle room already booked error", async () => {
      (isValidObjectId as jest.Mock).mockReturnValue(true);
      (Room.findById as jest.Mock).mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
      (User.findById as jest.Mock).mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
      (bookingService.createbooking as jest.Mock).mockRejectedValue(new Error("Room is booked"));

      mockRequest.body = {
        roomId: new mongoose.Types.ObjectId().toHexString(),
        title: "Meeting",
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000)
      };
      (mockRequest as any).user = { id: new mongoose.Types.ObjectId().toHexString() };

      await bookingController.createbooking(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.CONFLICT);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Room is booked",
        message: "Room already booked for the requested time slot"
      });
    });
  });

  describe("updatebookingById", () => {
    it("should update booking and return 200", async () => {
      const updatedBooking = { _id: new mongoose.Types.ObjectId(), title: "Updated Meeting" };
      (bookingService.updateBooking as jest.Mock).mockResolvedValue(updatedBooking);

      mockRequest.params = { id: new mongoose.Types.ObjectId().toHexString() };
      mockRequest.body = { title: "Updated Meeting" };

      await bookingController.updatebookingById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(updatedBooking);
    });

    it("should handle missing booking id", async () => {
      mockRequest.params = {};
      await bookingController.updatebookingById(mockRequest as Request, mockResponse as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Missing booking id parameter in URL" });
    });

    it("should handle booking not found error", async () => {
      (bookingService.updateBooking as jest.Mock).mockRejectedValue(new Error("Booking not found"));
      mockRequest.params = { id: new mongoose.Types.ObjectId().toHexString() };
      mockRequest.body = { title: "Updated Meeting" };

      await bookingController.updatebookingById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Booking not found",
        message: "Booking not found"
      });
    });
  });

  describe("deletebookingById", () => {
    it("should delete booking and return 204", async () => {
      (bookingService.deletebookingById as jest.Mock).mockResolvedValue({});
      mockRequest.params = { id: new mongoose.Types.ObjectId().toHexString() };

      await bookingController.deletebookingById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it("should handle missing booking id", async () => {
      mockRequest.params = {};
      await bookingController.deletebookingById(mockRequest as Request, mockResponse as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Missing booking ID parameter in URL" });
    });

    it("should handle booking not found error", async () => {
      (bookingService.deletebookingById as jest.Mock).mockRejectedValue(new Error("Booking not found"));
      mockRequest.params = { id: new mongoose.Types.ObjectId().toHexString() };

      await bookingController.deletebookingById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Booking not found",
        message: "Given booking id is not present in the db"
      });
    });
  });

  describe("getAllBookings", () => {
    it("should fetch bookings and return 200", async () => {
      const bookings = [{ _id: new mongoose.Types.ObjectId(), title: "Meeting" }];
      (bookingService.getAllBookings as jest.Mock).mockResolvedValue({ data: bookings });

      mockRequest.query = {};

      await bookingController.getAllBookings(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Bookings fetched successfully",
          data: bookings
        })
      );
    });

    it("should handle service error", async () => {
      (bookingService.getAllBookings as jest.Mock).mockRejectedValue(new Error("Database error"));
      mockRequest.query = {};

      await bookingController.getAllBookings(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Server error",
          error: "Database error"
        })
      );
    });
  });
});


describe("Booking Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Response;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockNext = jest.fn();

    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
      // Add any other required Response methods as needed
    } as unknown as Response;
  });

  describe("validateCreateBooking", () => {
    it("should call next for valid booking", () => {
      mockRequest.body = {
        roomId: "roomid",
        title: "Meeting",
        startTime: new Date(Date.now() + 3600000),
        endTime: new Date(Date.now() + 7200000),
        attendees: [{ name: "John", email: "john@example.com" }]
      };

      bookingValidation.validateCreateBooking(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 400 for invalid booking", () => {
      mockRequest.body = {
        roomId: "",
        startTime: new Date(Date.now() - 3600000), // in the past
        endTime: new Date(Date.now() + 7200000)
      };

      bookingValidation.validateCreateBooking(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("validateUpdateBooking", () => {
    it("should call next for valid update", () => {
      mockRequest.body = {
        title: "Updated Meeting"
      };

      bookingValidation.validateUpdateBooking(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 400 for invalid update", () => {
      mockRequest.body = {
        startTime: new Date(Date.now() - 3600000) // in the past
      };

      bookingValidation.validateUpdateBooking(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});

// Test router endpoints
describe("Booking Router", () => {
  it("should handle PUT without id", async () => {
    const router = require("../booking.routing");
    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    // Test the route handler directly
    const routeHandler = router.stack.find((layer: any) => layer.route?.path === "/").route.stack[0].handle;
    routeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "id is required" });
  });

  it("should handle DELETE without id", async () => {
    const router = require("../booking.routing");
    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    // Test the route handler directly
    const routeHandler = router.stack.find((layer: any) => layer.route?.path === "/").route.stack[1].handle;
    routeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "id is required" });
  });
});