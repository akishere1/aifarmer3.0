import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-dashboard';

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially.
let cached = global as any;
if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('Connected to MongoDB');
        return mongoose;
      });
  }

  try {
    cached.mongoose.conn = await cached.mongoose.promise;
  } catch (e) {
    cached.mongoose.promise = null;
    console.error('Error connecting to MongoDB:', e);
    throw e;
  }

  return cached.mongoose.conn;
}

export default dbConnect; 