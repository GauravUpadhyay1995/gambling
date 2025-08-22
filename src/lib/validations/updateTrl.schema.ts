import Joi from 'joi';

export const updateTrlSchema = Joi.object({
  title: Joi.string().trim().min(3).messages({
    'string.base': 'Title must be a string',
    'string.min': 'Title must be at least 3 characters',
  }),

  duration: Joi.string().trim().min(1).messages({
    'string.base': 'Duration must be a string',
  }),

  amount: Joi.string().trim().min(1).messages({
    'string.base': 'Amount must be a string',
  }),

  requirement: Joi.string().trim().min(3).messages({
    'string.base': 'Requirement must be a string',
  }),

  description: Joi.string().trim().min(10).messages({
    'string.base': 'Description must be a string',
    'string.min': 'Description must be at least 10 characters',
  }),

  tag: Joi.string().trim().messages({
    'string.base': 'Tag must be a string',
  }),

  isActive: Joi.boolean().messages({
    'boolean.base': 'isActive must be a boolean',
  }),
}).options({ abortEarly: false });
