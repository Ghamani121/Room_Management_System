import {Request,Response} from 'express';
import * as roomService from './room.service';


//logic to create room
export async function createroom(req:Request,res:Response)
{
    try{
        //go to roomservice file to create room in db
        const newroom=await roomService.createroom(req.body);
        //respond with status code and room details
        res.status(201).json(newroom);
    }
    catch(error:any)
    {
        console.error(error);
        if(error.code==11000) //duplicate room number
            return res.status(409).json({message:'room already exists'});
        res.status(500).json({message:'server error'});
    }
};