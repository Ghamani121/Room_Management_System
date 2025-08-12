import express from 'express';
import http from 'http';
import { connectToDB } from '../config/db';
import userRoutes from './user/v1/user.routing';

const app=express();

//middleware to parse json
app.use(express.json());

//routes
app.get('/api/test',(req,res)=>{
    res.status(200).json({message:'server is up and running'});
});

//user routes
app.use('/api/v1/users',userRoutes);

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






