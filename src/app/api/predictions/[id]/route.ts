import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import AIPredictionService from '@/services/aiPredictionService';

// PATCH /api/predictions/[id] - Accept or reject a crop plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(request);
    
    if (user instanceof NextResponse) {
      return user;
    }
    
    const userId = (user as any).id;

    const { id: cropPlanId } = params;
    const body = await request.json();
    const { action, selectedCrop } = body;

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'accept') {
      if (!selectedCrop || !selectedCrop.crop || !selectedCrop.variety) {
        return NextResponse.json(
          { error: 'Selected crop and variety are required for acceptance' },
          { status: 400 }
        );
      }

      result = await AIPredictionService.acceptCropPlan(
        userId,
        cropPlanId,
        selectedCrop
      );
    } else {
      result = await AIPredictionService.rejectCropPlan(
        userId,
        cropPlanId
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Crop plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error updating crop plan:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
