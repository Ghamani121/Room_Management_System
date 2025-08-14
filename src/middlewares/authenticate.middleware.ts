import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

const JWT_SECRET = process.env.JWT_SECRET as string;

//describes what the jwt payload we receive will look like
interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
}

//authentication function to check
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {

  const authHeader = req.headers.authorization;

  //check if they have entered the token in the header tab in given format
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) 
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authorization header missing or malformed" });

  //extract the token, everything after the bearer+space
  const token = authHeader.split(" ")[1];

  try {
        //verify the token using the secret key
        const decoded = jwt.verify(token!, JWT_SECRET) as JwtPayload;

        //store the decoded payload on the request object so we can use it in other routes
        (req as any).user = decoded;

        next();
    } 
    catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid or expired token",
      });
    }
}

// --------- NEW: Admin Authorization Middleware ----------
export function authorizeAdmin(req: Request, res: Response, next: NextFunction) {

  //retrieves the payload that was set in authentication function
  const user = (req as any).user as JwtPayload;

  //check if user object exists and that role of user is admin
  if (!user || user.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Admin access only" });
  }
  next();
}