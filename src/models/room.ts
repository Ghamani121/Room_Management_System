// import { Schema, model, Document } from 'mongoose';

// export interface RoomDocument extends Document {
//   name:'Board Room' | 'Conference Room';
//   capacity: number;
//   equipment: string[];
// }

// const roomSchema = new Schema<RoomDocument>({
//   name: { 
//     type: String, 
//     enum: ['Board Room', 'Conference Room'],
//     required: true,
//     unique: true, 
//   },
//   capacity: { type: Number, required: true },
//   equipment: { type: [String], default: [] }
// }, {timestamps:true});

// roomSchema.index({ name: 1 }, { 
//   unique: true,
//   collation: { locale: 'en', strength: 2 }
// });

// const Room = model<RoomDocument>('Room', roomSchema);


// export default Room;

import { Schema, model, Document } from 'mongoose';

export interface RoomDocument extends Document {
  name: 'Board Room' | 'Conference Room';
  capacity: number;
  equipment: string[];
}

const roomSchema = new Schema<RoomDocument>({
  name: { 
    type: String, 
    enum: ['Board Room', 'Conference Room'],
    required: true,
    unique: true, 
    set: (value: string) => {
      const normalized = value.toLowerCase().trim();
      return normalized === 'board room' ? 'Board Room' : 'Conference Room';
    }
  },
  capacity: { type: Number, required: true },
  equipment: { type: [String], default: [] }
}, { timestamps: true });

// Create index with explicit name and collation
roomSchema.index({ name: 1 }, { 
    unique: true,
    name: 'name_case_insensitive',
    collation: {
        locale: 'en',
        strength: 2
    }
});

const Room = model<RoomDocument>('Room', roomSchema);

// Helper function to ensure indexes
async function ensureIndexes() {
    try {
        // Drop existing index if it exists
        await Room.collection.dropIndex('name_1').catch(() => {});
        // Create new index
        await Room.syncIndexes();
        console.log('Indexes synced successfully');
    } catch (err) {
        console.error('Error ensuring indexes:', err);
    }
}

// Call this during application startup
ensureIndexes();

export default Room;