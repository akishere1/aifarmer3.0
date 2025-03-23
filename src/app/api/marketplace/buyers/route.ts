import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Buyer from '@/models/Buyer';

// Geocode a location string to coordinates
async function geocodeLocation(location: string) {
  try {
    // This would be replaced with a real geocoding service in production
    // Mocking coordinates for now with dummy values based on location name
    // Bangalore coordinates
    if (location.toLowerCase().includes('bengaluru') || location.toLowerCase().includes('bangalore')) {
      return { latitude: 12.9716, longitude: 77.5946 };
    }
    // Chennai coordinates
    if (location.toLowerCase().includes('chennai')) {
      return { latitude: 13.0827, longitude: 80.2707 };
    }
    // Mysore coordinates
    if (location.toLowerCase().includes('mysuru') || location.toLowerCase().includes('mysore')) {
      return { latitude: 12.2958, longitude: 76.6394 };
    }
    // Default to Bangalore if no match
    return { latitude: 12.9716, longitude: 77.5946 };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(1));
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const crop = searchParams.get('crop');
    const maxDistance = parseFloat(searchParams.get('maxDistance') || '50');
    
    // Build query
    const query: any = { status: 'active' };
    
    if (crop && crop !== 'all') {
      query.interestedCrops = crop;
    }
    
    // Fetch all active buyers
    let buyers = await Buyer.find(query);
    
    // If location provided, calculate distances and filter by maxDistance
    if (location) {
      const sourceCoords = await geocodeLocation(location);
      
      if (sourceCoords) {
        // Add distance to each buyer
        buyers = buyers.map(buyer => {
          const buyerDoc = buyer.toObject();
          
          // Use coordinates from DB if available, otherwise geocode the location
          let distance;
          if (buyerDoc.coordinates && buyerDoc.coordinates.latitude && buyerDoc.coordinates.longitude) {
            distance = calculateDistance(
              sourceCoords.latitude, 
              sourceCoords.longitude, 
              buyerDoc.coordinates.latitude, 
              buyerDoc.coordinates.longitude
            );
          } else {
            // This is an approximation - in production we would geocode all locations
            // Just generate a random distance between 1-100km for demonstration
            distance = parseFloat((Math.random() * 50 + 1).toFixed(1));
          }
          
          return {
            ...buyerDoc,
            distance
          };
        });
        
        // Filter by distance
        buyers = buyers.filter(buyer => buyer.distance <= maxDistance);
        
        // Sort by distance
        buyers.sort((a, b) => a.distance - b.distance);
      }
    }
    
    return NextResponse.json({ buyers });
  } catch (error: any) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch buyers' }, { status: 500 });
  }
} 