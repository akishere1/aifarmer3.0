import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Crop from '@/models/Crop';
import { authMiddleware, authorizeRoles } from '@/lib/auth';

// Get all crops
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } },
      ];
    }

    // Get crops
    const crops = await Crop.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Crop.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        crops,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get crops error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error getting crops', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Add a new crop (only for experts and admins)
export async function POST(req: NextRequest) {
  try {
    const authHandler = authorizeRoles(['expert', 'admin']);
    const user = await authHandler(req);

    if (user instanceof NextResponse) {
      return user;
    }

    await connectToDatabase();
    
    const body = await req.json();
    
    // Create new crop
    const crop = await Crop.create(body);

    return NextResponse.json(
      { success: true, message: 'Crop added successfully', crop },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add crop error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error adding crop', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 