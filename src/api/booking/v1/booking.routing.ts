import { Router } from "express";
import * as bookingController from './booking.controller'
import * as bookingValidation from './booking.validation';
import {validateObjectId} from '../../../middlewares/validateobjectid';

const router=Router();

// router.post('/',  bookingValidation.createbookingValidation  ,bookingController.createbooking);


// router.get('/',  bookingController.getbooking);
// router.get('/:id', validateObjectId("id"),  bookingController.getbookingById);

// //no id in the url sends bad request error
// router.put('/', (req, res) => {res.status(400).json({ message: 'id is required' });});
// router.put('/:id', validateObjectId("id"), bookingValidation.updatebookingValidation,  bookingController.updatebookingById);

// router.delete('/', (req, res) => {res.status(400).json({ message: 'id is required' });});
// router.delete('/:id', validateObjectId("id"), bookingValidation.deletebookingValidation,  bookingController.deletebookingById);

export default router;

//development logic:routes->controller->service->validation