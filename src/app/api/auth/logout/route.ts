import { NextRequest, NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

export async function POST() {
  try {
    // Create response and remove token cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Remove token cookie
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: -1, // Expire immediately
    });

    return response;
  } catch (error: unknown) {
    const apiError = error as Error;
    console.error('Logout error:', apiError);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error logging out', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 