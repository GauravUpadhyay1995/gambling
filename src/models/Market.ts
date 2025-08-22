import mongoose, { Schema, Types } from 'mongoose';

const marketSchema = new Schema({
    marketName: {
        type: String,
        required: true,
        trim: true,
    },

    marketValue:
        {
            a: { type: String, required: true, default: '***' },
            b: { type: String, required: true, default: '**' },
            c: { type: String, required: true, default: '***' },
        },
   
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
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

export const Market = mongoose.models.Market
  ? mongoose.model('Market')
  : mongoose.model('Market', marketSchema);
