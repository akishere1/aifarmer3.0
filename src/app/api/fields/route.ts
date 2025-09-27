import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import FieldService, { CreateFieldData } from '@/services/fieldService';

// GET /api/fields - Get all fields for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (user instanceof NextResponse) {
      return user;
    }
    
    const userId = (user as any).id;

    const { searchParams } = new URL(request.url);
    const status = searchParams.getAll('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const result = await FieldService.getAll(userId, {
      status: status.length > 0 ? status : undefined,
      limit,
      skip,
      sortBy,
      sortOrder
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching fields:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/fields - Create a new field
export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (user instanceof NextResponse) {
      return user;
    }
    
    const userId = (user as any).id;

    const body = await request.json();
    const fieldData: CreateFieldData = {
      name: body.name,
      location: {
        address: body.location.address,
        coordinates: body.location.coordinates,
        boundary: body.location.boundary
      },
      size: body.size,
      soilProfile: {
        type: body.soilProfile.type,
        ph: body.soilProfile.ph,
        nutrients: {
          nitrogen: body.soilProfile.nutrients.nitrogen,
          phosphorus: body.soilProfile.nutrients.phosphorus,
          potassium: body.soilProfile.nutrients.potassium
        },
        organicMatter: body.soilProfile.organicMatter,
        moisture: body.soilProfile.moisture
      },
      previousCrops: body.previousCrops || []
    };

    // Validate field data
    const validation = await FieldService.validateFieldData(fieldData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const field = await FieldService.create(userId, fieldData);

    return NextResponse.json({
      success: true,
      data: field
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating field:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
