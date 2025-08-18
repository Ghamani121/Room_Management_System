import {Request,Response,NextFunction} from 'express';
import Booking from "../models/booking";

//helper function for user to view/modify only his own details and admin can modify any
export function checkSelfandAdminAccess(resourceType: "user" | "booking" = "user") {

  return async (req: Request, res: Response, next: NextFunction) => {

    console.log("in self and admin")
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: no user found" });
    }

    let ownerId = req.params.id; // default for users

    if (resourceType === "booking") {
      // fetch booking ownerId
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      ownerId = booking.userId.toString();
      (req as any).booking = booking; // attach for controller use
    }

    if (user.role !== "admin" && user.id !== ownerId) {
      return res.status(403).json({ message: "Access denied" });
    }

    next(); // allow access
  };
}
