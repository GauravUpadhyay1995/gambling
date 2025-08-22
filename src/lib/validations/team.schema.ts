import Joi from 'joi';

export const createTeamSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),

 

  designation: Joi.string().trim().optional().allow('').messages({
    'string.base': 'Designation must be a string',
  }),

  department: Joi.string().trim().optional().allow('').messages({
    'string.base': 'Department must be a string',
  }),

  description: Joi.string().trim().optional().allow('').messages({
    'string.base': 'Description must be a string',
  }),

  socialLinks: Joi.object().pattern(
    Joi.string(), // key
    Joi.string().uri().messages({
      'string.uri': 'Each social link must be a valid URL',
      'string.empty': 'Social link URL cannot be empty',
    })
  ).optional().messages({
    'object.base': 'Social links must be an object',
  }),

  isActive: Joi.boolean().optional().default(true),
  isSteering: Joi.boolean().optional().default(false),
showingOrder: Joi.number().optional().allow(null).default(null),
}).options({ abortEarly: false });
