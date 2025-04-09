import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = await getTokenFromCookie();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token found' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      token
    });
  } catch (error: any) {
    console.error('Error getting token:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get token' },
      { status: 500 }
    );
  }
} 