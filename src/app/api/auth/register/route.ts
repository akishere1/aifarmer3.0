import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';

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

    // Set token in cookie
    setTokenCookie(token);

    // Return user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      phoneNumber: user.phoneNumber,
    };

    return NextResponse.json(
      { success: true, message: 'User registered successfully', user: userData },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error registering user', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 