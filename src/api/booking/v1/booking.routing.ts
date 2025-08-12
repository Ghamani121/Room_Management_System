import { Router } from "express";
import * as bookingController from './booking.controller'
import * as bookingValidation from './booking.validation';

const router=Router();

// router.post('/',  bookingValidation.createbookingValidation  ,bookingController.createbooking);
// router.get('/',  bookingController.getbooking);
// router.get('/:id',  bookingController.getbookingById);
// router.put('/:id',  bookingValidation.updatebookingValidation,  bookingController.updatebookingById);
// router.delete('/:id',  bookingValidation.deletebookingValidation,  bookingController.deletebookingById);

export default router;

//development logic:routes->controller->service->validation