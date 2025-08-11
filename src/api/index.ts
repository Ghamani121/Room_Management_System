import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectToDB } from '../config/db';

const app=express();

app.use(cors({
    credentials:true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());


app.get('/api/test',(req,res)=>{
    res.status(200).json({message:'server is up and running'});
});

const PORT=process.env.PORT || 8080;

const server = http.createServer(app);

export const startServer = () => {
    server.listen(PORT,()=>{
        console.log(`Server is running on http://localhost:${PORT}/`);
    });
};

connectToDB();

