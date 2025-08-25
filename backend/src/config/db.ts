import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from "../models/user";
import Room from '../models/room';

dotenv.config();

export async function connectToDB() {
  try {
    // console.log('hi')
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log('Connected to MongoDB');

    //ensure the unique indexes are being created
    try {
      await Room.syncIndexes(); 
      await User.syncIndexes();
      console.log('Indexes synced');
    } catch (err) {
      console.error('Error syncing indexes:', err);
    }

  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}
