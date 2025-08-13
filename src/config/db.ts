import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from "../models/user";

dotenv.config();

export async function connectToDB() {
  try {
    // console.log('hi')
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log('Connected to MongoDB');
    await User.syncIndexes();
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}
