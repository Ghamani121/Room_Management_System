import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { loginService, logoutService,changePasswordService } from './auth.service';


//manage http req and res for login api
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


//manage http req and res for logout api
export async function logout(req: Request, res: Response) {
    const result = await logoutService();
    return res.status(result.status).json(result.data);
}



//manage http req and res for change password api
export async function changePassword(req: Request, res: Response) {
  const { userId, email, oldPassword, newPassword } = req.body;

  try {
    const result = await changePasswordService(userId, email, oldPassword, newPassword);
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
