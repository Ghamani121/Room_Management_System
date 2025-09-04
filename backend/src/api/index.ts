import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { connectToDB } from '../config/db';
import userRoutes from './user/v1/user.routing';
import roomRoutes from './room/v1/room.routing';
import bookingRoutes from './booking/v1/booking.routing';
import authRoutes from './auth/v1/auth.routing';

dotenv.config(); // load .env

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users/v1', userRoutes);
app.use('/api/rooms/v1', roomRoutes);
app.use('/api/bookings/v1', bookingRoutes);
app.use('/api/auth/v1', authRoutes);

// Test endpoint
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'server is up and running' });
});
// /config endpoint for frontend
app.get("/config", (req, res) => {
  const apiUrl = process.env.API_URL || `http://localhost:${PORT}/api`;
  console.log("Returning API_URL:", apiUrl);
  res.json({ baseUrl: apiUrl });
});


// Start server
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

export async function startServer() {
  try {
    await connectToDB();
    server.listen({
      port: PORT,
      host: '0.0.0.0',
    }, () => {
      console.log(`Server running on http://0.0.0.0:${PORT}/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

export default app;
