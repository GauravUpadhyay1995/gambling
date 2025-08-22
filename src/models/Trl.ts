import mongoose, { Schema, Types } from 'mongoose';

const trlSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    duration: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: String,
        required: true,
        trim: true,
    },
    requirement: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    banner: {
        type: String, // URL to S3
        required: true,
    },
    tag: {
        type: String,
        required: false,
        trim: true,
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

export const Trl = mongoose.models.Trl || mongoose.model('Trl', trlSchema);
