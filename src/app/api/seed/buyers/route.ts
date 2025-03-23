import { NextRequest, NextResponse } from 'next/server';
import { seedBuyerData } from '@/utils/seedBuyerData';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.SEED_API_KEY || 'aifarm-seed-key';
    
    // Check if request has valid API key
    if (apiKey !== validApiKey) {
      return NextResponse.json({ error: 'Unauthorized - Valid API key required' }, { status: 401 });
    }
    
    await seedBuyerData();
    
    return NextResponse.json({ 
      message: 'Buyer data seeded successfully' 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error seeding buyer data:', error);
    return NextResponse.json({ error: error.message || 'Failed to seed buyer data' }, { status: 500 });
  }
} 