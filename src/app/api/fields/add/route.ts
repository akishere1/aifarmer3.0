import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, authorizeRoles } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Field from '@/models/Field';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return the error response if authentication failed
    }

    // Authorize role (only farmers can add fields)
    const authorizedUser = await authorizeRoles(['farmer'])(req);
    if (authorizedUser instanceof NextResponse) {
      return authorizedUser; // Return the error response if authorization failed
    }

    // Connect to the database
    await connectToDatabase();

    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    const { waterLevel, soilType, landArea, location, temperature, season } = body;
    
    if (!waterLevel || !soilType || !landArea || !location || !temperature || !season) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Create new field
    const newField = new Field({
      farmer: (user as any).id,
      waterLevel,
      soilType,
      landArea,
      location,
      temperature,
      season,
      createdAt: new Date()
    });
    
    // Save to database
    await newField.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Field added successfully',
        data: newField
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