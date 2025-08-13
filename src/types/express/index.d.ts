//d: declaration fo express types

// import { Request } from "express";

// export interface AuthenticatedRequest extends Request {
//   user?: {
//     id: string;
//     role: "admin" | "employee";
//   };
// }


import { JwtPayload } from "../middlewares/middleware.auth"; 

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}
