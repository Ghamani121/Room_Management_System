import {Request,Response} from 'express';
import * as roomService from './room.service';
import { StatusCodes } from 'http-status-codes';


//logic to create room
export async function createroom(req:Request,res:Response)
{
    try{
        //convert room name to lowercase and required case before saving
        const roomName = req.body.name?.toLowerCase().trim();
        if (roomName === 'board room') {
            req.body.name = 'Board Room';
        } else if (roomName === 'conference room') {
            req.body.name = 'Conference Room';
        }

        // const existingRoom = await roomService.findRoomByName(req.body.name);
        // if (existingRoom) {
        //     return res.status(409).json({message: 'Room name already exists'});
        // }

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

//logic to get all rooms
export async function getroom(req:Request,res:Response) {
    try{
        //first get the info from service layer to what is present in room collection
        const room=await roomService.getroom();

        //check if the extracted data has at least one room 
        if(!room || room.length==0)
            return res.status(200).json({message:'no rooms are found in the database'});

        //now we know room exists, so send the response
        res.json(room);
    }catch(error)
    {
        console.error(error);
        res.status(500).json({message:'server error'});
    }
}

//logic to get room using id
export async function getroomById(req:Request,res:Response)
{
    try{
        //takes the id from the path given and checks if the id exists in the url
        const id=req.params.id;
        if(!id) return res.status(400).json({messsage:'mising room id parameter in given url'});

        //calls the service layer to fetch rooms acc to the id extracted
        const room=await roomService.getroomById(id);
        //checks if id exists in the db
        if(!room) return res.status(404).json({message:'room with given id not found'});
        res.json(room);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:'server error'});
    }
}

//logic to update room
export async function updateroomById(req:Request, res:Response)
{
    try{
        const id=req.params.id;
        //id not given in the url
        if(!id) 
            return res.status(400).json({messsage:'mising room id parameter in given url'});

        //convert room name to lowercase and required case before saving
        const roomName=req.body.name?.toLowerCase();
        if(roomName==='board name') req.body.name='Board Room';
        else req.body.name='Conference Room';


        //calls the service layer to fetch rooms acc to the id extracted
        const updatedroom=await roomService.updateroomById(id,req.body);

        //checks if id exists in the db
        if(!updatedroom) return res.status(404).json({message:'room with given id not found'});

        res.status(200).json(updatedroom);
    }
    catch(error:any){
        console.error(error);

        if(error.code==11000)
            return res.status(409).json({message:'room name already exists'});

        res.status(500).json({message:'server error'});
    }
}



//logic to delete room by id
export async function deleteroomById(req:Request, res:Response) 
{
    try{
        const id=req.params.id;
        //id not given in the url
        if(!id) 
            return res.status(400).json({messsage:'Missing room ID parameter in given URL'});

        const deletedroom=await roomService.deleteroomById(id);

        if(!deletedroom)
            return res.status(404).json({message:'room with given id not found'});

        res.status(StatusCodes.CREATED).send();
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:'server error'});
    }
}
