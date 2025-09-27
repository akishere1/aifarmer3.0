import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aifarm';

let cachedConnection: typeof mongoose | null = null;

// Connection options for better stability
const connectionOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

export async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (mongoose.connections[0].readyState === 1) {
    cachedConnection = mongoose;
    return cachedConnection;
  }

  try {
    console.log('Connecting to MongoDB...');
    const connection = await mongoose.connect(MONGODB_URI, connectionOptions);
    cachedConnection = connection;
    console.log('✅ Connected to MongoDB successfully');
    return connection;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ MongoDB connection error:', err.message);
    // Don't throw error for dev server - just log and continue
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Continuing without database connection in development mode');
      return mongoose;
    }
    throw new Error(`Failed to connect to database: ${err.message}`);
  }
}
