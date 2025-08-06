import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

//exporting the mongoose instance from .env to use it in other files
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // optional: exit the process if connection fails
  }
};

export default connectDB

