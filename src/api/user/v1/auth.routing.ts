import { Router } from "express";
import * as authController from './auth.controller'
import * as authValidation from './auth.validation';

const router=Router();

router.post('/login',authValidation.validateLogin,authController.login);
router.post('/logout',authController.logout);

export default router;