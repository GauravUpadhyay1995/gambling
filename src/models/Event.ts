import mongoose, { Schema, Types } from 'mongoose';

const eventSchema = new Schema({
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
  venue: {
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

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
