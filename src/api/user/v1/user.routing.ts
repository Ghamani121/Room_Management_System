import { Router } from "express";
import * as userController from './user.controller'
import * as userValidation from './user.validation';

const router=Router();

router.post('/',  userValidation.createUserValidation  ,userController.createUser);
router.get('/',  userController.getUser);
router.get('/:id',  userController.getUserById);
router.put('/:id',  userValidation.updateUserValidation,  userController.updateUserById);
router.delete('/:id',  userValidation.deleteUserValidation,  userController.deleteUserById);

export default router;
