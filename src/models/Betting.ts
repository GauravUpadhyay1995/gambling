import mongoose, { Schema, Types } from 'mongoose';

const bettingSchema = new mongoose.Schema({
    customer_id: {
        type: Types.ObjectId,
        ref: 'Betting',
        required: true,
    },
    market_id: {
        type: Types.ObjectId,
        ref: 'Market',
        required: true,
    },
    rating_id: {
        type: Types.ObjectId,
        ref: 'Rating',
        required: true,
    },
    choosen_number: {
        type: String,
        required: false,
        select: false,
    },
    opening_result: {
        type: String,
        required: true,
        default: "0",
        select: false,

    },
    amount: {
        type: String,
        required: true,
    },
    customer_betting_result: {
        type: String,
        enum: ["Win", "Loss", "Pending"], // ✅ only these values allowed
        default: "Pending",               // default if not provided
        index: true,                      // ✅ for faster filtering
        comment: "Tracks the betting result for the user",
    }

}, { timestamps: true });


export const Betting = mongoose.models.Betting || mongoose.model('Betting', bettingSchema);
