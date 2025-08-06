import express from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//middleware to handle CORS and JSON requests
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
.connect(process.env.DATABASE_URL as string)
.then(() => {console.log('Connected to MongoDB');})
.catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.get('/', (_req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});