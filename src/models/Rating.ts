import mongoose, { Schema, Types } from 'mongoose';

const ratingSchema = new Schema({
    ratingName: {
        type: String,
        required: true,
        trim: true,
    },

    convertValue:
        {
            a: { type: String, required: true, default: '***' },
            b: { type: String, required: true, default: '**' },
           
        },
   

    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export const Rating = mongoose.models.Rating
  ? mongoose.model('Rating')
  : mongoose.model('Rating', ratingSchema);
