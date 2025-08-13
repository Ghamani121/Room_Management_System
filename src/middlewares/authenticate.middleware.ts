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
      message: "Invalid token",
    });
  }
}

// --------- NEW: Admin Authorization Middleware ----------
export function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as JwtPayload;
  if (!user || user.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Admin access only" });
  }
  next();
}