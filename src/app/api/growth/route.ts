import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Field from '@/models/Field';
import { getTokenFromCookie } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_key';

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
    // Get token from cookie
    const token = await getTokenFromCookie();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No session found' },
        { status: 401 }
      );
    }
    
    // Verify token
    try {
      jwt.verify(token, JWT_SECRET);
      
      // Connect to the database
      await connectDB();
      
      // Fetch all fields
      const fields = await Field.find().sort({ createdAt: -1 });
      
      // Calculate growth data for each field
      const fieldsGrowthData = fields.map(field => {
        const plantedDate = new Date(field.createdAt);
        const currentDate = new Date();
        const daysPlanted = Math.floor((currentDate.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const rateInfo = growthRates[field.season][field.soilType];
        const totalDays = rateInfo.harvestDays;
        const daysRemaining = Math.max(0, totalDays - daysPlanted);
        const growthPercentage = Math.min(100, Math.round((daysPlanted / totalDays) * 100 * rateInfo.growthRate));
        const harvestTimeLeftPercentage = Math.max(0, Math.round((daysRemaining / totalDays) * 100));
        
        // Generate mock growth history
        const growthHistory = Array.from({ length: 6 }, (_, i) => {
          const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5 + i, 1);
          return {
            month: month.toLocaleString('default', { month: 'short' }),
            value: Math.min(100, Math.round((growthPercentage / 6) * (i + 1) * (0.8 + Math.random() * 0.4)))
          };
        });
        
        return {
          fieldId: field._id,
          location: field.location,
          season: field.season,
          soilType: field.soilType,
          daysPlanted,
          daysRemaining,
          growthPercentage,
          harvestTimeLeftPercentage,
          estimatedYield: Math.round(1000 * rateInfo.growthRate * (field.landArea || 1)),
          growthHistory
        };
      });
      
      // Calculate summary data
      const avgGrowthPercentage = Math.round(
        fieldsGrowthData.reduce((sum, field) => sum + field.growthPercentage, 0) / (fields.length || 1)
      );
      
      const avgHarvestTimeLeftPercentage = Math.round(
        fieldsGrowthData.reduce((sum, field) => sum + field.harvestTimeLeftPercentage, 0) / (fields.length || 1)
      );
      
      return NextResponse.json({
        success: true,
        data: {
          fields: fieldsGrowthData,
          summary: {
            avgGrowthPercentage,
            avgHarvestTimeLeftPercentage
          }
        }
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error calculating growth data:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to calculate growth data' },
      { status: 500 }
    );
  }
} 