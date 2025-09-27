import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookie, verifyToken, authMiddleware } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { UserData, ApiError } from '@/types/api';

export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);

    if (user instanceof NextResponse) {
      return user;
    }

    await connectDB();

    // Get user from database
    const dbUser = await User.findById(user.id);
    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data
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
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Get user error:', apiError);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error getting current user', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 