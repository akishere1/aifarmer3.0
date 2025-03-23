import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Field from '@/models/Field';
import Growth from '@/models/Growth';

// Weather API configuration
const WEATHER_API_KEY = '894c7ec9b3d5495dabe100429251603';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

interface Props {
  params: {
    id: string;
  };
}

export async function GET(
  req: NextRequest,
  context: Props
) {
  try {
    // No authentication required
    
    // Get fieldId from params - properly awaited through context
    const fieldId = context.params.id;
    
    if (!fieldId) {
      return NextResponse.json(
        { success: false, message: 'Field ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();
    
    // Get field data - don't filter by userId
    const field = await Field.findOne({
      _id: fieldId
    });

    if (!field) {
      return NextResponse.json(
        { success: false, message: 'Field not found' },
        { status: 404 }
      );
    }

    // Get growth data if field has an active crop
    let growthData = null;
    if (field.status === 'active' && field.crop) {
      growthData = await Growth.findOne({ fieldId: fieldId });
    }

    // If no growth data is found, create mock growth data
    if (!growthData) {
      growthData = {
        growthPercentage: Math.round(Math.random() * 100),
        harvestTimeLeftPercentage: Math.round(Math.random() * 100),
        daysPlanted: Math.floor(Math.random() * 40) + 20,
        daysRemaining: Math.floor(Math.random() * 60) + 10,
        growthHistory: [
          { month: 'Jan', value: Math.round(Math.random() * 20) },
          { month: 'Feb', value: Math.round(Math.random() * 40) },
          { month: 'Mar', value: Math.round(Math.random() * 60) },
          { month: 'Apr', value: Math.round(Math.random() * 80) },
          { month: 'May', value: Math.round(Math.random() * 90) },
          { month: 'Jun', value: Math.round(Math.random() * 100) }
        ]
      };
    }

    // Get weather data from Weather API based on field location
    let weatherData;
    try {
      // Extract location for API call - just use the first part of location (city name)
      const locationQuery = field.location.split(',')[0];
      
      const weatherResponse = await fetch(
        `${WEATHER_API_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${locationQuery}&days=3`,
        { cache: 'no-store' }
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const weatherApiData = await weatherResponse.json();
      
      // Transform API response to our app's format
      weatherData = {
        current: {
          temperature: weatherApiData.current.temp_c,
          condition: weatherApiData.current.condition.text,
          humidity: weatherApiData.current.humidity,
          windSpeed: weatherApiData.current.wind_kph,
          day: new Date(weatherApiData.current.last_updated).toLocaleDateString('en-US', { weekday: 'long' })
        },
        forecast: weatherApiData.forecast.forecastday.map((day: any) => ({
          day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
          temperature: day.day.avgtemp_c,
          condition: day.day.condition.text
        }))
      };
    } catch (error) {
      console.error('Error fetching weather data from API:', error);
      // Fallback to mock data if API call fails
      weatherData = {
        current: {
          temperature: field.temperature || 25,
          condition: 'Sunny',
          humidity: 65,
          windSpeed: 12,
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        },
        forecast: [
          { day: 'Mon', temperature: 26, condition: 'Sunny' },
          { day: 'Tue', temperature: 25, condition: 'Partly Cloudy' },
          { day: 'Wed', temperature: 23, condition: 'Cloudy' }
        ]
      };
    }

    // Safe access with optional chaining and default values
    const fieldName = field?.name || `Field at ${field.location}`;

    // Prepare growth data for chart with null checks
    const growthChartData = {
      labels: growthData?.growthHistory?.map((item: { month: string }) => item.month) || [],
      datasets: [{
        label: 'Growth Rate',
        data: growthData?.growthHistory?.map((item: { value: number }) => item.value) || [],
        // other chart properties
      }]
    };

    return NextResponse.json(
      { 
        success: true, 
        data: {
          field: {
            id: field._id,
            name: fieldName,
            location: field.location,
            landArea: field.landArea,
            soilType: field.soilType,
            waterLevel: field.waterLevel,
            temperature: field.temperature,
            season: field.season,
            status: field.status || 'active',
            crop: field.crop || null,
            cropDetails: field.cropDetails || null,
            createdAt: field.createdAt,
            updatedAt: field.updatedAt,
            growthStartDate: field.growthStartDate || null
          },
          growth: growthData,
          weather: weatherData,
          soil: {
            moisture: Math.round(field.waterLevel),
            pH: Math.round(5.5 + Math.random() * 2.5 * 10) / 10,
            nutrition: {
              nitrogen: Math.round(Math.random() * 100),
              phosphorus: Math.round(Math.random() * 100),
              potassium: Math.round(Math.random() * 100)
            },
            healthScore: Math.round(Math.random() * 100)
          }
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