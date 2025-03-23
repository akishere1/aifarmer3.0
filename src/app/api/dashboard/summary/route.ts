import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, authorizeRoles } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Field from '@/models/Field';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return the error response if authentication failed
    }

    // Authorize role (only farmers can view their dashboard)
    const authorizedUser = await authorizeRoles(['farmer'])(req);
    if (authorizedUser instanceof NextResponse) {
      return authorizedUser; // Return the error response if authorization failed
    }

    // Connect to the database
    await connectDB();

    // Fetch all fields for the authenticated farmer
    const fields = await Field.find({ farmer: (user as any).id }).sort({ createdAt: -1 });

    // Calculate statistics
    const totalFields = fields.length;
    const avgWaterLevel = fields.length 
      ? parseFloat((fields.reduce((sum: number, field: any) => sum + field.waterLevel, 0) / fields.length).toFixed(2))
      : 0;
    const avgTemperature = fields.length 
      ? parseFloat((fields.reduce((sum: number, field: any) => sum + field.temperature, 0) / fields.length).toFixed(2))
      : 0;
    const totalLandArea = fields.length 
      ? parseFloat(fields.reduce((sum: number, field: any) => sum + field.landArea, 0).toFixed(2))
      : 0;

    // Prepare soil type distribution
    const soilTypeDistribution: Record<string, number> = {
      clay: 0,
      loamy: 0,
      sandy: 0,
      silt: 0,
      saline: 0,
      peaty: 0,
    };

    // Prepare season distribution
    const seasonDistribution: Record<string, number> = {
      Kharif: 0,
      Rabi: 0,
      Zaid: 0,
    };

    fields.forEach((field: any) => {
      if (field.soilType) {
        soilTypeDistribution[field.soilType]++;
      }
      if (field.season) {
        seasonDistribution[field.season]++;
      }
    });

    // Mock growth data (in a real app, this would be calculated based on planting dates, crop types, etc.)
    const growthData = {
      currentGrowthPercentage: 45,
      harvestTimeLeftPercentage: 65,
      growthHistory: [
        { month: 'Jan', value: 10 },
        { month: 'Feb', value: 25 },
        { month: 'Mar', value: 30 },
        { month: 'Apr', value: 40 },
        { month: 'May', value: 45 },
        { month: 'Jun', value: 60 },
      ],
    };

    // Return the dashboard summary data
    return NextResponse.json({
      success: true,
      data: {
        fields,
        statistics: {
          totalFields,
          avgWaterLevel,
          avgTemperature,
          totalLandArea,
          soilTypeDistribution,
          seasonDistribution,
        },
        growth: growthData,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 