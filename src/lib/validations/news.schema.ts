import Joi from 'joi';

export const createNewsSchema = Joi.object({
    title: Joi.string().trim().min(3).required().messages({
        'string.base': 'Title must be a string',
        'string.empty': 'Title is required',
        'any.required': 'Title is required',
        'string.min': 'Title must be at least 3 characters',
    }),

    category: Joi.string().trim().lowercase().min(3).required().messages({
        'string.base': 'Category must be a string',
        'string.empty': 'Category is required',
        'any.required': 'Category is required',
        'string.min': 'Category must be at least 3 characters',
    }),

    description: Joi.string().trim().min(10).required().messages({
        'string.base': 'Description must be a string',
        'string.empty': 'Description is required',
        'any.required': 'Description is required',
        'string.min': 'Description must be at least 10 characters',
    }),


}).options({ abortEarly: false });
