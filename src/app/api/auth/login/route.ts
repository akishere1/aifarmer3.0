import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { email, password } = body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user);

    // Set token in cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login successful', 
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          phoneNumber: user.phoneNumber,
        },
        token // Return token to client
      },
      { status: 200 }
    );

    // Set cookie for server-side auth as well
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error logging in', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 