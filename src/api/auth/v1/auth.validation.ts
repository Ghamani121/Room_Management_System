// src/validations/auth.validation.ts
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";



//validation for login
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export function validateLogin(req: Request, res: Response, next: NextFunction) {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: error?.details?.[0]?.message });
    }
    next();
}



//validation for change password
const changePasswordSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
    "string.empty": "User ID cannot be empty",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be valid",
  }),
  oldPassword: Joi.string().min(6).required().messages({
    "any.required": "Old password is required",
    "string.min": "Old password must be at least 6 characters",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "any.required": "New password is required",
    "string.min": "New password must be at least 6 characters",
  }),
});

// Middleware for validation
export function validateChangePassword(req: Request, res: Response, next: NextFunction) {
  const { error } = changePasswordSchema.validate(req.body, { abortEarly: false });

  if (error) {
    // Collect all errors
    const errors = error.details.map((d) => ({
      field: d.path[0],
      message: d.message,
    }));
    return res.status(400).json({ error: "ValidationError", message: errors });
  }

  next();
}
