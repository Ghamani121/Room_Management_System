import {Request,Response} from 'express';
import *as userService from './user.service';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

export async function login(req:Request,res:Response) {
    
}