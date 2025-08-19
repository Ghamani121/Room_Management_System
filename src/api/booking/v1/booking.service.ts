import Booking, { BookingDocument } from "../../../models/booking";
import Room from "../../../models/room";
import User from "../../../models/user";
import { isValidObjectId } from '../../../utils/validateobjectid';

// Atomic create booking to prevent race conditions
export async function createbooking(data: Partial<BookingDocument>): Promise<BookingDocument> {
    // Validate roomId
    if (!data.roomId || !isValidObjectId(data.roomId)) throw new Error("Invalid room id");
    const room = await Room.findById(data.roomId);
    if (!room) throw new Error("Room not found");

    // Validate userId
    if (!data.userId || !isValidObjectId(data.userId)) throw new Error("Invalid user id");
    const user = await User.findById(data.userId);
    if (!user) throw new Error("User not found");

    // Atomic operation: check conflict and insert if none exists
    const existingConflict = await Booking.findOne({
        roomId: data.roomId,
        status: "confirmed",
        $or: [{ startTime: { $lt: data.endTime }, endTime: { $gt: data.startTime } }]
    });

    if (existingConflict) throw new Error("Room is booked");

    // No conflict: create booking
    const booking = new Booking(data);
    return booking.save();
}

// Update booking
export async function updateBooking(id: string, data: Partial<BookingDocument>): Promise<BookingDocument | null> {
    const existing = await Booking.findById(id);
    if (!existing) throw new Error("Booking not found");

    // Validate room if being changed
    if (data.roomId) {
        if (!isValidObjectId(data.roomId)) throw new Error("Invalid room id");
        const roomExists = await Room.findById(data.roomId);
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
        });

        if (conflict) throw new Error("Room is booked");
    }

    return Booking.findByIdAndUpdate(id, data, { new: true, runValidators: true });
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
