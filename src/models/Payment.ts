import mongoose, { Schema, Types } from 'mongoose';

const paymentSchema = new mongoose.Schema({
    customer_id: {
        type: Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        default: 0,
    },
    transactionId: {
        type: String,
        required: true,
        default: "Welcome",
    },
    isApproved: {
        type: Boolean,
        default: false,
        required: true,
    }



}, { timestamps: true });


export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
