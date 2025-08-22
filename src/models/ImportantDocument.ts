import mongoose, { Schema, Types } from 'mongoose';

const importantDocumentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },

    documents: [
        {
            url: { type: String, required: true },
            mimetype: { type: String, required: true },
            size: { type: Number, required: true },
        },
    ],
    publishDate: {
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

export const ImportantDocument = mongoose.models.ImportantDocument || mongoose.model('ImportantDocument', importantDocumentSchema);
