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

// // Schema for updating a user (all fields optional)
// const updateUserSchema = Joi.object({
//   name: Joi.string().min(3).max(50),
//   email: Joi.string().email(),
//   password: Joi.string().min(6),
//   role: Joi.string().valid('admin', 'employee')
// }).min(1); // at least one field required

// Middleware for validation
export function createUserValidation(req: Request, res: Response, next: NextFunction) {
  const { error } = createUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({  message: error?.details?.[0]?.message || 'Invalid request data' });
  }
  next();
}

// export function updateUserValidation(req: Request, res: Response, next: NextFunction) {
//   const { error } = updateUserSchema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ message: error.details[0].message });
//   }
//   next();
// }
