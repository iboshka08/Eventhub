import Joi from "joi";

const id = Joi.number()
    .integer()
    .positive();


const createBookingSchema = Joi.object({
    user_id: id
        .required()
        .messages({
            "number.base": `Foydalanuvchi ID raqam bo'lishi kerak`,
            "number.integer": `Foydalanuvchi ID butun son bo'lishi kerak`,
            "number.positive": `Foydalanuvchi ID musbat son bo'lishi kerak`,
            "any.required": `Foydalanuvchi ID kiritish shart`
        }),

    event_id: id
        .required()
        .messages({
            "number.base": `Tadbir ID raqam bo'lishi kerak`,
            "number.integer": `Tadbir ID butun son bo'lishi kerak`,
            "number.positive": `Tadbir ID musbat son bo'lishi kerak`,
            "any.required": `Tadbir ID kiritish shart`
        }),

    seats: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            "number.base": `Joylar soni raqam bo'lishi kerak`,
            "number.integer": `Joylar soni butun son bo'lishi kerak`,
            "number.min": `Kamida 1ta joy tanlash kerak`,
            "number.max": `Maksimal 5ta joy tanlash mumkin`,
            "any.required": `Joylar sonini kiritish shart`
        })
});

const bookingIdSchema = Joi.object({
    id: id
        .required()
        .messages({
            "number.base": `Bron ID raqam bo'lishi kerak`,
            "number.integer": `Bron ID butun son bo'lishi kerak`,
            "number.positive": `Bron ID musbat son bo'lishi kerak`,
            "any.required": `Bron ID kiritish shart`
        })
});

const userIdSchema = Joi.object({
    id: id
        .required()
        .messages({
            "number.base": `Foydalanuvchi ID raqam bo'lishi kerak`,
            "number.integer": `Foydalanuvchi ID butun son bo'lishi kerak`,
            "number.positive": `Foydalanuvchi ID musbat son bo'lishi kerak`,
            "any.required": `Foydalanuvchi ID kiritish shart`
        })
});

const updateBookingSchema = Joi.object({
    seats: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            "number.base": `Joylar soni raqam bo'lishi kerak`,
            "number.integer": `Joylar soni butun son bo'lishi kerak`,
            "number.min": `Kamida 1ta joy tanlash kerak`,
            "number.max": `Maksimal 5ta joy tanlash mumkin`,
            "any.required": `Joylar sonini kiritish shart`
        })
});

const listBookingsSchema = Joi.object({
    status: Joi.string()
        .valid("confirmed", "cancelled")
        .messages({
            "any.only": `Bron statusi confirmed yoki cancelled bo'lishi kerak`
        }),

    event_id: id
        .messages({
            "number.base": `Tadbir ID raqam bo'lishi kerak`,
            "number.integer": `Tadbir ID butun son bo'lishi kerak`,
            "number.positive": `Tadbir ID musbat son bo'lishi kerak`
        }),

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
        })
});


export {
    createBookingSchema,
    bookingIdSchema,
    userIdSchema,
    updateBookingSchema,
    listBookingsSchema
};
