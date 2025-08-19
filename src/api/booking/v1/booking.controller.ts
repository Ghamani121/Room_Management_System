import { Request, Response } from 'express';
import * as bookingService from './booking.service';
import { StatusCodes } from 'http-status-codes';

// Create booking
export async function createbooking(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;  
        const bookingData = { ...req.body, userId };

        const booking = await bookingService.createbooking(bookingData);
        res.status(StatusCodes.CREATED).json(booking);

    } catch (error: any) {
        if (error.message === "Invalid room id" || error.message === "Room not found") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: error.message,
                message: "The provided roomId is not valid"
            });
        }

        if (error.message === "Room is booked") {
            return res.status(StatusCodes.CONFLICT).json({
                error: error.message,
                message: "Room already booked for the requested time slot"
            });
        }

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }    
}

// Update booking
export async function updatebookingById(req: Request, res: Response) {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: 'Missing booking id parameter in URL' });

        const updated = await bookingService.updateBooking(id, req.body);
        res.status(StatusCodes.OK).json(updated);

    } catch (error: any) {
        if (error.message === "Missing time field") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: error.message,
                message: "Both startTime and endTime must be provided together"
            });
        }

        if (error.message === "Booking not found") {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: error.message,
                message: "Booking not found"
            });
        }

        if (error.message === "Room is booked") {
            return res.status(StatusCodes.CONFLICT).json({
                error: error.message,
                message: "Room already booked for the requested time slot"
            });
        }

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

// Delete booking
export async function deletebookingById(req: Request, res: Response) {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: 'Missing booking ID parameter in URL' });

        await bookingService.deletebookingById(id);
        res.status(204).send();

    } catch (error: any) {
        if (error.message === "Booking not found") {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: error.message,
                message: "Given booking id is not present in the db"
            });
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
}

// Controller: Fetch all bookings with filters, pagination, sorting
export async function getAllBookings(req: Request, res: Response) {
  try {
    // Pass query params from the request to the service
    const filters = {
      userId: req.query.userId as string,
      roomId: req.query.roomId as string,
      startTime: req.query.startTime as string,
      endTime: req.query.endTime as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as string,
    };

    const result = await bookingService.getAllBookings(filters);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Bookings fetched successfully",
      ...result, // includes data, total, page, limit
    });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error", error: error.message });
  }
}
