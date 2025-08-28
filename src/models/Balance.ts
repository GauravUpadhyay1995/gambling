import mongoose, { Schema, Types } from 'mongoose';

const balanceSchema = new mongoose.Schema({
    customer_id: {
        type: Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    balance_amount: {
        type: Number,
        required: true,
        default: 0,
    },


}, { timestamps: true });


export const Balance = mongoose.models.Balance || mongoose.model('Balance', balanceSchema);
