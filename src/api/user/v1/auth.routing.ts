import { Router } from "express";
import * as authController from './auth.controller'
import {validateObjectId} from '../../../utils/validateobjectid';

const router=Router();

router.post('/login',authController.login);
router.post('/logout',authController.logout);

export default router;