// src/modules/user/user.validation.ts
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Schema for creating a user
const createUserSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'employee').required()
});

// Middleware for validation
export function createUserValidation(req: Request, res: Response, next: NextFunction) {
  const { error } = createUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({  message: error?.details?.[0]?.message || 'Invalid request data' });
  }
  next();
}



// Schema for updating a user (all fields optional)
const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string().valid('admin', 'employee')
}).min(1); // at least one field required


//validation middleware to check 
export function updateUserValidation(req: Request, res: Response, next: NextFunction) {
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({  message: error?.details?.[0]?.message || 'Invalid request data' });
  }
  next();
}


// schema and middleware for checking object id format
const deleteUserSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message('User ID must be a valid 24-character hexadecimal string')
        .required()
        .messages({
            'any.required': 'User ID parameter is required',
            'string.pattern.base': 'User ID must be a valid 24-character hexadecimal string',
            'string.empty': 'User ID cannot be empty'
        })
});

export function deleteUserValidation(req: Request, res: Response, next: NextFunction) {
    const { error } = deleteUserSchema.validate(req.params);
    if (error) {
        return res.status(400).json({
            message: error?.details?.[0]?.message || 'Invalid user ID'
        });
    }
    next();
}
