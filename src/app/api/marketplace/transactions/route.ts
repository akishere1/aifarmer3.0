import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MarketTransaction from '@/models/MarketTransaction';
import Buyer from '@/models/Buyer';
import User from '@/models/User';
import Field from '@/models/Field';
import mongoose from 'mongoose';

// GET - Fetch transactions for a user (farmer)
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.USER_API_KEY || 'aifarm-user-key';
    
    // Check if request has valid API key
    if (apiKey !== validApiKey) {
      return NextResponse.json({ error: 'Unauthorized - Valid API key required' }, { status: 401 });
    }
    
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const buyerId = searchParams.get('buyerId');
    const fieldId = searchParams.get('fieldId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    // Build query
    const query: any = { farmerId: userId };
    
    if (status) {
      query.status = status;
    }
    
    if (buyerId) {
      query.buyerId = buyerId;
    }
    
    if (fieldId) {
      query.fieldId = fieldId;
    }
    
    // Fetch transactions with populated data
    const transactions = await MarketTransaction.find(query)
      .populate('buyerId', 'name location contactInfo')
      .populate('fieldId', 'name location soilType')
      .sort({ transactionDate: -1 });
    
    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.USER_API_KEY || 'aifarm-user-key';
    
    // Check if request has valid API key
    if (apiKey !== validApiKey) {
      return NextResponse.json({ error: 'Unauthorized - Valid API key required' }, { status: 401 });
    }
    
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.farmerId || !body.buyerId || !body.cropType || !body.quantity || !body.pricePerUnit) {
      return NextResponse.json(
        { error: 'Missing required fields: farmerId, buyerId, cropType, quantity, pricePerUnit' }, 
        { status: 400 }
      );
    }
    
    // Verify buyer exists
    const buyerExists = await Buyer.findById(body.buyerId);
    if (!buyerExists) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }
    
    // Verify field exists if provided
    if (body.fieldId) {
      const fieldExists = await Field.findOne({ 
        _id: body.fieldId, 
        userId: body.farmerId 
      });
      
      if (!fieldExists) {
        return NextResponse.json({ error: 'Field not found or not owned by user' }, { status: 404 });
      }
    }
    
    // Calculate total amount
    const totalAmount = body.quantity * body.pricePerUnit;
    
    // Prepare transaction data
    const transactionData = {
      ...body,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newTransaction = new MarketTransaction(transactionData);
    await newTransaction.save();
    
    return NextResponse.json({ 
      message: 'Transaction created successfully', 
      transaction: newTransaction 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: error.message || 'Failed to create transaction' }, { status: 500 });
  }
} 