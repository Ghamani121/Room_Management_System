import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { loginService, logoutService } from './auth.service';

export async function login(req: Request, res: Response) {
    try {
        //we are email and password from request body to two constant variables
        const { email, password } = req.body;

        const result = await loginService(email, password);
        return res.status(result.status).json(result.data);

    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "server error" });
    }
}

export async function logout(req: Request, res: Response) {
    const result = await logoutService();
    return res.status(result.status).json(result.data);
}
