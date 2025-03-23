import mongoose, { Schema } from 'mongoose';

const MarketTransactionSchema = new Schema({
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true,
    index: true
  },
  fieldId: {
    type: Schema.Types.ObjectId,
    ref: 'Field',
    index: true
  },
  cropType: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitOfMeasure: {
    type: String,
    enum: ['kg', 'quintal', 'ton'],
    default: 'kg'
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'digital_wallet', 'other'],
    default: 'cash'
  },
  notes: {
    type: String
  },
  qualityRating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to calculate total amount
MarketTransactionSchema.pre('save', function(next) {
  if (this.quantity && this.pricePerUnit) {
    this.totalAmount = this.quantity * this.pricePerUnit;
  }
  next();
});

// Create or use existing model
export default mongoose.models.MarketTransaction || mongoose.model('MarketTransaction', MarketTransactionSchema); 