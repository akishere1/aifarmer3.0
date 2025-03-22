import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, authorizeRoles } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Field from '@/models/Field';

// Mock crop data for different seasons and soil types
const growthRates: Record<string, Record<string, any>> = {
  'Kharif': {
    'clay': { growthRate: 0.8, harvestDays: 120 },
    'loamy': { growthRate: 0.9, harvestDays: 110 },
    'sandy': { growthRate: 0.7, harvestDays: 130 },
    'silt': { growthRate: 0.85, harvestDays: 115 },
    'saline': { growthRate: 0.6, harvestDays: 140 },
    'peaty': { growthRate: 0.75, harvestDays: 125 },
  },
  'Rabi': {
    'clay': { growthRate: 0.75, harvestDays: 150 },
    'loamy': { growthRate: 0.85, harvestDays: 130 },
    'sandy': { growthRate: 0.65, harvestDays: 160 },
    'silt': { growthRate: 0.8, harvestDays: 140 },
    'saline': { growthRate: 0.55, harvestDays: 170 },
    'peaty': { growthRate: 0.7, harvestDays: 145 },
  },
  'Zaid': {
    'clay': { growthRate: 0.9, harvestDays: 90 },
    'loamy': { growthRate: 1.0, harvestDays: 80 },
    'sandy': { growthRate: 0.8, harvestDays: 100 },
    'silt': { growthRate: 0.95, harvestDays: 85 },
    'saline': { growthRate: 0.7, harvestDays: 110 },
    'peaty': { growthRate: 0.85, harvestDays: 95 },
  }
};

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return the error response if authentication failed
    }

    // Authorize role (only farmers can view their growth data)
    const authorizedUser = await authorizeRoles(['farmer'])(req);
    if (authorizedUser instanceof NextResponse) {
      return authorizedUser; // Return the error response if authorization failed
    }

    // Connect to the database
    await connectToDatabase();

    // Get field ID from query parameters (optional)
    const url = new URL(req.url);
    const fieldId = url.searchParams.get('fieldId');

    // Query to find fields
    const query = fieldId 
      ? { _id: fieldId, farmer: (user as any).id }
      : { farmer: (user as any).id };

    // Fetch fields data
    const fields = await Field.find(query);

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields found' },
        { status: 404 }
      );
    }

    // Calculate growth metrics for each field
    const fieldGrowthData = fields.map((field: any) => {
      // Get growth rate and harvest days based on season and soil type
      const seasonData = growthRates[field.season] || growthRates['Kharif'];
      const soilData = seasonData[field.soilType] || seasonData['loamy'];
      
      // Mock planting date (in a real app, this would be stored with each field)
      // For demo purposes, we'll assume fields were planted between 20-60 days ago
      const daysPlanted = Math.floor(Math.random() * 40) + 20;
      
      // Calculate growth percentage based on days planted and harvest days
      const growthPercentage = Math.min(100, Math.round((daysPlanted / soilData.harvestDays) * 100));
      
      // Calculate days remaining until harvest
      const daysRemaining = Math.max(0, soilData.harvestDays - daysPlanted);
      
      // Calculate harvest time left as a percentage
      const harvestTimeLeftPercentage = Math.max(0, Math.round((daysRemaining / soilData.harvestDays) * 100));

      // Generate mock growth history (in a real app, this would be based on actual measurements)
      const growthHistory = [];
      for (let i = 0; i < 6; i++) {
        // Calculate growth for each month (assuming linear growth for simplicity)
        const monthGrowth = Math.min(100, Math.round((i + 1) * (100 / 6) * soilData.growthRate));
        growthHistory.push({
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
          value: monthGrowth
        });
      }

      return {
        fieldId: field._id,
        location: field.location,
        season: field.season,
        soilType: field.soilType,
        daysPlanted,
        daysRemaining,
        growthPercentage,
        harvestTimeLeftPercentage,
        estimatedYield: Math.round(field.landArea * soilData.growthRate * 10) / 10, // t/ha
        growthHistory,
      };
    });

    // Calculate averages for all fields
    const avgGrowthPercentage = Math.round(
      fieldGrowthData.reduce((sum: number, field: any) => sum + field.growthPercentage, 0) / fieldGrowthData.length
    );
    
    const avgHarvestTimeLeftPercentage = Math.round(
      fieldGrowthData.reduce((sum: number, field: any) => sum + field.harvestTimeLeftPercentage, 0) / fieldGrowthData.length
    );

    // Return growth data
    return NextResponse.json({
      success: true,
      data: {
        fields: fieldGrowthData,
        summary: {
          avgGrowthPercentage,
          avgHarvestTimeLeftPercentage,
        }
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching growth data:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch growth data' },
      { status: 500 }
    );
  }
} 