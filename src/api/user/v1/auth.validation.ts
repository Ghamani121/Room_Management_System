// src/validations/auth.validation.ts
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

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
