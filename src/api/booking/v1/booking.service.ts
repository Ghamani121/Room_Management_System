import { startSession } from "mongoose";
import Booking, { BookingDocument } from "../../../models/booking";
import Room from "../../../models/room";
import User from "../../../models/user";
import { isValidObjectId } from '../../../utils/validateobjectid';

// Create booking with transaction
export async function createbooking(data: Partial<BookingDocument>): Promise<BookingDocument> {
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        // Validate roomId
        if (!data.roomId || !isValidObjectId(data.roomId)) throw new Error("Invalid room id");

        const room = await Room.findById(data.roomId).session(session);
        if (!room) throw new Error("Room not found");

        // Validate userId
        if (!data.userId || !isValidObjectId(data.userId)) throw new Error("Invalid user id");

        const user = await User.findById(data.userId).session(session);
        if (!user) throw new Error("User not found");

        // Check for conflicting booking in same room
        const conflict = await Booking.findOne({
            roomId: data.roomId,
            status: "confirmed",
            $or: [{ startTime: { $lt: data.endTime }, endTime: { $gt: data.startTime } }],
        }).session(session);

        if (conflict) throw new Error("Room is booked");

        // Create and save booking
        const booking = new Booking(data);
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();
        return booking;

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}

// Update booking with transaction
export async function updateBooking(id: string, data: Partial<BookingDocument>): Promise<BookingDocument | null> {
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const existing = await Booking.findById(id).session(session);
        if (!existing) throw new Error("Booking not found");

        // Validate room if being changed
        if (data.roomId) {
            if (!isValidObjectId(data.roomId)) throw new Error("Invalid room id");
            const roomExists = await Room.findById(data.roomId).session(session);
            if (!roomExists) throw new Error("Room not found");
        }

        // Handle time updates
        if (data.startTime || data.endTime) {
            if (!data.startTime || !data.endTime) throw new Error("Missing time field");

            const newStart = data.startTime;
            const newEnd = data.endTime;
            const roomId = data.roomId || existing.roomId;

            const conflict = await Booking.findOne({
                roomId,
                status: "confirmed",
                _id: { $ne: id },
                $or: [{ startTime: { $lt: newEnd }, endTime: { $gt: newStart } }]
            }).session(session);

            if (conflict) throw new Error("Room is booked");
        }

        const updated = await Booking.findByIdAndUpdate(id, data, { new: true, runValidators: true, session });
        await session.commitTransaction();
        session.endSession();
        return updated;

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}

// Delete booking
export async function deletebookingById(id: string): Promise<BookingDocument | null> {
    const deleted = await Booking.findByIdAndDelete(id).exec();
    if (!deleted) throw new Error("Booking not found");
    return deleted;
}

// Fetch all bookings
export async function getAllBookings(): Promise<BookingDocument[]> {
    return Booking.find(); // Returns empty array if none
}
