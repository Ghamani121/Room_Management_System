import { Types } from "mongoose";
import Booking, { BookingDocument,Attendee } from "../../../models/booking";
import Room from "../../../models/room";//to validate if roomid exists in db
import User from "../../../models/user";//to validate if userid exists in db
import {isValidObjectId} from '../../../utils/validateobjectid';


//create booking in db
//we are assigning all the parameters recevied to object data having given properties
export async function createbooking(data:Partial<BookingDocument>): Promise<BookingDocument>{

// validate roomId
    if (!data.roomId || !isValidObjectId(data.roomId)) {
        // console.log("entered sservice")
        throw new Error("Invalid room id");
    }

    //validate that the room id entered exists in the db
    const room = await Room.findById(data.roomId);
    if (!room) {
        throw new Error("Room not found");
    }

    
    // validate userId
    if (!data.userId || !isValidObjectId(data.userId)) {
        throw new Error("Invalid user id");
    }

    //validate that the user id entered exists in the db
    const user = await User.findById(data.userId);
    if (!user) {
        throw new Error("User not found");
    }

    // check for conflicting booking in the same room
    const conflict = await Booking.findOne({
        roomId: data.roomId,
        status: "confirmed", // only check against active bookings
        $or: [
        {
            startTime: { $lt: data.endTime },
            endTime: { $gt: data.startTime },
        },
        ],
    });

    if (conflict) {
        throw new Error("Room is booked");
    }

    //booking here is a model class that represents booking collection in db
    //we create a new instance of this model aka a new document
    const booking=new Booking(data);

    // we save the document into database which is returned to controller file
    return booking.save();
}





//buisness logic for updating the booking
export async function updateBooking(id: string, data: Partial<BookingDocument>): Promise<BookingDocument | null> {
  const existing = await Booking.findById(id);
  if (!existing) {
    throw new Error("Booking not found");
  }

  // Validate room if being changed
  if (data.roomId) {
    if (!isValidObjectId(data.roomId)) throw new Error("Invalid room id");
    const roomExists = await Room.findById(data.roomId);
    if (!roomExists) throw new Error("Room not found");
  }

  // Handle time updates
  if (data.startTime || data.endTime) {
    if (!data.startTime || !data.endTime) {
      throw new Error("Missing time field");
    }

    const newStart = data.startTime;
    const newEnd = data.endTime;
    const roomId = data.roomId || existing.roomId;

    const conflict = await Booking.findOne({
      roomId,
      status: "confirmed",
      _id: { $ne: id },
      $or: [
        { startTime: { $lt: newEnd }, endTime: { $gt: newStart } }
      ]
    });

    if (conflict) throw new Error("Room is booked");
  }

  return Booking.findByIdAndUpdate(id, data, { 
    new: true, 
    runValidators: true 
  });
}


//logic to delete a booking
export async function deletebookingById(id: string): Promise<BookingDocument | null> {
  const deleted = await Booking.findByIdAndDelete(id).exec();
  if (!deleted) {
    throw new Error("Booking not found");
  }
  return deleted;
}


//logic to fetch all bookings
export async function getAllBookings(): Promise<BookingDocument[]> {
  return Booking.find(); // Automatically returns empty array if none found
}
