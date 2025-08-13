import { Router } from "express";
import * as userController from './user.controller'
import * as userValidation from './user.validation';
import {validateObjectId} from '../../../middlewares/middleware.validateobjectid';
import { authenticateJWT,authorizeAdmin } from "../../../middlewares/authenticate.middleware";
import { checkEmployeeAccessMiddleware } from "./helper/employeeAccess";


const router=Router();

router.post('/', authenticateJWT, authorizeAdmin, userValidation.createUserValidation  ,userController.createUser);


router.get('/', authenticateJWT, authorizeAdmin, userController.getUser);


// router.get('/:id',authenticateJWT, validateObjectId("id"),checkEmployeeAccessMiddleware, userController.getUserById);
router.get('/:id',authenticateJWT, validateObjectId("id"),checkEmployeeAccessMiddleware(), userController.getUserById);

router.put('/:id',authenticateJWT, validateObjectId("id"),checkEmployeeAccessMiddleware(), userValidation.updateUserValidation,  userController.updateUserById);


router.delete('/:id',authenticateJWT, authorizeAdmin, validateObjectId("id"), userValidation.deleteUserValidation,  userController.deleteUserById);


//no id in the url sends bad request error
router.put('/', (req, res) => {res.status(400).json({ message: 'id is required' });});
router.delete('/', (req, res) => {res.status(400).json({ message: 'id is required' });});

export default router;
