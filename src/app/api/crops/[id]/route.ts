import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Crop from '@/models/Crop';
import { authMiddleware, authorizeRoles } from '@/lib/auth';

// Get a specific crop
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const crop = await Crop.findById(params.id);

    if (!crop) {
      return NextResponse.json(
        { success: false, message: 'Crop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, crop },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get crop error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error getting crop', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Update a crop (only for experts and admins)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHandler = authorizeRoles(['expert', 'admin']);
    const user = await authHandler(req);

    if (user instanceof NextResponse) {
      return user;
    }

    await connectDB();
    
    const body = await req.json();
    
    // Find and update crop
    const crop = await Crop.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!crop) {
      return NextResponse.json(
        { success: false, message: 'Crop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Crop updated successfully', crop },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update crop error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error updating crop', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Delete a crop (only for admins)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHandler = authorizeRoles(['admin']);
    const user = await authHandler(req);

    if (user instanceof NextResponse) {
      return user;
    }

    await connectDB();
    
    // Find and delete crop
    const crop = await Crop.findByIdAndDelete(params.id);

    if (!crop) {
      return NextResponse.json(
        { success: false, message: 'Crop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Crop deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete crop error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error deleting crop', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 