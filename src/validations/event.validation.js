const Joi = require("joi");

const categories = ["concert", "meetup", "standup", "workshop", "sport", "other"];

const fields = {
  title: Joi.string().trim().min(5).max(150),
  description: Joi.string().trim().allow("").max(2000),
  category: Joi.string().valid(...categories),
  city: Joi.string().trim().min(2).max(50),
  venue: Joi.string().trim().min(3).max(150),
  starts_at: Joi.date().iso().greater("now"),
  price: Joi.number().integer().min(0).max(10000000),
  capacity: Joi.number().integer().min(1).max(10000)
};

const createEventSchema = Joi.object({
  title: fields.title.required(),
  description: fields.description.optional(),
  category: fields.category.required(),
  city: fields.city.required(),
  venue: fields.venue.required(),
  starts_at: fields.starts_at.required(),
  price: fields.price.required(),
  capacity: fields.capacity.required()
});

const updateEventSchema = Joi.object(fields).min(1);

const eventIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const listEventsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().trim().allow(""),
  category: Joi.string().valid(...categories),
  city: Joi.string().trim().min(2).max(50),
  free: Joi.boolean(),
  sort: Joi.string().valid("date_asc", "date_desc", "price_asc", "price_desc").default("date_asc"),
  all: Joi.boolean().default(false)
});

module.exports = { createEventSchema, updateEventSchema, eventIdSchema, listEventsSchema };
