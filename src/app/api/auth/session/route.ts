import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authMiddleware } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';

interface AuthenticatedUser extends JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function GET(req: NextRequest) {
  try {
    // Use the auth middleware to get the authenticated user
    const decoded = await authMiddleware(req);
    
    if (decoded instanceof NextResponse) {
      return decoded;
    }
    
    const user = decoded as AuthenticatedUser;
    console.log('Authenticated user:', user.id);

    await connectDB();

    // Get user from database
    const dbUser = await User.findById(user.id);
    console.log('User lookup:', dbUser ? 'Found' : 'Not found');
    
    if (!dbUser) {
      console.log('User not found in database');
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data (without password)
    const userData = {
      _id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      location: dbUser.location,
      phoneNumber: dbUser.phoneNumber,
      expertise: dbUser.expertise,
      farmSize: dbUser.farmSize,
      crops: dbUser.crops,
      createdAt: dbUser.createdAt,
    };

    return NextResponse.json(
      { success: true, user: userData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Session error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error getting session', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 