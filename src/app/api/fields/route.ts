import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Field from '@/models/Field';
import { getTokenFromCookie } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_key';

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const token = await getTokenFromCookie();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No session found' },
        { status: 401 }
      );
    }
    
    // Verify token
    try {
      jwt.verify(token, JWT_SECRET);
      
      // Connect to the database
      await connectDB();
      
      // Fetch all fields
      const fields = await Field.find().sort({ createdAt: -1 });
      
      return NextResponse.json({
        success: true,
        data: fields
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error fetching fields:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch fields' },
      { status: 500 }
    );
  }
} 