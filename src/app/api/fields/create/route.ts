import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Field from '@/models/Field';
import Recommendation from '@/models/Recommendation';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return the error response if authentication failed
    }

    // Parse request body
    const fieldData = await req.json();
    
    // Validate required fields
    if (!fieldData.name || !fieldData.location || !fieldData.landArea || 
        !fieldData.soilType || !fieldData.waterLevel || !fieldData.temperature || 
        !fieldData.season) {
      return NextResponse.json(
        { success: false, message: 'All field information is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Create new field object
    const newField = new Field({
      userId: (user as any).id,
      name: fieldData.name,
      location: fieldData.location,
      landArea: fieldData.landArea,
      soilType: fieldData.soilType,
      waterLevel: fieldData.waterLevel,
      temperature: fieldData.temperature,
      season: fieldData.season,
      status: 'pending', // Field is pending until crop is selected
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save field to database
    await newField.save();
    const fieldId = newField._id;

    // Get crop recommendations for the new field
    try {
      // Call the recommendations API
      const recommendationsResponse = await axios.post(`${req.nextUrl.origin}/api/crop-recommendations`, {
        fieldId: fieldId,
        waterLevel: fieldData.waterLevel,
        soilType: fieldData.soilType,
        landArea: fieldData.landArea,
        location: fieldData.location,
        temperature: fieldData.temperature,
        season: fieldData.season
      });
      
      // Store recommendations in database
      const newRecommendation = new Recommendation({
        fieldId: fieldId,
        userId: (user as any).id,
        recommendations: recommendationsResponse.data.data.recommendations,
        createdAt: new Date()
      });
      await newRecommendation.save();

      // Return the field id and recommendations
      return NextResponse.json(
        { 
          success: true, 
          message: 'Field created successfully',
          data: {
            fieldId: fieldId,
            field: newField,
            recommendations: recommendationsResponse.data.data.recommendations
          }
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error getting crop recommendations:', error);
      
      // Even if recommendations fail, return the created field
      return NextResponse.json(
        { 
          success: true, 
          message: 'Field created successfully, but recommendations failed',
          data: {
            fieldId: fieldId,
            field: newField,
            error: 'Failed to get crop recommendations'
          }
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Error creating field:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create field' },
      { status: 500 }
    );
  }
} 