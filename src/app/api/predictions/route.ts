import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import AIPredictionService from '@/services/aiPredictionService';
import FieldService from '@/services/fieldService';

// POST /api/predictions - Generate crop predictions for a field
export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (user instanceof NextResponse) {
      return user;
    }
    
    const userId = (user as any).id;

    const body = await request.json();
    const { fieldId, preferences } = body;

    if (!fieldId) {
      return NextResponse.json(
        { error: 'Field ID is required' },
        { status: 400 }
      );
    }

    // Get field data
    const field = await FieldService.getById(userId, fieldId);
    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      );
    }

    // Generate crop plan
    const cropPlan = await AIPredictionService.generateCropPlan({
      userId,
      fieldId,
      fieldData: field,
      preferences
    });

    return NextResponse.json({
      success: true,
      data: cropPlan
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error generating predictions:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/predictions - Get crop plans for user
export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (user instanceof NextResponse) {
      return user;
    }
    
    const userId = (user as any).id;

    const { searchParams } = new URL(request.url);
    const fieldId = searchParams.get('fieldId') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    const result = await AIPredictionService.getCropPlans(userId, {
      fieldId,
      status,
      limit,
      skip
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching crop plans:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
