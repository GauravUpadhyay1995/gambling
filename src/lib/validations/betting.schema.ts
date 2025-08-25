import Joi from "joi";
import { Types } from "mongoose";

export const bettingValidation = Joi.object({
    customer_id: Joi.string()
        .custom((value, helpers) => {
            if (!Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        })
        .required(),

    market_id: Joi.string()
        .custom((value, helpers) => {
            if (!Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        })
        .required(),

    rating_id: Joi.string()
        .custom((value, helpers) => {
            if (!Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        })
        .required(),

    choosen_number: Joi.string().required(),


});
