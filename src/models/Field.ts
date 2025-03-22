import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IField extends Document {
  farmer: IUser['_id'];
  waterLevel: number;
  soilType: 'clay' | 'loamy' | 'sandy' | 'silt' | 'saline' | 'peaty';
  landArea: number;
  location: string;
  temperature: number;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  createdAt: Date;
  updatedAt: Date;
}

const FieldSchema: Schema = new Schema(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer reference is required'],
    },
    waterLevel: {
      type: Number,
      required: [true, 'Water level is required'],
      min: [0, 'Water level cannot be negative'],
    },
    soilType: {
      type: String,
      required: [true, 'Soil type is required'],
      enum: {
        values: ['clay', 'loamy', 'sandy', 'silt', 'saline', 'peaty'],
        message: '{VALUE} is not a valid soil type',
      },
    },
    landArea: {
      type: Number,
      required: [true, 'Land area is required'],
      min: [0, 'Land area cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature is required'],
    },
    season: {
      type: String,
      required: [true, 'Season is required'],
      enum: {
        values: ['Kharif', 'Rabi', 'Zaid'],
        message: '{VALUE} is not a valid season',
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Field || mongoose.model<IField>('Field', FieldSchema); 