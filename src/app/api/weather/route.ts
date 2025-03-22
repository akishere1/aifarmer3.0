import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, authorizeRoles } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

// MockWeatherData for different locations
const MockWeatherData: Record<string, any> = {
  default: {
    current: {
      temperature: 24,
      condition: 'Sunny',
      humidity: 65,
      windSpeed: 12,
      day: 'Sunday',
    },
    forecast: [
      { day: 'Mon', temperature: 26, condition: 'Sunny' },
      { day: 'Tue', temperature: 23, condition: 'Cloudy' },
      { day: 'Wed', temperature: 22, condition: 'Rainy' },
      { day: 'Thu', temperature: 20, condition: 'Cloudy' },
    ]
  },
  "Karnataka": {
    current: {
      temperature: 30,
      condition: 'Sunny',
      humidity: 55,
      windSpeed: 8,
      day: 'Sunday',
    },
    forecast: [
      { day: 'Mon', temperature: 29, condition: 'Sunny' },
      { day: 'Tue', temperature: 29, condition: 'Sunny' },
      { day: 'Wed', temperature: 28, condition: 'Partly Cloudy' },
      { day: 'Thu', temperature: 27, condition: 'Cloudy' },
    ]
  },
  "Tamil Nadu": {
    current: {
      temperature: 32,
      condition: 'Partly Cloudy',
      humidity: 70,
      windSpeed: 10,
      day: 'Sunday',
    },
    forecast: [
      { day: 'Mon', temperature: 31, condition: 'Partly Cloudy' },
      { day: 'Tue', temperature: 30, condition: 'Thunderstorms' },
      { day: 'Wed', temperature: 29, condition: 'Rainy' },
      { day: 'Thu', temperature: 30, condition: 'Partly Cloudy' },
    ]
  },
  "Maharashtra": {
    current: {
      temperature: 27,
      condition: 'Cloudy',
      humidity: 65,
      windSpeed: 15,
      day: 'Sunday',
    },
    forecast: [
      { day: 'Mon', temperature: 28, condition: 'Partly Cloudy' },
      { day: 'Tue', temperature: 29, condition: 'Sunny' },
      { day: 'Wed', temperature: 30, condition: 'Sunny' },
      { day: 'Thu', temperature: 28, condition: 'Partly Cloudy' },
    ]
  },
  "Punjab": {
    current: {
      temperature: 22,
      condition: 'Cloudy',
      humidity: 50,
      windSpeed: 20,
      day: 'Sunday',
    },
    forecast: [
      { day: 'Mon', temperature: 24, condition: 'Sunny' },
      { day: 'Tue', temperature: 25, condition: 'Sunny' },
      { day: 'Wed', temperature: 23, condition: 'Partly Cloudy' },
      { day: 'Thu', temperature: 22, condition: 'Cloudy' },
    ]
  },
};

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return the error response if authentication failed
    }

    // Connect to the database to get user's location
    await connectToDatabase();

    // Get the user details to determine location
    const userDetails = await User.findById((user as any).id);
    
    if (!userDetails) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get the user's state
    const userState = userDetails.location?.state || '';
    
    // Get weather data based on state or use default
    const weatherData = MockWeatherData[userState] || MockWeatherData.default;

    // In a real app, you would call a weather API here using the user's location
    // For example:
    // const weatherResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${userLocation}&days=4`);
    // const weatherData = await weatherResponse.json();

    return NextResponse.json({
      success: true,
      data: weatherData,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
} 