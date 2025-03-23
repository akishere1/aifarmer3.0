import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Field from '@/models/Field';

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
    
    // Get fieldId from context params
    const fieldId = context.params.id;
    
    if (!fieldId) {
      return NextResponse.json(
        { success: false, message: 'Field ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();
    
    // Get field data
    const field = await Field.findById(fieldId);

    if (!field) {
      return NextResponse.json(
        { success: false, message: 'Field not found' },
        { status: 404 }
      );
    }

    // Generate recommendations based on field data
    const recommendations = generateRecommendations(field);

    return NextResponse.json(
      { success: true, data: recommendations },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

// Function to generate recommendations based on field data
function generateRecommendations(field: any) {
  const { soilType, waterLevel, temperature, season } = field;
  
  const recommendations: {
    crops: string[];
    waterManagement: string[];
    soilManagement: string[];
    pestControl: string[];
  } = {
    crops: [],
    waterManagement: [],
    soilManagement: [],
    pestControl: []
  };
  
  // Recommend crops based on soil type and season
  if (season === 'Kharif') {
    if (soilType === 'clay' || soilType === 'loamy') {
      recommendations.crops.push('Rice', 'Maize', 'Cotton');
    } else if (soilType === 'sandy') {
      recommendations.crops.push('Millet', 'Groundnut', 'Sesame');
    } else {
      recommendations.crops.push('Soybean', 'Sugarcane');
    }
  } else if (season === 'Rabi') {
    if (soilType === 'clay' || soilType === 'loamy') {
      recommendations.crops.push('Wheat', 'Mustard', 'Lentil');
    } else if (soilType === 'sandy') {
      recommendations.crops.push('Barley', 'Chickpea');
    } else {
      recommendations.crops.push('Peas', 'Potato');
    }
  } else { // Zaid
    recommendations.crops.push('Cucumber', 'Watermelon', 'Muskmelon');
  }
  
  // Water management recommendations
  if (waterLevel < 30) {
    recommendations.waterManagement.push(
      'Increase irrigation frequency',
      'Consider drip irrigation to conserve water',
      'Mulch soil to reduce evaporation'
    );
  } else if (waterLevel > 70) {
    recommendations.waterManagement.push(
      'Reduce irrigation frequency',
      'Ensure proper drainage to prevent waterlogging',
      'Monitor for signs of root rot due to excess moisture'
    );
  } else {
    recommendations.waterManagement.push(
      'Maintain current irrigation schedule',
      'Monitor soil moisture regularly'
    );
  }
  
  // Soil management recommendations
  if (soilType === 'clay') {
    recommendations.soilManagement.push(
      'Add organic matter to improve drainage',
      'Avoid working soil when wet',
      'Consider raised beds for better drainage'
    );
  } else if (soilType === 'sandy') {
    recommendations.soilManagement.push(
      'Add organic matter to improve water retention',
      'Use mulch to reduce water loss',
      'Apply fertilizers in smaller, more frequent doses'
    );
  } else if (soilType === 'loamy') {
    recommendations.soilManagement.push(
      'Maintain organic matter content with compost',
      'Rotate crops to maintain soil health',
      'Minimal tillage to preserve soil structure'
    );
  }
  
  // Pest control recommendations based on season and temperature
  if (temperature > 30) {
    recommendations.pestControl.push(
      'Monitor for increased insect activity',
      'Apply neem oil as a natural pesticide',
      'Install sticky traps for flying insects'
    );
  } else if (temperature < 15) {
    recommendations.pestControl.push(
      'Check for fungal diseases due to high humidity',
      'Ensure proper spacing for air circulation',
      'Apply fungicides preventatively if necessary'
    );
  } else {
    recommendations.pestControl.push(
      'Implement regular crop monitoring',
      'Practice crop rotation to reduce pest buildup',
      'Use beneficial insects for natural pest control'
    );
  }
  
  return recommendations;
} 