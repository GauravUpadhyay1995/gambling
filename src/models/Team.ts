import mongoose, { Schema, Types } from 'mongoose';

const teamSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  showingOrder: {
    type: Number,
    default: null,
    required: false
  },
  profileImage: {
    type: String, // URL to S3
    required: true,
  },
  designation: {
    type: String,
    trim: true,
    required: false,
  },
  department: {
    type: String,
    trim: true,
    required: false,
  },
  socialLinks: {
    type: Map,
    of: String,
    default: {},
    required: false,
  },
  description: {
    type: String,
    trim: true,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isSteering: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
