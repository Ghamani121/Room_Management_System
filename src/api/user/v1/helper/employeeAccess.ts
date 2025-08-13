import {Request,Response,NextFunction} from 'express';

//helper function for user to view/modigy only his own details
export function checkEmployeeAccessMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const userId = req.params.id;

    // console.log("Middleware check: user =", user, "requested id =", userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: no user found" });
    }

    if (user.role !== "admin" && user.id !== String(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next(); // IMPORTANT: call next() when access is allowed
  };
}
