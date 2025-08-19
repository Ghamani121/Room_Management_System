import { Router } from "express";
import * as bookingController from './booking.controller'
import * as bookingValidation from './booking.validation';
import { authenticateJWT, authorizeAdmin } from "../../../middlewares/authenticate.middleware";
import {validateObjectId} from '../../../utils/validateobjectid';
import {checkBookingUpdatePermission } from "../../../middlewares/bookingPermission";
import { checkSelfandAdminAccess } from "../../../utils/selfandadminAccess";

const router=Router();

router.post('/', authenticateJWT, bookingValidation.validateCreateBooking ,bookingController.createbooking);
router.get('/', authenticateJWT,authorizeAdmin, bookingController.getAllBookings);
router.put('/:id',authenticateJWT, validateObjectId("id"), checkBookingUpdatePermission, bookingValidation.validateUpdateBooking,  bookingController.updatebookingById);
router.delete('/:id', authenticateJWT,validateObjectId("id"), checkSelfandAdminAccess("booking"), bookingController.deletebookingById);

export default router;

//development logic:routes->controller->service->validation/


// //no id in the url sends bad request error
router.put('/', (req, res) => {res.status(400).json({ message: 'id is required' });});
router.delete('/', (req, res) => {res.status(400).json({ message: 'id is required' });});