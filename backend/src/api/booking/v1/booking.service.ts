import Booking, { BookingDocument } from "../../../models/booking";
import Room from "../../../models/room";
import User from "../../../models/user";
import { isValidObjectId } from '../../../utils/validateobjectid';
import mongoose from "mongoose";

// Create booking with transaction
export async function createbooking(data: Partial<BookingDocument>): Promise<BookingDocument> {
 
        // Validate roomId
        if (!data.roomId || !isValidObjectId(data.roomId)) throw new Error("Invalid room id");

        const room = await Room.findById(data.roomId);
        if (!room) throw new Error("Room not found");

        // Validate userId
        if (!data.userId || !isValidObjectId(data.userId)) throw new Error("Invalid user id");

        const user = await User.findById(data.userId);
        if (!user) throw new Error("User not found");

        // Check for conflicting booking in same room
        const conflict = await Booking.findOne({
            roomId: data.roomId,
            status: "confirmed",
            $or: [{ startTime: { $lt: data.endTime }, endTime: { $gt: data.startTime } }],
        });

        if (conflict) throw new Error("Room is booked");

        // Create and save booking
            const booking = new Booking({
        ...data,
        roomId: new mongoose.Types.ObjectId(data.roomId),
        userId: new mongoose.Types.ObjectId(data.userId),
    });
        await booking.save();
        return booking;
}

// Update booking with transaction
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

        const updated = await Booking.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        return updated;
}

// Delete booking
export async function deletebookingById(id: string): Promise<BookingDocument | null> {
    const deleted = await Booking.findByIdAndDelete(id).exec();
    if (!deleted) throw new Error("Booking not found");
    return deleted;
}



// Fetch all bookings with filtering, populate, sorting, and pagination
export async function getAllBookings(
  filters: {
    userId?: string;
    roomId?: string;
    startTime?: string;
    endTime?: string;
    bookingId?:string;
    page?: string;
    limit?: string;
    sortBy?: string;
    status?:string;
    sortOrder?: string;
  }
): Promise<{ data: BookingDocument[] }> {
  
  const query: any = {};

  // Filtering use cases
    if (filters.userId) {
        query.userId = new mongoose.Types.ObjectId(filters.userId);
    }
    if (filters.roomId) {
        query.roomId = new mongoose.Types.ObjectId(filters.roomId);
    }
    // const test = await Booking.find({ status: "cancelled" });
    // console.log(test);
    // console.log("Filters received:", filters);
    // console.log("Mongo query:", query);


  if (filters.status) {
      query.status = filters.status;
  }


    if (filters.bookingId) {
        query._id = new mongoose.Types.ObjectId(filters.bookingId);
    }

    if (filters.startTime || filters.endTime) {
        query.startTime = {};
        if (filters.startTime) {
        query.startTime.$gte = new Date(filters.startTime);
        }
        if (filters.endTime) {
        query.startTime.$lte = new Date(filters.endTime);
        }
    }

  // Pagination setup
  const page = parseInt(filters.page || "1", 10); // default page = 1
  const limit = parseInt(filters.limit || "10", 10); // default 10 docs per page
  const skip = (page - 1) * limit;//number of records to skiip
  //eg, if you are on page 3 it will show only 20-30(technically it is skipping the first 20 record acc to page number)

  // Sorting setup
  // const sortBy = filters.sortBy || "startTime"; // default sort by booking start time
  // const sortOrder = filters.sortOrder === "desc" ? -1 : 1; // default ascending

  // 🔹 Get total count (for frontend pagination info)
  // const total = await Booking.countDocuments(query);

  // // 🔹 Fetch bookings
  // const data = await Booking.find(query)
  //   .populate("userId", "name email role") // populate employee basic info
  //   .populate("roomId", "name capacity equipment") // populate room details
  //   .sort({ [sortBy]: sortOrder })
  //   .skip(skip)
  //   .limit(limit);

  const data=await Booking.find(query);

  return { data};
}

