import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

export async function connectToDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log('✅ Connected to MongoDB');
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}
