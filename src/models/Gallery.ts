import mongoose, { Schema, Types } from 'mongoose';

const gallerySchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    images: [
        {
            url: { type: String, required: true },
            mimetype: { type: String, required: true },
            size: { type: Number, required: true },
        },
    ],
    video_url: [
        {
            url: { type: String, required: true },
            title: { type: String, required: true },
            description: { type: String, required: true },

        },
    ],

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

export const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
