import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketPrice extends Document {
  cropName: string;
  market: {
    name: string;
    district: string;
    state: string;
    country: string;
  };
  price: {
    min: number;
    max: number;
    modal: number;
    unit: string;
  };
  date: Date;
  source: string;
  trend: 'up' | 'down' | 'stable';
  previousPrice?: {
    min: number;
    max: number;
    modal: number;
    date: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MarketPriceSchema: Schema = new Schema(
  {
    cropName: {
      type: String,
      required: [true, 'Please provide a crop name'],
      trim: true,
    },
    market: {
      name: {
        type: String,
        required: [true, 'Please provide a market name'],
      },
      district: {
        type: String,
        required: [true, 'Please provide a district'],
      },
      state: {
        type: String,
        required: [true, 'Please provide a state'],
      },
      country: {
        type: String,
        required: [true, 'Please provide a country'],
        default: 'India',
      },
    },
    price: {
      min: {
        type: Number,
        required: [true, 'Please provide a minimum price'],
      },
      max: {
        type: Number,
        required: [true, 'Please provide a maximum price'],
      },
      modal: {
        type: Number,
        required: [true, 'Please provide a modal price'],
      },
      unit: {
        type: String,
        required: [true, 'Please provide a price unit'],
        default: 'INR/Quintal',
      },
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    source: {
      type: String,
      required: [true, 'Please provide the source of the price information'],
    },
    trend: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'stable',
    },
    previousPrice: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
      modal: {
        type: Number,
      },
      date: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

// Create compound index for crop, market, and date
MarketPriceSchema.index(
  { cropName: 1, 'market.name': 1, 'market.district': 1, 'market.state': 1, date: 1 },
  { unique: true }
);

export default mongoose.models.MarketPrice || mongoose.model<IMarketPrice>('MarketPrice', MarketPriceSchema); 