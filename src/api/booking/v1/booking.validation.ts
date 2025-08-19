import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const OFFICE_START = 8;  // 8 AM
const OFFICE_END = 20;   // 8 PM
const MAX_DURATION_HOURS = 12;



//schema and validation fucntion for creating booking
const createBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  userId: Joi.string().required(),
  title: Joi.string().required(),

  startTime: Joi.date().required().custom((value, helpers) => {
    const now = new Date();
    const start = new Date(value);

    // Check not in the past
    if (start < now) {
      return helpers.error("any.invalid", { message: "Start time cannot be in the past" });
    }

    const hour = start.getHours();

    // Check office hours
    if (hour < OFFICE_START || hour >= OFFICE_END) {
      return helpers.error("any.invalid", { message: `Start time must be within office hours ${OFFICE_START}:00 - ${OFFICE_END}:00`});
    }

    return value;
  }).messages({"any.invalid":"{{#message}}"}),

  endTime: Joi.date().greater(Joi.ref("startTime")).required().custom((value, helpers) => {
    const start = new Date(helpers.state.ancestors[0].startTime);
    const end = new Date(value);

    const hour = end.getHours();

    // Check office hours
    if (hour < OFFICE_START || hour > OFFICE_END) {
      return helpers.error("any.invalid", { message: `End time must be within office hours ${OFFICE_START}:00 - ${OFFICE_END}:00)` });
    }

    // Check duration
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours > MAX_DURATION_HOURS) {
      return helpers.error("any.invalid", { message: `Booking duration cannot exceed ${MAX_DURATION_HOURS} hours` });
    }

    return value;
  }),

  attendees: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required()
    })
  )
}).min(1);

export function validateCreateBooking(req: Request, res: Response, next: NextFunction) {
  const { error } = createBookingSchema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({ message: error?.details?.[0]?.message });
  }
  next();
}






//schema and validation for updating a booking
//the fields here will be optional and checking needs to be done for start and end time if that field exists
const updateBookingSchema = Joi.object({
  title: Joi.string(),
  startTime: Joi.date().custom((value, helpers) => {
    const now = new Date();
    const start = new Date(value);

    if (start < now) {
      return helpers.error("any.invalid", { message: "Start time cannot be in the past" });
    }

    // if(start <endTime)

    const hour = start.getHours();
    if (hour < OFFICE_START || hour >= OFFICE_END) {
      return helpers.error("any.invalid", { message: `Start time must be within office hours ${OFFICE_START}:00 - ${OFFICE_END}:00` });
    }

    return value;
  }).messages({ "any.invalid": "{{#message}}" }),

  endTime: Joi.date().greater(Joi.ref("startTime")).custom((value, helpers) => {
    const start = new Date(helpers.state.ancestors[0].startTime);
    const end = new Date(value);

    const hour = end.getHours();
    if (hour < OFFICE_START || hour > OFFICE_END) {
      return helpers.error("any.invalid", { message: `End time must be within office hours ${OFFICE_START}:00 - ${OFFICE_END}:00` });
    }

    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours > MAX_DURATION_HOURS) {
      return helpers.error("any.invalid", { message: `Booking duration cannot exceed ${MAX_DURATION_HOURS} hours` });
    }

    return value;
  }),

  attendees: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required()
    })
  ),

  status: Joi.string().valid("confirmed", "cancelled", "pending")
});

export function validateUpdateBooking(req: Request, res: Response, next: NextFunction) {
  const { error } = updateBookingSchema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({ message: error?.details?.[0]?.message });
  }
  next();
}
