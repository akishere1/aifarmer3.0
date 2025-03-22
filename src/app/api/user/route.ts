import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return the error response if authentication failed
    }

    // Connect to the database
    await connectToDatabase();

    // Fetch user details
    const userDetails = await User.findById((user as any).id).select('-password');
    if (!userDetails) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: userDetails },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch user data' },
      { status: 500 }
    );
  }
} 