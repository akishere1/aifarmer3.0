import { NextRequest, NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Remove token cookie
    removeTokenCookie();

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Logout error:', error);
    
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