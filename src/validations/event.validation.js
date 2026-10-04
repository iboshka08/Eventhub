import Joi from "joi";


const categories = [
  "concert",
  "meetup",
  "standup",
  "workshop",
  "sport",
  "other"
];

const fields = {
  title: Joi.string()
    .trim()
    .min(5)
    .max(150),

  description: Joi.string()
    .trim()
    .allow("")
    .max(2000),

  category: Joi.string()
    .valid(...categories),

  city: Joi.string()
    .trim()
    .min(2)
    .max(50),

  venue: Joi.string()
    .trim()
    .min(3)
    .max(150),

  starts_at: Joi.date()
    .iso()
    .greater("now"),

  price: Joi.number()
    .integer()
    .min(0)
    .max(10000000),

  capacity: Joi.number()
    .integer()
    .min(1)
    .max(10000)
};

const createEventSchema = Joi.object({
  title: fields.title
    .required()
    .messages({
      "string.min": `Tadbir nomi kamida 5ta belgi bo'lishi kerak`,
      "string.max": `Tadbir nomi maksimal 150ta belgi bo'lishi kerak`,
      "string.empty": `Tadbir nomi bosh bo'lmasligi shart`,
      "any.required": `Tadbir nomini kiritish shart`
    }),

  description: fields.description
    .optional()
    .messages({
      "string.max": `Tadbir tavsifi maksimal 2000ta belgi bo'lishi kerak`
    }),

  category: fields.category
    .required()
    .messages({
      "any.only": `Tadbir kategoriyasi noto'g'ri`,
      "any.required": `Tadbir kategoriyasini kiritish shart`
    }),

  city: fields.city
    .required()
    .messages({
      "string.min": `Shahar nomi kamida 2ta belgi bo'lishi kerak`,
      "string.max": `Shahar nomi maksimal 50ta belgi bo'lishi kerak`,
      "string.empty": `Shahar nomi bosh bo'lmasligi shart`,
      "any.required": `Shahar nomini kiritish shart`
    }),

  venue: fields.venue
    .required()
    .messages({
      "string.min": `Tadbir joyi kamida 3ta belgi bo'lishi kerak`,
      "string.max": `Tadbir joyi maksimal 150ta belgi bo'lishi kerak`,
      "string.empty": `Tadbir joyi bosh bo'lmasligi shart`,
      "any.required": `Tadbir joyini kiritish shart`
    }),

  starts_at: fields.starts_at
    .required()
    .messages({
      "date.format": `Tadbir sanasi noto'g'ri formatda`,
      "date.greater": `Tadbir sanasi hozirgi vaqtdan keyin bo'lishi kerak`,
      "any.required": `Tadbir sanasini kiritish shart`
    }),

  price: fields.price
    .required()
    .messages({
      "number.base": `Tadbir narxi raqam bo'lishi kerak`,
      "number.integer": `Tadbir narxi butun son bo'lishi kerak`,
      "number.min": `Tadbir narxi 0 dan kichik bo'lmasligi kerak`,
      "number.max": `Tadbir narxi maksimal 10000000 bo'lishi kerak`,
      "any.required": `Tadbir narxini kiritish shart`
    }),

  capacity: fields.capacity
    .required()
    .messages({
      "number.base": `Joylar soni raqam bo'lishi kerak`,
      "number.integer": `Joylar soni butun son bo'lishi kerak`,
      "number.min": `Joylar soni kamida 1ta bo'lishi kerak`,
      "number.max": `Joylar soni maksimal 10000ta bo'lishi kerak`,
      "any.required": `Joylar sonini kiritish shart`
    })
});

const updateEventSchema = Joi.object({
  title: fields.title.messages({
    "string.min": `Tadbir nomi kamida 5ta belgi bo'lishi kerak`,
    "string.max": `Tadbir nomi maksimal 150ta belgi bo'lishi kerak`
  }),

  description: fields.description.messages({
    "string.max": `Tadbir tavsifi maksimal 2000ta belgi bo'lishi kerak`
  }),

  category: fields.category.messages({
    "any.only": `Tadbir kategoriyasi noto'g'ri`
  }),

  city: fields.city.messages({
    "string.min": `Shahar nomi kamida 2ta belgi bo'lishi kerak`,
    "string.max": `Shahar nomi maksimal 50ta belgi bo'lishi kerak`
  }),

  venue: fields.venue.messages({
    "string.min": `Tadbir joyi kamida 3ta belgi bo'lishi kerak`,
    "string.max": `Tadbir joyi maksimal 150ta belgi bo'lishi kerak`
  }),

  starts_at: fields.starts_at.messages({
    "date.format": `Tadbir sanasi noto'g'ri formatda`,
    "date.greater": `Tadbir sanasi hozirgi vaqtdan keyin bo'lishi kerak`
  }),

  price: fields.price.messages({
    "number.base": `Tadbir narxi raqam bo'lishi kerak`,
    "number.integer": `Tadbir narxi butun son bo'lishi kerak`,
    "number.min": `Tadbir narxi 0 dan kichik bo'lmasligi kerak`,
    "number.max": `Tadbir narxi maksimal 10000000 bo'lishi kerak`
  }),

  capacity: fields.capacity.messages({
    "number.base": `Joylar soni raqam bo'lishi kerak`,
    "number.integer": `Joylar soni butun son bo'lishi kerak`,
    "number.min": `Joylar soni kamida 1ta bo'lishi kerak`,
    "number.max": `Joylar soni maksimal 10000ta bo'lishi kerak`
  })
}).min(1);

const eventIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": `Tadbir ID raqam bo'lishi kerak`,
      "number.integer": `Tadbir ID butun son bo'lishi kerak`,
      "number.positive": `Tadbir ID musbat son bo'lishi kerak`,
      "any.required": `Tadbir ID kiritish shart`
    })
});

const listEventsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.base": `Sahifa raqam bo'lishi kerak`,
      "number.integer": `Sahifa butun son bo'lishi kerak`,
      "number.min": `Sahifa kamida 1 bo'lishi kerak`
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      "number.base": `Limit raqam bo'lishi kerak`,
      "number.integer": `Limit butun son bo'lishi kerak`,
      "number.min": `Limit kamida 1 bo'lishi kerak`,
      "number.max": `Limit maksimal 50 bo'lishi kerak`
    }),

  search: Joi.string()
    .trim()
    .allow(""),

  category: Joi.string()
    .valid(...categories)
    .messages({
      "any.only": `Tadbir kategoriyasi noto'g'ri`
    }),

  city: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .messages({
      "string.min": `Shahar nomi kamida 2ta belgi bo'lishi kerak`,
      "string.max": `Shahar nomi maksimal 50ta belgi bo'lishi kerak`
    }),

  free: Joi.boolean(),

  sort: Joi.string()
    .valid(
      "date_asc",
      "date_desc",
      "price_asc",
      "price_desc"
    )
    .default("date_asc")
    .messages({
      "any.only": `Sort qiymati noto'g'ri`
    }),

  all: Joi.boolean()
    .default(false)
});


export {
  createEventSchema,
  updateEventSchema,
  eventIdSchema,
  listEventsSchema
};
