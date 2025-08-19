import { Request, Response, NextFunction } from "express";
import Booking from "../models/booking";
import { StatusCodes } from "http-status-codes";

// Middleware to check booking update permissions and filter fields
export async function checkBookingUpdatePermission(req: Request, res: Response, next: NextFunction) {
  try {
    const bookingId = req.params.id;
    const userId = (req as any).user?.id;
    const role = (req as any).user?.role;

    if (!bookingId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "MISSING_BOOKING_ID",
        message: "Booking ID is required in the URL",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "BOOKING_NOT_FOUND",
        message: "Booking does not exist",
      });
    }

    // Determine ownership
    const isOwner = booking.userId.toString() === userId;
    const isAdmin = role === "admin";

    // Define allowed fields
    let allowedFields: string[] = [];
    if (isAdmin && !isOwner) {
      allowedFields = ["status"];
    } else if (isOwner && !isAdmin) {
      allowedFields = ["title", "attendees", "startTime", "endTime","roomId"];
    } else if (isOwner && isAdmin) {
      allowedFields = ["title", "attendees", "startTime", "endTime", "status","roomId"];
    }

    // Always forbidden
    const forbiddenFields = ["userId"];
    
    // Collect forbidden fields present in request
    const attemptedForbidden = Object.keys(req.body).filter(
      key => forbiddenFields.includes(key) || !allowedFields.includes(key)
    );

    if (attemptedForbidden.length > 0) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "FORBIDDEN_FIELDS",
        message: `You are not allowed to update these fields: ${attemptedForbidden.join(", ")}`,
      });
    }

    // Filter request body to only allowed fields
    req.body = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {} as any);

    // Attach booking for service use
    (req as any).booking = booking;

    next();
  } catch (err: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "SERVER_ERROR",
      message: err.message,
    });
  }
}
