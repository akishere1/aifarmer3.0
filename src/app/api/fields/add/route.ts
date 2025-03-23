import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Field from '@/models/Field';

interface RequestBody {
  waterLevel: number;
  soilType: string;
  landArea: number;
  location: string;
  temperature: number;
  season: string;
}

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB();

    // Parse request body
    const body: RequestBody = await req.json();
    
    // Validate required fields
    const { waterLevel, soilType, landArea, location, temperature, season } = body;
    
    if (!waterLevel || !soilType || !landArea || !location || !temperature || !season) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate waterLevel (must be between 0 and 100)
    if (waterLevel > 100) {
      return NextResponse.json(
        { success: false, message: 'Water level must be between 0 and 100' },
        { status: 400 }
      );
    }
    
    // Create new field with all required fields
    const newField = new Field({
      userId: '64f7c1b5e85330a883d485ff', // Default test ID
      name: `Field - ${location}`, // Generate a name based on location
      location,
      landArea,
      soilType,
      waterLevel,
      temperature,
      season,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Save to database
    const savedField = await newField.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Field added successfully',
        data: savedField
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding field:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to add field' },
      { status: 500 }
    );
  }
}