import { Schema, model, Document, Types } from 'mongoose';

export interface Attendee {
  name: string;
  email: string;
}

export interface BookingDocument extends Document {
  roomId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'cancelled';
  attendees: Attendee[];
}

const attendeeSchema = new Schema<Attendee>({
  name: { type: String, required: true },
  email: { type: String, required: true }
}, { _id: false });

const bookingSchema = new Schema<BookingDocument>({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  attendees: { type: [attendeeSchema], default: [],required:true }
 }, {timestamps:true});//automatically generates createdAt and UpdatedAt

const Booking = model<BookingDocument>('Booking', bookingSchema);

export default Booking;

