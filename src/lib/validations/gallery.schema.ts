import Joi from 'joi';

export const createGallerySchema = Joi.object({
    title: Joi.string().required().trim(),
    images: Joi.array().items(
        Joi.object({
            url: Joi.string().uri().required(),
            mimetype: Joi.string().required(),
            size: Joi.number().required(),
            _id: Joi.string().optional(), // Optional for Mongo _id
        })
    ).optional(),

    video_url: Joi.array().items(
        Joi.object({
           url: Joi.string().uri().required(),
            title: Joi.string().required(),
            description: Joi.string().required(),
            _id: Joi.string().optional(),
        })
    ).optional(),

    isActive: Joi.boolean().optional(),
});



export const updateGallerySchema = Joi.object({
    title: Joi.string().trim().optional(),

    images: Joi.array().items(
        Joi.object({
            url: Joi.string().uri().required(),
            mimetype: Joi.string().required(),
            size: Joi.number().required(),
            _id: Joi.string().optional(),
        })
    ).optional(),

    video_url: Joi.array().items(
        Joi.object({
             url: Joi.string().uri().required(),
            title: Joi.string().required(),
            description: Joi.string().required(),
            _id: Joi.string().optional(),
        })
    ).optional(),

    isActive: Joi.boolean().optional(),
});
