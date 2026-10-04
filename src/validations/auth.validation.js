/*

const Joi = require("joi");

const password = Joi.string()
  .min(8)
  .max(64)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  .messages({
    "string.pattern.base": "Parolda kamida 1 katta harf, 1 kichik harf va 1 raqam bo'lishi kerak"
  });

const email = Joi.string().email().lowercase().required();

const registerSchema = Joi.object({
  full_name: Joi.string().trim().min(3).max(100).required(),
  email,
  password: password.required()
});

const verifyEmailSchema = Joi.object({
  email,
  code: Joi.string().pattern(/^\d{6}$/).required()
});

const emailOnlySchema = Joi.object({ email });

const loginSchema = Joi.object({
  email,
  password: Joi.string().required()
});

const resetPasswordSchema = Joi.object({
  email,
  code: Joi.string().pattern(/^\d{6}$/).required(),
  new_password: password.required()
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const updateUserSchema = Joi.object({
  full_name: Joi.string().trim().min(3).max(100)
}).min(1);

const changePasswordSchema = Joi.object({
  old_password: Joi.string().required(),
  new_password: password.required()
});

const deleteUserSchema = Joi.object({
  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  verifyEmailSchema,
  emailOnlySchema,
  loginSchema,
  resetPasswordSchema,
  idParamSchema,
  updateUserSchema,
  changePasswordSchema,
  deleteUserSchema
};

*/ 



import Joi from "joi";

const password = Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .messages({
        "string.min": `Foydalanuvchi paroli kamida 8ta belgi kiritishi kerak`,
        "string.max": `Foydalanuvchi paroli maksimal 64ta belgi kiritishi kerak`,
        "string.pattern.base": `Parolda kamida 1ta katta harf, 1ta kichik harf va 1ta raqam bo'lishi kerak`,
        "string.empty": `Foydalanuvchi paroli bosh bo'lmasligi shart`,
        "any.required": `Foydalanuvchi parolini kiritish shart`
    });

const email = Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
        "string.email": `Foydalanuvchi email to'g'ri formatda bo'lishi kerak`,
        "string.empty": `Foydalanuvchi email bosh bo'lmasligi shart`,
        "any.required": `Foydalanuvchi email kiritishi shart`
    });

const registerSchema = Joi.object({
    full_name: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.min": `Foydalanuvchi ismi kamida 3ta harf kiritishi kerak`,
            "string.max": `Foydalanuvchi ismi maksimal 100ta harf kiritishi kerak`,
            "string.empty": `Foydalanuvchi ismi bosh bo'lmasligi shart`,
            "any.required": `Foydalanuvchi ismini kiritish shart`
        }),

    email,

    password
});

const verifyEmailSchema = Joi.object({
    email,

    code: Joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            "string.pattern.base": `Tasdiqlash kodi 6ta raqamdan iborat bo'lishi kerak`,
            "string.empty": `Tasdiqlash kodi bosh bo'lmasligi shart`,
            "any.required": `Tasdiqlash kodini kiritish shart`
        })
});

const emailOnlySchema = Joi.object({
    email
});

const loginSchema = Joi.object({
    email,

    password: Joi.string()
        .required()
        .messages({
            "string.empty": `Foydalanuvchi paroli bosh bo'lmasligi shart`,
            "any.required": `Foydalanuvchi parolini kiritish shart`
        })
});

const resetPasswordSchema = Joi.object({
    email,

    code: Joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            "string.pattern.base": `Tasdiqlash kodi 6ta raqamdan iborat bo'lishi kerak`,
            "string.empty": `Tasdiqlash kodi bosh bo'lmasligi shart`,
            "any.required": `Tasdiqlash kodini kiritish shart`
        }),

    new_password: password
});

const idParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": `ID raqam bo'lishi kerak`,
            "number.integer": `ID butun son bo'lishi kerak`,
            "number.positive": `ID musbat son bo'lishi kerak`,
            "any.required": `ID kiritish shart`
        })
});

const updateUserSchema = Joi.object({
    full_name: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .messages({
            "string.min": `Foydalanuvchi ismi kamida 3ta harf kiritishi kerak`,
            "string.max": `Foydalanuvchi ismi maksimal 100ta harf kiritishi kerak`,
            "string.empty": `Foydalanuvchi ismi bosh bo'lmasligi shart`
        })
}).min(1);

const changePasswordSchema = Joi.object({
    old_password: Joi.string()
        .required()
        .messages({
            "string.empty": `Eski parol bosh bo'lmasligi shart`,
            "any.required": `Eski parolni kiritish shart`
        }),

    new_password: password
});

const deleteUserSchema = Joi.object({
    password: Joi.string()
        .required()
        .messages({
            "string.empty": `Foydalanuvchi paroli bosh bo'lmasligi shart`,
            "any.required": `Foydalanuvchi parolini kiritish shart`
        })
});

export {
    registerSchema,
    verifyEmailSchema,
    emailOnlySchema,
    loginSchema,
    resetPasswordSchema,
    idParamSchema,
    updateUserSchema,
    changePasswordSchema,
    deleteUserSchema
};