import express from 'express';
import http from 'http';
import { connectToDB } from '../config/db';
import userRoutes from './user/v1/user.routing';
import roomRoutes from './room/v1/room.routing';
import bookingRoutes from './booking/v1/booking.routing';
import authRoutes from './user/v1/auth.routing';

const app=express();

//middleware to parse json
app.use(express.json());

//routes
app.use('/api/users/v1',userRoutes);
app.use('/api/rooms/v1',roomRoutes);
app.use('/api/bookings/v1',bookingRoutes);
app.use('/api/auth/v1',authRoutes);

//starting the server
const PORT=process.env.PORT || 8080;
const server = http.createServer(app);

export async function startServer() {
  try {
    await connectToDB();
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// test if the server is working
app.get('/api/room/v/',(req,res)=>{
    res.status(200).json({message:'server is up and running'});
});






