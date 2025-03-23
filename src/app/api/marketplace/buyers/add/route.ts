import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Buyer from '@/models/Buyer';

// Geocode a location string to coordinates (same as in the GET route)
async function geocodeLocation(location: string) {
  try {
    // Simple mock implementation - in production this would call a real geocoding service
    if (location.toLowerCase().includes('bengaluru') || location.toLowerCase().includes('bangalore')) {
      return { latitude: 12.9716, longitude: 77.5946 };
    }
    if (location.toLowerCase().includes('chennai')) {
      return { latitude: 13.0827, longitude: 80.2707 };
    }
    if (location.toLowerCase().includes('mysuru') || location.toLowerCase().includes('mysore')) {
      return { latitude: 12.2958, longitude: 76.6394 };
    }
    return { latitude: 12.9716, longitude: 77.5946 };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.ADMIN_API_KEY || 'aifarm-admin-key';
    
    // Check if request has valid API key
    if (apiKey !== validApiKey) {
      return NextResponse.json({ error: 'Unauthorized - Valid API key required' }, { status: 401 });
    }
    
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.location || !body.contactInfo || !body.interestedCrops) {
      return NextResponse.json(
        { error: 'Missing required fields: name, location, contactInfo, interestedCrops' }, 
        { status: 400 }
      );
    }
    
    // Validate contact info
    if (!body.contactInfo.phone || !body.contactInfo.email) {
      return NextResponse.json(
        { error: 'Contact info must include phone and email' }, 
        { status: 400 }
      );
    }
    
    // Convert offerPrice from object to Map if needed
    if (body.offerPrice && typeof body.offerPrice === 'object') {
      const offerPriceMap = new Map();
      Object.entries(body.offerPrice).forEach(([crop, price]) => {
        offerPriceMap.set(crop, price);
      });
      body.offerPrice = offerPriceMap;
    }
    
    // Geocode location to get coordinates
    if (body.location) {
      const coordinates = await geocodeLocation(body.location);
      if (coordinates) {
        body.coordinates = coordinates;
      }
    }
    
    // Set default values for certain fields
    const buyerData = {
      ...body,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newBuyer = new Buyer(buyerData);
    await newBuyer.save();
    
    return NextResponse.json({ 
      message: 'Buyer added successfully', 
      buyer: newBuyer 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding buyer:', error);
    return NextResponse.json({ error: error.message || 'Failed to add buyer' }, { status: 500 });
  }
} 