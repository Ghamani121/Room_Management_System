import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

//schema for creating room expects an object with 3 properties
const createroomSchema=Joi.object({
    name: Joi.string().lowercase().valid('board room','conference room').required(),
    capacity: Joi.number().integer().min(1).max(20).required(),
    equipment: Joi.array().items(Joi.string()).required()
});

//req and res are express objects
export function createroomValidation(req:Request,res:Response,next: NextFunction)
{
    //if validation passes, error will be undefined or null
    const{error}= createroomSchema.validate(req.body);
    if(error) 
        //message is taken from first validation error detail
        return res.status(400).json({message: error?.details?.[0]?.message || 'invalid request data'});
    next();
}


// Schema for updating a room (all fields optional)
const updateroomSchema = Joi.object({
    name: Joi.string().lowercase().valid('board room','conference room'),
    capacity: Joi.number().integer().min(1).max(20),
    equipment: Joi.array().items(Joi.string())
}).min(1); // at least one field required


//validation middleware to check 
export function updateroomValidation(req: Request, res: Response, next: NextFunction) {
  const { error } = updateroomSchema.validate(req.body);
  if (error) {
    return res.status(400).json({  message: error?.details?.[0]?.message || 'Invalid request data' });
  }
  next();
}


// schema and middleware for checking object id format
const deleteroomSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message('room ID must be a valid 24-character hexadecimal string')
        .required()
        .messages({
            'any.required': 'room ID parameter is required',
            'string.pattern.base': 'room ID must be a valid 24-character hexadecimal string',
            'string.empty': 'room ID cannot be empty'
        })
});

export function deleteroomValidation(req: Request, res: Response, next: NextFunction) {
    const { error } = deleteroomSchema.validate(req.params);
    if (error) {
        return res.status(400).json({
            message: error?.details?.[0]?.message || 'Invalid room ID'
        });
    }
    next();
}