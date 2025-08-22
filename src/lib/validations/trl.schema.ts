import Joi from 'joi';

export const createTrlSchema = Joi.object({
    title: Joi.string().trim().min(3).required().messages({
        'string.base': 'Title must be a string',
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 3 characters',
        'any.required': 'Title is required',
    }),

    duration: Joi.string().trim().min(1).required().messages({
        'string.base': 'Duration must be a string',
        'string.empty': 'Duration is required',
        'any.required': 'Duration is required',
    }),

    amount: Joi.string().trim().min(1).required().messages({
        'string.base': 'Amount must be a string',
        'string.empty': 'Amount is required',
        'any.required': 'Amount is required',
    }),

    requirement: Joi.string().trim().min(3).required().messages({
        'string.base': 'Requirement must be a string',
        'string.empty': 'Requirement is required',
        'string.min': 'Requirement must be at least 3 characters',
        'any.required': 'Requirement is required',
    }),

    description: Joi.string().trim().min(10).required().messages({
        'string.base': 'Description must be a string',
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least 10 characters',
        'any.required': 'Description is required',
    }),

    tag: Joi.string().trim().optional().messages({
        'string.base': 'Tag must be a string',
    }),
    
}).options({ abortEarly: false });
