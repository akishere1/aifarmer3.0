import mongoose, { Schema, Document } from 'mongoose';

export interface ICrop extends Document {
  name: string;
  scientificName: string;
  description: string;
  growingSeason: {
    start: string;
    end: string;
  };
  soilRequirements: string[];
  waterRequirements: string;
  fertilizers: string[];
  pesticides: string[];
  diseases: {
    name: string;
    symptoms: string[];
    treatment: string;
  }[];
  harvestingPeriod: string;
  averageYield: string;
  marketPrice: {
    min: number;
    max: number;
    unit: string;
    lastUpdated: Date;
  };
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a crop name'],
      trim: true,
      unique: true,
    },
    scientificName: {
      type: String,
      required: [true, 'Please provide a scientific name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    growingSeason: {
      start: {
        type: String,
        required: [true, 'Please provide a growing season start'],
      },
      end: {
        type: String,
        required: [true, 'Please provide a growing season end'],
      },
    },
    soilRequirements: {
      type: [String],
      required: [true, 'Please provide soil requirements'],
    },
    waterRequirements: {
      type: String,
      required: [true, 'Please provide water requirements'],
    },
    fertilizers: {
      type: [String],
      default: [],
    },
    pesticides: {
      type: [String],
      default: [],
    },
    diseases: [
      {
        name: {
          type: String,
          required: true,
        },
        symptoms: {
          type: [String],
          required: true,
        },
        treatment: {
          type: String,
          required: true,
        },
      },
    ],
    harvestingPeriod: {
      type: String,
      required: [true, 'Please provide a harvesting period'],
    },
    averageYield: {
      type: String,
      required: [true, 'Please provide an average yield'],
    },
    marketPrice: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
        default: 'INR/Quintal',
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    imageUrl: {
      type: String,
      default: '/images/default-crop.jpg',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Crop || mongoose.model<ICrop>('Crop', CropSchema); 