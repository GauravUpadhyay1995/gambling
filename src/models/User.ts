import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true, // ✅ Add index
  },
  email: {
    type: String,
    required: true,
    unique: true, // ✅ Unique index
    index: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
  },
  mobile: {
    type: String,
    required: true,
    unique: true, // ✅ Unique index
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true, // ✅ Index for filtering active users
    comment: "Tracks if the user has logged into the platform",
  },
}, { timestamps: true });

// Optional: compound index for frequent filter + search
// userSchema.index({ name: 1, isActive: 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
