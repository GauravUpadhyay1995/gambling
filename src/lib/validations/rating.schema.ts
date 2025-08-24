import Joi from 'joi';

export const createRatingSchema = Joi.object({
  ratingName: Joi.string().required().trim(),
  convertValue: Joi.object({
    a: Joi.string().required(),
    b: Joi.string().required(),

  }).required(), // now it's a single object, not array
});

