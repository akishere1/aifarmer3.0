import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Query from '@/models/Query';
import { authMiddleware } from '@/lib/auth';

// Get all queries
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const status = url.searchParams.get('status') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    // Get queries
    const queries = await Query.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('askedBy', 'name role')
      .populate('answers.answeredBy', 'name role');

    // Get total count
    const total = await Query.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        queries,
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
    console.error('Get queries error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error getting queries', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Add a new query (authenticated users only)
export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);

    if (user instanceof NextResponse) {
      return user;
    }

    await connectToDatabase();
    
    const body = await req.json();
    
    // Create new query
    const query = await Query.create({
      ...body,
      askedBy: user.id,
    });

    return NextResponse.json(
      { success: true, message: 'Query added successfully', query },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add query error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error adding query', 
        error: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 