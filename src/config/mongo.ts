import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABSENAME = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI not defined in .env');
}

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABSENAME,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected to ${DATABSENAME}`);
  } catch (err) {
    console.error('❌ MongoDB connection error', err);
    throw err;
  }
};
