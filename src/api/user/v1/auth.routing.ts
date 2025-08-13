import { Router } from "express";
import * as authController from './auth.controller'
import * as authValidation from './auth.validation';
import {validateObjectId} from '../../../middlewares/validateobjectid';

const router=Router();

router.post('/',authController.login)

export default router;