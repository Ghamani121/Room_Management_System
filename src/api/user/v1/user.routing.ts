import { Router } from "express";
import * as userController from './user.controller'
import * as userValidation from './user.validation';
import {validateObjectId} from '../../../utils/validateobjectid';
import { authenticateJWT,authorizeAdmin } from "../../../middlewares/authenticate.middleware";
import { checkSelfandAdminAccess } from "../../../utils/selfandadminAccess";


const router=Router();

router.post('/user', authenticateJWT, authorizeAdmin, userValidation.createUserValidation  ,userController.createUser);


router.get('/users', authenticateJWT, authorizeAdmin, userController.getUser);


// router.get('/:id',authenticateJWT, validateObjectId("id"),checkSelfandAdminAccess, userController.getUserById);
router.get('/:id',authenticateJWT, validateObjectId("id"),checkSelfandAdminAccess("user"), userController.getUserById);

router.put('/:id',authenticateJWT, validateObjectId("id"),checkSelfandAdminAccess("user"), userValidation.updateUserValidation,  userController.updateUserById);


router.delete('/:id',authenticateJWT, authorizeAdmin, validateObjectId("id"), userValidation.deleteUserValidation,  userController.deleteUserById);


//no id in the url sends bad request error
router.put('/', (req, res) => {res.status(400).json({ message: 'id is required' });});
router.delete('/', (req, res) => {res.status(400).json({ message: 'id is required' });});

export default router;
