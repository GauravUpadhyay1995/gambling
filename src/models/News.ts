import mongoose, { Schema, Types } from 'mongoose';

const newsSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },

    bannerImage: {
        type: String, // URL to S3
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

export const News = mongoose.models.News || mongoose.model('News', newsSchema);
