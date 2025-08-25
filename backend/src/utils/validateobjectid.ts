import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Types } from "mongoose";

// Route Validation Middleware
export function validateObjectId(paramName: string | Types.ObjectId) {

    return (req: Request, res: Response, next: NextFunction) => {

        //convert object id to string
        const idToValidate = typeof paramName === 'string' 
            ? req.params[paramName] 
            : paramName.toString();

        //schema for it to match
        const schema = Joi.string()
            .length(24)
            .hex()
            .required();

        //checking if the schema is correct for given id
        const { error } = schema.validate(idToValidate);

        if (error) {
            return res.status(400).json({ message: `Invalid ${paramName}: ${error.message}` });
        }
        next();
    };
}

// Direct Validation Function 
export function isValidObjectId(id: string | Types.ObjectId): boolean {
    if (!id) return false;
    
    const idString = id instanceof Types.ObjectId ? id.toString() : id;
    const schema = Joi.string().length(24).hex().required();
    return !schema.validate(idString).error;
}

// Keep your original Joi validation logic
const schema = Joi.string().length(24).hex().required();
