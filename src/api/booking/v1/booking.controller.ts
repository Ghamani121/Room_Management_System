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

// Get all bookings
export async function getAllBookings(req: Request, res: Response) {
    try {
        const bookings = await bookingService.getAllBookings();
        res.status(StatusCodes.OK).json(bookings);
    } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}
