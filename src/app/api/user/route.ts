import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authMiddleware } from '@/lib/auth';

// Define the type for the authenticated user
interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await authMiddleware(request);
    
    if (user instanceof NextResponse) {
      return user;
    }
    
    // Connect to database
    await connectDB();
    console.log('Connected to database');
    
    // Get user from database
    const dbUser = await User.findById((user as AuthenticatedUser).id).select('-password');
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user: dbUser });
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 