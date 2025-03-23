import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Field from '@/models/Field';

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB();
    
    // Fetch all fields
    const fields = await Field.find().sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: fields
    });
  } catch (error: any) {
    console.error('Error fetching fields:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch fields' },
      { status: 500 }
    );
  }
} 