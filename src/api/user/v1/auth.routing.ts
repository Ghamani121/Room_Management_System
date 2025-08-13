import { Router } from "express";
import * as authController from './auth.controller'
import * as authValidation from './auth.validation';
import {validateObjectId} from '../../../middlewares/validateobjectid';

const router=Router();

router.post('/login',authController.login);
router.post('/logout',authController.logout);

export default router;