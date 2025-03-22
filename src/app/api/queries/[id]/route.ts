import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Query from '@/models/Query';
import { authMiddleware } from '@/lib/auth';

// Get a specific query
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const query = await Query.findById(params.id)
      .populate('askedBy', 'name role')
      .populate('answers.answeredBy', 'name role');

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, query },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get query error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error getting query', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Update a query (only the user who asked it)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(req);

    if (user instanceof NextResponse) {
      return user;
    }

    await connectToDatabase();
    
    // Find query
    const query = await Query.findById(params.id);

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query not found' },
        { status: 404 }
      );
    }

    // Check if user is the one who asked the query
    if (query.askedBy.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this query' },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    // Update query
    const updatedQuery = await Query.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    )
      .populate('askedBy', 'name role')
      .populate('answers.answeredBy', 'name role');

    return NextResponse.json(
      { success: true, message: 'Query updated successfully', query: updatedQuery },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update query error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error updating query', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Delete a query (only the user who asked it or admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(req);

    if (user instanceof NextResponse) {
      return user;
    }

    await connectToDatabase();
    
    // Find query
    const query = await Query.findById(params.id);

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query not found' },
        { status: 404 }
      );
    }

    // Check if user is the one who asked the query or is admin
    if (query.askedBy.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this query' },
        { status: 403 }
      );
    }

    // Delete query
    await Query.findByIdAndDelete(params.id);

    return NextResponse.json(
      { success: true, message: 'Query deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete query error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error deleting query', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 