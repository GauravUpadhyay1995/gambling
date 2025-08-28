import Joi from 'joi';

export const createCustomerSchema = Joi.object({
    name: Joi.string().required().trim(),
    password: Joi.string().required().trim(),
    mobile: Joi.string().required().trim(),
    // pin: Joi.string().min(4).required().trim(),

});

export const loginCustomerSchema = Joi.object({

   mobile: Joi.string()
  .pattern(/^[6-9]\d{9}$/) // starts with 6-9, total 10 digits
  .required()
  .messages({
    'string.pattern.base': 'Mobile number must be a valid 10-digit number',
    'any.required': 'Mobile number is required'
  }),

    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required'
    }),
    // pin: Joi.string().min(4).required().messages({
    //     'string.min': 'Pin must be at least 4 characters',
    //     'any.required': 'Pin is required'
    // })

});

