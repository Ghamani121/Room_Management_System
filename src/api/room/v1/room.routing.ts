import { Router } from "express";
import * as roomController from './room.controller'
import * as roomValidation from './room.validation';
import {validateObjectId} from '../../../utils/validateobjectid';
import { authenticateJWT, authorizeAdmin } from "../../../middlewares/authenticate.middleware";

const router=Router();

router.post('/', authenticateJWT, authorizeAdmin, roomValidation.createroomValidation  ,roomController.createroom);
router.get('/', authenticateJWT, roomController.getroom);
router.get('/:id', authenticateJWT, validateObjectId("id"),  roomController.getroomById);
router.put('/:id', authenticateJWT, authorizeAdmin, validateObjectId("id"), roomValidation.updateroomValidation,  roomController.updateroomById);
router.delete('/:id', authenticateJWT, authorizeAdmin, validateObjectId("id"), roomValidation.deleteroomValidation,  roomController.deleteroomById);

export default router;

//development logic:routes->controller->service->validation


//no id in the url sends bad request error
router.put('/', (req, res) => {res.status(400).json({ message: 'id is required' });});
router.delete('/', (req, res) => {res.status(400).json({ message: 'id is required' });});