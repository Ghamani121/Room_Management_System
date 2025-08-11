import mongoose from 'mongoose';
import { connectToDB } from '../../../config/db';

import Room from '../../../models/room';
import User from '../../../models/user';
import Booking from '../../../models/booking';

export async function seedData() {
  try {
    await connectToDB();

    // Clear old data
    await Booking.deleteMany({});
    await Room.deleteMany({});
    await User.deleteMany({});

    const rooms = await Room.insertMany([
      { name: 'Conference Room A', capacity: 10, equipment: ['Projector', 'Whiteboard'] },
      { name: 'Meeting Room B', capacity: 6, equipment: ['TV', 'Whiteboard'] },
      { name: 'Board Room C', capacity: 20, equipment: ['Projector', 'Speaker System', 'Mic'] }
    ]);

    const users = await User.insertMany([
      { name: 'Alice', email: 'alice@example.com', password: 'alice123', role: 'admin' },
      { name: 'Bob', email: 'bob@example.com', password: 'bob123', role: 'employee' },
      { name: 'Charlie', email: 'charlie@example.com', password: 'charlie123', role: 'employee' }
    ]);

    await Booking.insertMany([
      {
        roomId: rooms[0]!._id,
        userId: users[1]!._id,
        title: 'Marketing Sync-up',
        startTime: new Date('2025-08-07T10:00:00Z'),
        endTime: new Date('2025-08-07T11:00:00Z'),
        status: 'confirmed',
        attendees: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' }
        ]
      },
      {
        roomId: rooms[2]!._id,
        userId: users[0]!._id,
        title: 'Product Strategy Meeting',
        startTime: new Date('2025-08-08T14:00:00Z'),
        endTime: new Date('2025-08-08T16:00:00Z'),
        status: 'confirmed',
        attendees: [
          { name: 'Charlie', email: 'charlie@example.com' },
          { name: 'Bob', email: 'bob@example.com' }
        ]
      }
    ]);

    console.log('Populated database with initial data successfully.');
  } catch (error) {
    console.error('Failed to populate data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Db is disconnected.');
  }
}

