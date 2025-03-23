import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Query from '@/models/Query';
import { authMiddleware } from '@/lib/auth';

// Accept an answer
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; answerId: string } }
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

    // Check if user is the one who asked the query
    if (query.askedBy.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to accept answers for this query' },
        { status: 403 }
      );
    }

    // Find the answer
    const answer = query.answers.id(params.answerId);

    if (!answer) {
      return NextResponse.json(
        { success: false, message: 'Answer not found' },
        { status: 404 }
      );
    }

    // Reset all answers to not accepted
    query.answers.forEach((ans) => {
      ans.isAccepted = false;
    });

    // Set this answer as accepted
    answer.isAccepted = true;

    // Set query status to resolved
    query.status = 'resolved';

    // Save query
    await query.save();

    // Get updated query with populated fields
    const updatedQuery = await Query.findById(params.id)
      .populate('askedBy', 'name role')
      .populate('answers.answeredBy', 'name role');

    return NextResponse.json(
      { success: true, message: 'Answer accepted successfully', query: updatedQuery },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Accept answer error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error accepting answer', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 