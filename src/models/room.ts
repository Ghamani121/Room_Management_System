import { Schema, model, Document } from 'mongoose';

export interface RoomDocument extends Document {
  name:'Board Room' | 'Conference Room';
  capacity: number;
  equipment: string[];
}

const roomSchema = new Schema<RoomDocument>({
  name: { 
    type: String, 
    enum: ['Board Room', 'Conference Room'],
    required: true 
  },
  capacity: { type: Number, required: true },
  equipment: { type: [String], default: [] }
}, {timestamps:true});

const Room = model<RoomDocument>('Room', roomSchema);

export default Room;
///////////