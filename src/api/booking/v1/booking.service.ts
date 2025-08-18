import { Types } from "mongoose";
import Booking, { BookingDocument,Attendee } from "../../../models/booking";
import Room from "../../../models/room";//to validate if roomid exists in db
import User from "../../../models/user";//to validate if userid exists in db
import {isValidObjectId} from '../../../utils/validateobjectid';


//create booking in db
//we are assigning all the parameters recevied to object data having given properties
export async function createbooking(data:{
  roomId: Types.ObjectId | string ;
  userId: Types.ObjectId | string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'cancelled' | 'pending';
  attendees: Attendee[];
}): Promise<BookingDocument>{

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

  // Conflict check if startTime & endTime updated
if (data.startTime || data.endTime) {
  const newStart = data.startTime || existing.startTime;
  const newEnd = data.endTime || existing.endTime;

  const conflict = await Booking.findOne({
    roomId: existing.roomId,
    status: "confirmed",
    _id: { $ne: id },
    startTime: { $lt: newEnd },
    endTime: { $gt: newStart }
  });

  if (conflict) throw new Error("Room is booked");
}

  return Booking.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}
