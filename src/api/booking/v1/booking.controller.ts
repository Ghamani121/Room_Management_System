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





//res and req for updating booking in the db
export async function updatebookingById(req: Request, res: Response) {
  try {

    const id=req.params.id;
    if(!id)
        return res.status(400).json({messsage:'mising user id parameter in given url'});

    const updated = await bookingService.updateBooking(id, req.body);

    res.status(StatusCodes.OK).json(updated);

  } catch (error: any) {

    if (error.message === "Booking not found") {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: error.message,
        message: "Booking not found"
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
}
