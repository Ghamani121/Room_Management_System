import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export function validateObjectId(paramName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const schema = Joi.string()
            .length(24)
            .hex()
            .required();

        const { error } = schema.validate(req.params[paramName]);

        if (error) {
            return res.status(400).json({ message: `Invalid ${paramName}: ${error.message}` });
        }
        next();
    };
}

