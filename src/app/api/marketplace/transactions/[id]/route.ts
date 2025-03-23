import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MarketTransaction from '@/models/MarketTransaction';
import mongoose from 'mongoose';

// GET - Fetch a specific transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.USER_API_KEY || 'aifarm-user-key';
    
    // Check if request has valid API key
    if (apiKey !== validApiKey) {
      return NextResponse.json({ error: 'Unauthorized - Valid API key required' }, { status: 401 });
    }
    
    await connectDB();
    
    const transactionId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    // Validate transaction ID
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }
    
    // Fetch transaction with populated data
    const transaction = await MarketTransaction.findById(transactionId)
      .populate('buyerId', 'name location contactInfo')
      .populate('fieldId', 'name location soilType');
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Check if user owns this transaction
    if (transaction.farmerId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized to access this transaction' }, { status: 403 });
    }
    
    return NextResponse.json({ transaction });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch transaction' }, { status: 500 });
  }
}

// PATCH - Update a transaction's status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.USER_API_KEY || 'aifarm-user-key';
    
    // Check if request has valid API key
    if (apiKey !== validApiKey) {
      return NextResponse.json({ error: 'Unauthorized - Valid API key required' }, { status: 401 });
    }
    
    await connectDB();
    
    const transactionId = params.id;
    const body = await request.json();
    const userId = body.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required in the request body' }, { status: 400 });
    }
    
    // Validate transaction ID
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }
    
    // Find transaction
    const transaction = await MarketTransaction.findById(transactionId);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Check if user owns this transaction
    if (transaction.farmerId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized to update this transaction' }, { status: 403 });
    }
    
    // Validate status transitions
    if (body.status) {
      const validTransitions: {[key: string]: string[]} = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['in_progress', 'cancelled'],
        'in_progress': ['delivered', 'cancelled'],
        'delivered': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': []
      };
      
      if (!validTransitions[transaction.status].includes(body.status)) {
        return NextResponse.json({ 
          error: `Invalid status transition from ${transaction.status} to ${body.status}` 
        }, { status: 400 });
      }
    }
    
    // Update fields
    const allowedUpdates = ['status', 'paymentStatus', 'paymentMethod', 'notes', 'deliveryDate', 'qualityRating'];
    const updates: {[key: string]: any} = {};
    
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });
    
    // Add updated timestamp
    updates.updatedAt = new Date();
    
    // Update transaction
    const updatedTransaction = await MarketTransaction.findByIdAndUpdate(
      transactionId,
      { $set: updates },
      { new: true }
    ).populate('buyerId', 'name location contactInfo')
      .populate('fieldId', 'name location soilType');
    
    return NextResponse.json({ 
      message: 'Transaction updated successfully', 
      transaction: updatedTransaction 
    });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: error.message || 'Failed to update transaction' }, { status: 500 });
  }
}

// DELETE - Cancel a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.USER_API_KEY || 'aifarm-user-key';
    
    // Check if request has valid API key
    if (apiKey !== validApiKey) {
      return NextResponse.json({ error: 'Unauthorized - Valid API key required' }, { status: 401 });
    }
    
    await connectDB();
    
    const transactionId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    // Validate transaction ID
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }
    
    // Find transaction
    const transaction = await MarketTransaction.findById(transactionId);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Check if user owns this transaction
    if (transaction.farmerId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this transaction' }, { status: 403 });
    }
    
    // Check if transaction can be cancelled
    if (['completed', 'cancelled'].includes(transaction.status)) {
      return NextResponse.json({ 
        error: `Cannot cancel a transaction with status ${transaction.status}` 
      }, { status: 400 });
    }
    
    // Update transaction to cancelled status
    const cancelledTransaction = await MarketTransaction.findByIdAndUpdate(
      transactionId,
      { 
        $set: { 
          status: 'cancelled',
          updatedAt: new Date(),
          notes: transaction.notes 
            ? `${transaction.notes} - Cancelled by user on ${new Date().toISOString().split('T')[0]}`
            : `Cancelled by user on ${new Date().toISOString().split('T')[0]}`
        } 
      },
      { new: true }
    );
    
    return NextResponse.json({ 
      message: 'Transaction cancelled successfully', 
      transaction: cancelledTransaction 
    });
  } catch (error: any) {
    console.error('Error cancelling transaction:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel transaction' }, { status: 500 });
  }
} 