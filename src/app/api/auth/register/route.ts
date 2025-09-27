import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';
import { RegisterRequest, AuthResponse, ApiError } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { name, email, password, role, location, phoneNumber } = body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'farmer',
      location,
      phoneNumber,
    });

    // Generate token
    const token = generateToken(user);

    // Return user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      phoneNumber: user.phoneNumber,
    };

    // Create response with token in cookie
    const response = NextResponse.json(
      { success: true, message: 'User registered successfully', user: userData },
      { status: 201 }
    );

    // Set cookie for server-side auth
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Registration error:', apiError);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error registering user', 
        error: apiError.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 