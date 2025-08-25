import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const OFFICE_START = 8;  // 8 AM
const OFFICE_END = 20;   // 8 PM
const MIN_DURATION_MINUTES=10;
const MAX_DURATION_HOURS = 4;
const OFFICE_START_MS = OFFICE_START * 60 * 60 * 1000; 
const OFFICE_END_MS = OFFICE_END * 60 * 60 * 1000;



//schema and validation fucntion for creating booking
const createBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  title: Joi.string(),
  startTime: Joi.date().required().custom((value, helpers) => {
    const now = new Date();
    const start = new Date(value);
    const startOfDay = new Date(start).setUTCHours(0, 0, 0, 0);
    const startMs = start.getTime() - startOfDay;

    // Check start time is not in the past
    if (start < now) {
      return helpers.error("any.invalid", { message: "Start time cannot be in the past" });
    }

    // Check office hours (8 AM to 8 PM)
    if (startMs < OFFICE_START_MS || startMs >= OFFICE_END_MS) {
      return helpers.error("any.invalid", { 
        message: `Start time must be within office hours ${OFFICE_START}:00 - ${OFFICE_END}:00`
      });
    }

    return value;
  }).messages({"any.invalid":"{{#message}}"}),


  endTime: Joi.date().greater(Joi.ref("startTime")).required().custom((value, helpers) => {

    const start = new Date(helpers.state.ancestors[0].startTime);
    const end = new Date(value);
    const endOfDay = new Date(end).setUTCHours(0, 0, 0, 0);
    const endMs = end.getTime() - endOfDay;

    // 1. Check office hours (8 AM to 8 PM)
        if (endMs < OFFICE_START_MS || endMs > OFFICE_END_MS) {
      return helpers.error("any.invalid", {
        message: `End time must be within office hours ${OFFICE_START}:00 - ${OFFICE_END}:00`
      });
    }

    // 2. Calculate duration
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = durationMs / (1000 * 60);

    // 3. Check minimum duration
    if (durationMinutes < MIN_DURATION_MINUTES) {
      return helpers.error("any.invalid", {
        message: `Meeting duration must be at least ${MIN_DURATION_MINUTES} minutes`
      });
    }

    // 4. Same day check
    if (!sameDay(start, end)) {
      return helpers.error("any.invalid", {
        message: "Bookings must start and end on the same day"
      });
    }

    // 5. Check maximum duration
    const durationHours = durationMinutes / 60;
    if (durationHours > MAX_DURATION_HOURS) {
      return helpers.error("any.invalid", {
        message: `Meeting duration cannot exceed ${MAX_DURATION_HOURS} hours`
      });
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
  const { error } = createBookingSchema.validate(req.body, { 
    abortEarly: true,
  });

  if (error) {
    // Map over all details and prioritize custom messages
    const messages = error.details.map((detail) => {
      return detail.context?.message || detail.message || "Invalid booking data";
    });

    return res.status(400).json({ 
      message: messages.length === 1 ? messages[0] : messages 
    });
  }

  next();
}







//schema and validation for updating a booking
//the fields here will be optional and checking needs to be done for start and end time if that field exists
//schema and validation for updating a booking
const updateBookingSchema = Joi.object({
  title: Joi.string(),

  startTime: Joi.date().custom((value, helpers) => {
    const now = new Date();
    const start = new Date(value);
    const startOfDay = new Date(start).setUTCHours(0, 0, 0, 0);
    const startMs = start.getTime() - startOfDay;

    // 1. Past check
    if (start < now) {
      return helpers.error("any.invalid", { message: "Start time cannot be in the past" });
    }

    // 2. Office hours
    if (startMs < OFFICE_START_MS || startMs >= OFFICE_END_MS) {
      return helpers.error("any.invalid", { 
        message: `Start time must be within office hours ${OFFICE_START}:00 - ${OFFICE_END}:00`
      });
    }

    return value;
  }).messages({ "any.invalid": "{{#message}}" }),

  endTime: Joi.date().custom((value, helpers) => {
    const start = helpers.state.ancestors[0].startTime 
      ? new Date(helpers.state.ancestors[0].startTime) 
      : null;
    const end = new Date(value);
    const endOfDay = new Date(end).setUTCHours(0, 0, 0, 0);
    const endMs = end.getTime() - endOfDay;

    // 1. Office hours
    if (endMs < OFFICE_START_MS || endMs > OFFICE_END_MS) {
      return helpers.error("any.invalid", {
        message: `End time must be within office hours ${OFFICE_START}:00 - ${OFFICE_END}:00`
      });
    }

    // 2. If start exists, enforce duration rules
    if (start) {
      // Must be after start
      if (end <= start) {
        return helpers.error("any.invalid", { message: "End time must be after start time" });
      }

      // Same day check
      if (!sameDay(start, end)) {
        return helpers.error("any.invalid", { message: "Bookings must start and end on the same day" });
      }

      // Duration min/max
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      if (durationMinutes < MIN_DURATION_MINUTES) {
        return helpers.error("any.invalid", {
          message: `Meeting duration must be at least ${MIN_DURATION_MINUTES} minutes`
        });
      }
      if (durationMinutes / 60 > MAX_DURATION_HOURS) {
        return helpers.error("any.invalid", {
          message: `Meeting duration cannot exceed ${MAX_DURATION_HOURS} hours`
        });
      }
    }

    return value;
  }),

  attendees: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required()
    })
  ),

  status: Joi.string().valid("confirmed", "cancelled"),

  roomId: Joi.string() 
}).min(1);




export function validateUpdateBooking(req: Request, res: Response, next: NextFunction) {
  const { error } = updateBookingSchema.validate(req.body, { abortEarly: true });
  if (error) {
    const message = error.details?.[0]?.context?.message || error.details?.[0]?.message;
    return res.status(400).json({ message });
  }
  next();
}






// Helper function
function sameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}