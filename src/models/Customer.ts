import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true, // ✅ Add index
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  mobile: {
    type: String,
    required: true,
    unique: true, // ✅ Unique index
    index: true,
  },
  pin: {
    type: String,
    required: false,
    select: false,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true, // ✅ Index for filtering active users
    comment: "Tracks if the user has logged into the platform",
  },
}, { timestamps: true });


export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
