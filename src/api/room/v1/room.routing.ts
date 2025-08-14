import { Router } from "express";
import * as roomController from './room.controller'
import * as roomValidation from './room.validation';
import {validateObjectId} from '../../../utils/validateobjectid';

const router=Router();

router.post('/',  roomValidation.createroomValidation  ,roomController.createroom);


router.get('/',  roomController.getroom);
router.get('/:id', validateObjectId("id"),  roomController.getroomById);

//no id in the url sends bad request error
router.put('/', (req, res) => {res.status(400).json({ message: 'id is required' });});
router.put('/:id', validateObjectId("id"), roomValidation.updateroomValidation,  roomController.updateroomById);

router.delete('/', (req, res) => {res.status(400).json({ message: 'id is required' });});
router.delete('/:id', validateObjectId("id"), roomValidation.deleteroomValidation,  roomController.deleteroomById);

export default router;

//development logic:routes->controller->service->validation