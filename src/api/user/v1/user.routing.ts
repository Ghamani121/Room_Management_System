import { Router } from "express";
import * as userController from './user.controller'
import {createUserValidation} from './user.validation';

const router=Router();

router.get('/:id',userController.getUser);
router.post('/',createUserValidation,userController.createUser);

export default router;
