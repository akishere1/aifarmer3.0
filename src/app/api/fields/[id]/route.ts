import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Field from '@/models/Field';
import Growth from '@/models/Growth';

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
    
    // Get field data
    const field = await Field.findOne({
      _id: fieldId,
      userId: (user as any).id // Cast user to any to access id property
    });

    if (!field) {
      return NextResponse.json(
        { success: false, message: 'Field not found or access denied' },
        { status: 404 }
      );
    }

    // Get growth data if field has an active crop
    let growthData = null;
    if (field.status === 'active' && field.crop) {
      growthData = await Growth.findOne({ fieldId: fieldId });
    }

    // Get weather data for field location
    // In a real app, this would call a weather API using the field's location
    const mockWeatherData = {
      location: field.location,
      currentTemp: Math.round(20 + Math.random() * 15), // Random temperature between 20-35°C
      humidity: Math.round(40 + Math.random() * 40), // Random humidity between 40-80%
      rainfall: Math.round(Math.random() * 50), // Random rainfall between 0-50mm
      forecast: [
        { day: 'Today', highTemp: Math.round(25 + Math.random() * 10), lowTemp: Math.round(15 + Math.random() * 5), condition: 'Sunny' },
        { day: 'Tomorrow', highTemp: Math.round(25 + Math.random() * 10), lowTemp: Math.round(15 + Math.random() * 5), condition: 'Partly Cloudy' },
        { day: 'Day 3', highTemp: Math.round(25 + Math.random() * 10), lowTemp: Math.round(15 + Math.random() * 5), condition: 'Cloudy' }
      ]
    };

    return NextResponse.json(
      { 
        success: true, 
        data: {
          field: {
            id: field._id,
            name: field.name,
            location: field.location,
            landArea: field.landArea,
            soilType: field.soilType,
            waterLevel: field.waterLevel,
            temperature: field.temperature,
            season: field.season,
            status: field.status,
            crop: field.crop,
            cropDetails: field.cropDetails,
            createdAt: field.createdAt,
            updatedAt: field.updatedAt,
            growthStartDate: field.growthStartDate
          },
          growth: growthData,
          weather: mockWeatherData
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching field details:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch field details' },
      { status: 500 }
    );
  }
} 