import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority',
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 Mongoose connection closed due to app termination');
  process.exit(0);
});

export default connectToDatabase;

// Enhanced connection with retry logic
export async function connectWithRetry(maxRetries: number = 5): Promise<typeof mongoose> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await connectToDatabase();
    } catch (error) {
      retries++;
      console.log(`🔄 Retrying MongoDB connection... (${retries}/${maxRetries})`);
      
      if (retries === maxRetries) {
        console.error('❌ Max retries reached. Could not connect to MongoDB');
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
  
  throw new Error('Failed to connect after retries');
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const conn = await connectToDatabase();
    const adminDb = conn.connection.db.admin();
    await adminDb.ping();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Database seeding function for development
export async function seedDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Skipping database seeding in production');
    return;
  }

  try {
    await connectToDatabase();
    
    const { User } = await import('./models');
    
    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@aifarmcommerce.com' });
    
    if (!adminExists) {
      // Create default admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@aifarmcommerce.com',
        password: '$2a$10$rOqBvUfBhKNYsR1HgKfN8elqFIzO3Pp9ycZFj0.7Y.7FKnLWvuW3q', // hashed "admin123"
        role: 'admin',
        profile: {
          farmName: 'AI Farm Commerce Admin',
        },
        subscription: {
          plan: 'professional',
          features: ['all_features'],
        },
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }

    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}
