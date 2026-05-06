import mongoose from 'mongoose';

export async function connectDb() {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI is not set. API will start, but database operations will fail.');
    return;
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  });
  console.log('MongoDB connected');
}
