import Joi from 'joi';

export const createMarketSchema = Joi.object({
  marketName: Joi.string().required().trim(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref('startDate')),
  marketValue: Joi.object({
    a: Joi.string().required(),
    b: Joi.string().required(),
    c: Joi.string().required()
  }).required(), // now it's a single object, not array
});

