import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Field from '@/models/Field';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Authenticate user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return the error response if authentication failed
    }

    // Connect to the database
    await connectToDatabase();

    // Get field ID from params
    const { id } = params;

    // Fetch field details
    const field = await Field.findById(id);
    if (!field) {
      return NextResponse.json(
        { success: false, message: 'Field not found' },
        { status: 404 }
      );
    }

    // Check if the field belongs to the user
    if (field.farmer.toString() !== (user as any).id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to access this field' },
        { status: 403 }
      );
    }

    // Simulate fetching additional field data
    // In a real application, this might come from different databases or external APIs
    
    // Generate growth data
    const growthData = {
      growthPercentage: Math.floor(Math.random() * 100),
      harvestTimeLeftPercentage: Math.floor(Math.random() * 100),
      daysPlanted: Math.floor(Math.random() * 90) + 10,
      daysRemaining: Math.floor(Math.random() * 60) + 10,
      estimatedYield: Math.floor(Math.random() * 1000) + 500,
      growthHistory: [
        { month: 'Jan', value: Math.floor(Math.random() * 30) },
        { month: 'Feb', value: Math.floor(Math.random() * 40) + 10 },
        { month: 'Mar', value: Math.floor(Math.random() * 50) + 20 },
        { month: 'Apr', value: Math.floor(Math.random() * 60) + 30 },
        { month: 'May', value: Math.floor(Math.random() * 70) + 40 },
        { month: 'Jun', value: Math.floor(Math.random() * 80) + 50 },
      ],
      recommendations: [
        'Consider increasing water levels for optimal growth',
        'Apply nitrogen-rich fertilizer to improve soil health',
        'Monitor for pest infestations, particularly in the eastern section',
        'Install additional drainage to prevent waterlogging'
      ]
    };

    // Generate weather data
    const weatherData = {
      current: {
        temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
        condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      },
      forecast: [
        {
          day: 'Mon',
          temperature: Math.floor(Math.random() * 15) + 15,
          condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)]
        },
        {
          day: 'Tue',
          temperature: Math.floor(Math.random() * 15) + 15,
          condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)]
        },
        {
          day: 'Wed',
          temperature: Math.floor(Math.random() * 15) + 15,
          condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)]
        },
        {
          day: 'Thu',
          temperature: Math.floor(Math.random() * 15) + 15,
          condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)]
        }
      ]
    };

    // Generate soil data
    const soilData = {
      moisture: Math.floor(Math.random() * 30) + 30, // 30-60%
      pH: parseFloat((Math.random() * 3 + 5).toFixed(1)), // 5.0-8.0
      nutrition: {
        nitrogen: Math.floor(Math.random() * 60) + 20, // 20-80
        phosphorus: Math.floor(Math.random() * 60) + 20, // 20-80
        potassium: Math.floor(Math.random() * 60) + 20 // 20-80
      },
      healthScore: Math.floor(Math.random() * 60) + 40, // 40-100
    };

    // Combine all data
    const fieldData = {
      field: field,
      growth: growthData,
      weather: weatherData,
      soil: soilData
    };

    return NextResponse.json(
      { success: true, data: fieldData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching field data:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch field data' },
      { status: 500 }
    );
  }
} 