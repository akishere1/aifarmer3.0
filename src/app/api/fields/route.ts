import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, authorizeRoles } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Field from '@/models/Field';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return the error response if authentication failed
    }

    // Authorize role (only farmers can view their fields)
    const authorizedUser = await authorizeRoles(['farmer'])(req);
    if (authorizedUser instanceof NextResponse) {
      return authorizedUser; // Return the error response if authorization failed
    }

    // Connect to the database
    await connectToDatabase();

    // Fetch all fields for the authenticated farmer
    const fields = await Field.find({ farmer: (user as any).id }).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, count: fields.length, data: fields },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching fields:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch fields' },
      { status: 500 }
    );
  }
} 