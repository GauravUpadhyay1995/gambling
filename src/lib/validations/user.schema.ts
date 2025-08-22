// lib/validations/user.schema.ts
import Joi from 'joi';

export const createUserSchema = Joi.object({
    name: Joi.string().min(1).required().messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be valid',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
         'any.required': 'Pasword is required'
    }),
    mobile: Joi.string()
        .pattern(/^[6-9]\d{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Mobile must be a 10-digit Indian number starting with 6-9',
            'any.required': 'Mobile is required'
        }),
    role: Joi.string().valid('admin', 'user').optional().messages({
        'any.only': 'Role must be either admin or user',
        'any.required': 'Role is required'
    }),
     isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be a boolean value'
    }),
    permissions: Joi.array().items(
        Joi.object({
        module: Joi.string().required(),
        actions: Joi.array().items(Joi.string().valid('create', 'read', 'update', 'delete')).required(),
        })
    ).optional()
});

export const loginUserSchema = Joi.object({

    email: Joi.string().email().required().messages({
        'string.email': 'Email must be valid',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).optional().messages({
        'string.min': 'Password must be at least 6 characters'
    }),

});
