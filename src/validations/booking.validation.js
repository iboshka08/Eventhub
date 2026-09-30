const Joi = require("joi");

const id = Joi.number().integer().positive();

const createBookingSchema = Joi.object({
  user_id: id.required(),
  event_id: id.required(),
  seats: Joi.number().integer().min(1).max(5).required()
});

const bookingIdSchema = Joi.object({ id: id.required() });
const userIdSchema = Joi.object({ id: id.required() });

const updateBookingSchema = Joi.object({
  seats: Joi.number().integer().min(1).max(5).required()
});

const listBookingsSchema = Joi.object({
  status: Joi.string().valid("confirmed", "cancelled"),
  event_id: id,
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

module.exports = {
  createBookingSchema,
  bookingIdSchema,
  userIdSchema,
  updateBookingSchema,
  listBookingsSchema
};
