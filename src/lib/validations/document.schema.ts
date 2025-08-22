import Joi from 'joi';



export const importantDocumentValidationSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Title cannot be empty',
    'any.required': 'Title is required'
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': 'Description cannot be empty',
    'any.required': 'Description is required'
  }),
 
  publishDate: Joi.date().required().messages({
    'date.base': 'Publish date must be a valid date',
    'any.required': 'Publish date is required'
  }),

});



export const updateImportantDocSchema = Joi.object({
  title: Joi.string().optional().trim(),
  description: Joi.string().optional().trim(),
  publishDate: Joi.date().optional(),
  isActive: Joi.boolean().optional(),
});


