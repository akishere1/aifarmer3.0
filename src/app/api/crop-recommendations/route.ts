import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) {
      return user; // Return the error response if authentication failed
    }

    // Parse request body
    const fieldData = await req.json();
    
    // Validate required fields
    if (!fieldData.waterLevel || !fieldData.soilType || !fieldData.landArea || 
        !fieldData.location || !fieldData.temperature || !fieldData.season) {
      return NextResponse.json(
        { success: false, message: 'All field data is required for recommendations' },
        { status: 400 }
      );
    }
    
    try {
      // Call the AI model API running at http://127.0.0.1:8000
      const response = await axios.post('http://127.0.0.1:8000/predict', {
        water_level: fieldData.waterLevel,
        soil_type: fieldData.soilType,
        land_area: fieldData.landArea,
        location: fieldData.location,
        temperature: fieldData.temperature,
        season: fieldData.season
      });
      
      // Return the recommendations from the AI model
      return NextResponse.json(
        { 
          success: true, 
          data: response.data 
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error fetching crop recommendations from AI model:', error);
      
      // For demo purposes, if the AI service is not available, return mock recommendations
      const mockRecommendations = generateMockRecommendations(fieldData);
      
      return NextResponse.json(
        { 
          success: true, 
          data: mockRecommendations,
          message: 'Using mock data as AI model connection failed'
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('Error processing crop recommendations request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get crop recommendations' },
      { status: 500 }
    );
  }
}

// Function to generate mock recommendations if AI model is not available
function generateMockRecommendations(fieldData: any) {
  // Different crop lists based on season
  const kharifCrops = [
    { crop: 'Rice', suitability: 0.95, waterNeeds: 'High', growthDays: 120 },
    { crop: 'Maize', suitability: 0.88, waterNeeds: 'Medium', growthDays: 90 },
    { crop: 'Cotton', suitability: 0.82, waterNeeds: 'Medium', growthDays: 150 },
    { crop: 'Sugarcane', suitability: 0.79, waterNeeds: 'High', growthDays: 360 },
    { crop: 'Groundnut', suitability: 0.75, waterNeeds: 'Low', growthDays: 110 }
  ];
  
  const rabiCrops = [
    { crop: 'Wheat', suitability: 0.94, waterNeeds: 'Medium', growthDays: 120 },
    { crop: 'Barley', suitability: 0.87, waterNeeds: 'Low', growthDays: 95 },
    { crop: 'Chickpea', suitability: 0.85, waterNeeds: 'Low', growthDays: 100 },
    { crop: 'Mustard', suitability: 0.77, waterNeeds: 'Low', growthDays: 110 },
    { crop: 'Peas', suitability: 0.72, waterNeeds: 'Medium', growthDays: 85 }
  ];
  
  const zaidCrops = [
    { crop: 'Cucumber', suitability: 0.91, waterNeeds: 'Medium', growthDays: 55 },
    { crop: 'Watermelon', suitability: 0.88, waterNeeds: 'Medium', growthDays: 85 },
    { crop: 'Muskmelon', suitability: 0.83, waterNeeds: 'Medium', growthDays: 90 },
    { crop: 'Bitter Gourd', suitability: 0.76, waterNeeds: 'Medium', growthDays: 75 },
    { crop: 'Pumpkin', suitability: 0.71, waterNeeds: 'Medium', growthDays: 95 }
  ];
  
  // Select crops based on season
  let cropOptions;
  switch (fieldData.season) {
    case 'Kharif':
      cropOptions = kharifCrops;
      break;
    case 'Rabi':
      cropOptions = rabiCrops;
      break;
    case 'Zaid':
      cropOptions = zaidCrops;
      break;
    default:
      cropOptions = [...kharifCrops, ...rabiCrops, ...zaidCrops];
  }
  
  // Apply additional logic based on water level, soil type, etc.
  // (This is a simplified mock version, the real AI would have more sophisticated logic)
  const adjustedOptions = cropOptions.map(crop => {
    let adjustedSuitability = crop.suitability;
    
    // Adjust for soil type
    if (fieldData.soilType === 'clay' && crop.waterNeeds === 'High') {
      adjustedSuitability += 0.05;
    } else if (fieldData.soilType === 'sandy' && crop.waterNeeds === 'Low') {
      adjustedSuitability += 0.05;
    }
    
    // Adjust for water level
    if (crop.waterNeeds === 'High' && fieldData.waterLevel > 80) {
      adjustedSuitability += 0.05;
    } else if (crop.waterNeeds === 'Low' && fieldData.waterLevel < 40) {
      adjustedSuitability += 0.05;
    }
    
    // Clamp values between 0 and 1
    adjustedSuitability = Math.min(1, Math.max(0, adjustedSuitability));
    
    return {
      ...crop,
      suitability: adjustedSuitability
    };
  });
  
  // Sort by suitability
  const sortedOptions = adjustedOptions.sort((a, b) => b.suitability - a.suitability);
  
  return {
    recommendations: sortedOptions,
    fieldData: fieldData,
    metadata: {
      analysis_date: new Date().toISOString(),
      recommendation_confidence: 'medium',
      factors_considered: ['soil_type', 'water_level', 'temperature', 'season', 'land_area']
    }
  };
} 