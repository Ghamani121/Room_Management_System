import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

const JWT_SECRET = process.env.JWT_SECRET as string;

//describes what the jwt payload will contain

interface JwtPayload {
  id: string;
  role: "admin" | "employee";
}

//authentication function to check
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authorization header missing or malformed" });
  }
  const token = authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
try {
        const decoded = jwt.verify(token!, JWT_SECRET) as JwtPayload;

    // Optional: extra runtime check
    if (!decoded.id || !decoded.role) {
      throw new Error("Invalid token payload");
    }

    (req as any).user = decoded; // now TS knows req.user exists

    next();
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid or expired token",
    });
  }
}

// // src/middlewares/middleware.auth.ts
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { StatusCodes } from "http-status-codes";
// import type { AuthenticatedRequest } from "../types/express/index";

// const JWT_SECRET = process.env.JWT_SECRET as string;

// // Define the shape of the token payload
// interface JwtPayload {
//   id: string;
//   role: "admin" | "employee";
// }

// // Middleware to protect routes
// export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {

//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(StatusCodes.UNAUTHORIZED).json({
//       message: "Authorization header missing or malformed",
//     });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     //write error for no tokne////////////////

//     // Verify the token and extract payload
//     const decoded = jwt.verify(token!, JWT_SECRET) as JwtPayload;

//     // Runtime check: ensure payload contains required fields
//     if (!decoded.id || !decoded.role) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({
//         message: "Invalid token payload",
//       });
//     }

//     // Attach user info to request object
//     req.user = decoded;

//     // Pass control to next middleware or route
//     next();
//   } catch (err) {
//     return res.status(StatusCodes.UNAUTHORIZED).json({message: "Invalid or expired token",});
//   }
// }
