import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Field from '@/models/Field';
import Recommendation from '@/models/Recommendation';

interface Props {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    // Authenticate user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return the error response if authentication failed
    }

    const fieldId = params.id;
    if (!fieldId) {
      return NextResponse.json(
        { success: false, message: 'Field ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();
    
    // Check if the field exists and belongs to the user
    const field = await Field.findOne({
      _id: fieldId,
      userId: (user as any).id
    });

    if (!field) {
      return NextResponse.json(
        { success: false, message: 'Field not found or access denied' },
        { status: 404 }
      );
    }

    // Get recommendations for the field
    const recommendations = await Recommendation.findOne({ 
      fieldId: fieldId, 
      userId: (user as any).id 
    });
    
    if (!recommendations) {
      return NextResponse.json(
        { success: false, message: 'No recommendations found for this field' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data: {
          field: {
            id: field._id,
            name: field.name,
            location: field.location,
            status: field.status,
            soilType: field.soilType,
            waterLevel: field.waterLevel,
            season: field.season
          },
          recommendations: recommendations.recommendations
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching field recommendations:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch field recommendations' },
      { status: 500 }
    );
  }
} 