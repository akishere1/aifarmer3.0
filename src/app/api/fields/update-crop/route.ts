import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Field from '@/models/Field';
import Growth from '@/models/Growth';

export async function PUT(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return the error response if authentication failed
    }

    // Parse request body
    const data = await req.json();
    
    // Validate required fields
    if (!data.fieldId || !data.selectedCrop) {
      return NextResponse.json(
        { success: false, message: 'Field ID and selected crop are required' },
        { status: 400 }
      );
    }

    const { fieldId, selectedCrop } = data;

    // Connect to database
    await dbConnect();

    // Update the field with the selected crop
    const field = await Field.findOneAndUpdate(
      { _id: fieldId, userId: (user as any).id }, // Ensure the field belongs to the authenticated user
      { 
        $set: { 
          crop: selectedCrop.crop,
          cropDetails: selectedCrop,
          updatedAt: new Date(),
          status: 'active', // Change status from pending/new to active
          growthStartDate: new Date()
        } 
      },
      { new: true } // Return the updated document
    );

    if (!field) {
      return NextResponse.json(
        { success: false, message: 'Field not found or access denied' },
        { status: 404 }
      );
    }

    // Generate initial growth data
    const initialGrowthData = new Growth({
      fieldId,
      crop: selectedCrop.crop,
      growthStartDate: new Date(),
      estimatedHarvestDate: new Date(Date.now() + (selectedCrop.growthDays * 24 * 60 * 60 * 1000)), // days to milliseconds
      currentGrowthStage: 'germination',
      growthPercentage: 5, // Starting at 5%
      growthHistory: [
        {
          date: new Date(),
          stage: 'germination',
          percentage: 5,
          notes: 'Crop planted and initial growth phase started'
        }
      ]
    });

    // Save initial growth data
    await initialGrowthData.save();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Field updated successfully with selected crop',
        data: {
          fieldId,
          crop: selectedCrop.crop,
          growthStartDate: new Date(),
          estimatedHarvestDate: initialGrowthData.estimatedHarvestDate
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating field crop:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update field crop' },
      { status: 500 }
    );
  }
} 