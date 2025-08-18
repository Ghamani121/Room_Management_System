import {Request,Response} from 'express';
import * as bookingService from './booking.service';
import { StatusCodes } from 'http-status-codes';


//logic to create booking
export async function createbooking(req:Request,res:Response)
{
    try{
        //go to bookingservice file to create booking in db
        const booking=await bookingService.createbooking(req.body);
        //respond with status code and booking details
        res.status(StatusCodes.CREATED).json(booking);
    }
    catch(error:any)
    {
        if (error.message === "Invalid room id") {
            // console.log("entered controller")
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: error.message,
                message: "The provided roomId is not valid"
            });
        }

        if (error.message === "Invalid user id") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: error.message,
                message: "The provided userId is not valid"
            });
        }

        if (error.message === "Room not found") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: error.message,
                message: "The provided roomId is not valid"
            });
        }

        if (error.message === "User not found") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: error.message,
                message: "The requested user does not exist"
            });
        }

        if (error.message === "Room is booked") {
            return res.status(StatusCodes.CONFLICT).json({
                error: error.message,
                message: "Room already booked for the requested time slot"
            });
        }     
           
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }    
};

// //logic to get all rooms
// export async function getroom(req:Request,res:Response) {
//     try{
//         //first get the info from service layer to what is present in room collection
//         const room=await roomService.getroom();

//         //check if the extracted data has at least one room 
//         if(!room || room.length==0)
//             return res.status(200).json({message:'no rooms are found in the database'});

//         //now we know room exists, so send the response
//         res.json(room);
//     }catch(error)
//     {
//         console.error(error);
//         res.status(500).json({message:'server error'});
//     }
// }

// //logic to get room using id
// export async function getroomById(req:Request,res:Response)
// {
//     try{
//         //takes the id from the path given and checks if the id exists in the url
//         const id=req.params.id;
//         if(!id) return res.status(400).json({messsage:'mising room id parameter in given url'});

//         //calls the service layer to fetch rooms acc to the id extracted
//         const room=await roomService.getroomById(id);
//         //checks if id exists in the db
//         if(!room) return res.status(404).json({message:'room with given id not found'});
//         res.json(room);
//     }
//     catch(error){
//         console.error(error);
//         res.status(500).json({message:'server error'});
//     }
// }

// //logic to update room
// export async function updateroomById(req:Request, res:Response)
// {
//     try{
//         const id=req.params.id;
//         //id not given in the url
//         if(!id) 
//             return res.status(400).json({messsage:'mising room id parameter in given url'});

//         //convert room name to lowercase and required case before saving
//         const roomName=req.body.name?.toLowerCase();
//         if(roomName==='board room') req.body.name='Board Room';
//         else req.body.name='Conference Room';


//         //calls the service layer to fetch rooms acc to the id extracted
//         const updatedroom=await roomService.updateroomById(id,req.body);

//         //checks if id exists in the db
//         if(!updatedroom) return res.status(404).json({message:'room with given id not found'});

//         res.status(200).json(updatedroom);
//     }
//     catch(error:any){
//         console.error(error);

//         if(error.code==11000)
//             return res.status(409).json({message:'room name already exists'});

//         res.status(500).json({message:'server error'});
//     }
// }



// //logic to delete room by id
// export async function deleteroomById(req:Request, res:Response) 
// {
//     try{
//         const id=req.params.id;
//         //id not given in the url
//         if(!id) 
//             return res.status(400).json({messsage:'Missing room ID parameter in given URL'});

//         const deletedroom=await roomService.deleteroomById(id);

//         if(!deletedroom)
//             return res.status(404).json({message:'room with given id not found'});

//         res.status(StatusCodes.NO_CONTENT).send();
//     }
//     catch(error){
//         console.error(error);
//         res.status(500).json({message:'server error'});
//     }
// }
