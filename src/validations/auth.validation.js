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
