import { Schema, model, Document } from 'mongoose';

export interface RoomDocument extends Document {
  name: string;
  capacity: number;
  equipment: string[];
}

const roomSchema = new Schema<RoomDocument>({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  equipment: { type: [String], default: [] }
});

const Room = model<RoomDocument>('Room', roomSchema);

export default Room;
