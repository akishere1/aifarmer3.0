import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Query from '@/models/Query';
import { authMiddleware } from '@/lib/auth';

// Add an answer to a query
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(req);

    if (user instanceof NextResponse) {
      return user;
    }

    await connectDB();
    
    // Find query
    const query = await Query.findById(params.id);

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Answer content is required' },
        { status: 400 }
      );
    }

    // Add answer to query
    query.answers.push({
      content,
      answeredBy: user.id,
      answeredAt: new Date(),
      upvotes: 0,
      isAccepted: false,
    });

    // Save query
    await query.save();

    // Get updated query with populated fields
    const updatedQuery = await Query.findById(params.id)
      .populate('askedBy', 'name role')
      .populate('answers.answeredBy', 'name role');

    return NextResponse.json(
      { success: true, message: 'Answer added successfully', query: updatedQuery },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add answer error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error adding answer', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}