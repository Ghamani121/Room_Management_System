import { Router } from "express";
import * as userController from './user.controller'
import * as userValidation from './user.validation';
import {validateObjectId} from '../../../middlewares/middleware.validateobjectid';
import { authenticateJWT } from "../../../middlewares/middleware.auth";

const router=Router();

router.post('/',  userValidation.createUserValidation  ,userController.createUser);


router.get('/', authenticateJWT, userController.getUser);
router.get('/:id',authenticateJWT, validateObjectId("id"),  userController.getUserById);

//no id in the url sends bad request error
router.put('/', (req, res) => {res.status(400).json({ message: 'id is required' });});
router.put('/:id', validateObjectId("id"), userValidation.updateUserValidation,  userController.updateUserById);

router.delete('/', (req, res) => {res.status(400).json({ message: 'id is required' });});
router.delete('/:id', validateObjectId("id"), userValidation.deleteUserValidation,  userController.deleteUserById);

export default router;
