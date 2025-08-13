import {Request,Response} from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import User, { UserDocument } from "../../../models/user";


const JWT_SECRET = process.env.JWT_SECRET as string;

export async function login(req:Request,res:Response) {
    try{
        //we are email and password from request body to two constant variables
        const{email,password}=req.body;

        //find the email in User db
        const user = await User.findOne<UserDocument>({ email }).select("+password");//select to include the password while returning, its set to false in db

        //if user is empty, then the email does't exist
        if(!user)
            return res.status(StatusCodes.UNAUTHORIZED).json({message:"Invalid email"});

        //use user constant to check if the hashed password matches the given password
        const isPasswordValid= await bcrypt.compare(password,user.password!);//!==assures ts that our user password in db cant be null

        if(!isPasswordValid) 
            return res.status(StatusCodes.UNAUTHORIZED).json({message:"invalid password"});

        const id = user._id.toString();

        //generate jwt
        const token=jwt.sign(
            {id,role:user.role},//data inside the token is called payload
            //convert object id to string because jwt cant store object id
            JWT_SECRET,
            {expiresIn: "30d"}
        );

        res.status(StatusCodes.OK).json({message:"Login Successful",token});

    }catch(error)
        {
            console.error(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:"server error" });
        }
}


export async function logout(req:Request,res:Response)
{
    //you dont need to delete the token, as server doesn't store it
    //frontend deletes it
    return res.status(StatusCodes.OK).json({message:"logged out successfully"});
}