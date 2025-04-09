import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';

// Weather API configuration
const WEATHER_API_KEY = '894c7ec9b3d5495dabe100429251603';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

// Default location to use if none provided
const DEFAULT_LOCATION = 'Bengaluru';

export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authMiddleware(req);
    if (auth instanceof NextResponse) {
      return auth;
    }
    
    // Get location from query parameters (optional)
    const url = new URL(req.url);
    const location = url.searchParams.get('location') || DEFAULT_LOCATION;
    
    try {
      // Fetch weather data from the API
      const weatherResponse = await fetch(
        `${WEATHER_API_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${location}&days=4`,
        { cache: 'no-store' }
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data from API');
      }
      
      const weatherApiData = await weatherResponse.json();
      
      // Transform API response to our app's format
      const weatherData = {
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
      
      return NextResponse.json({
        success: true,
        data: weatherData,
      }, { status: 200 });
      
    } catch (error) {
      console.error('Error fetching from Weather API:', error);
      
      // Fallback to mock data if API call fails
      const fallbackWeatherData = {
        current: {
          temperature: 27,
          condition: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12,
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        },
        forecast: [
          { day: 'Mon', temperature: 26, condition: 'Sunny' },
          { day: 'Tue', temperature: 25, condition: 'Partly Cloudy' },
          { day: 'Wed', temperature: 23, condition: 'Cloudy' },
          { day: 'Thu', temperature: 24, condition: 'Sunny' }
        ]
      };
      
      return NextResponse.json({
        success: true,
        data: fallbackWeatherData,
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error in weather endpoint:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
} 