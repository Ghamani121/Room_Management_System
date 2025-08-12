import { Router } from "express";
import * as roomController from './room.controller'
import * as roomValidation from './room.validation';

const router=Router();

router.post('/',  roomValidation.createroomValidation , roomController.createroom);
router.get('/',  roomController.getroom);
router.get('/:id',  roomController.getroomById);
router.put('/:id',  roomValidation.updateroomValidation,  roomController.updateroomById);
router.delete('/:id',  roomValidation.deleteroomValidation,  roomController.deleteroomById);

export default router;

//development logic:routes->controller->service->validation