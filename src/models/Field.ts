import mongoose, { Schema } from 'mongoose';

const FieldSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  landArea: {
    type: Number,
    required: true
  },
  soilType: {
    type: String,
    required: true,
    enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'mixed']
  },
  waterLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  temperature: {
    type: Number,
    required: true
  },
  season: {
    type: String,
    required: true,
    enum: ['Kharif', 'Rabi', 'Zaid']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'active', 'harvested', 'inactive'],
    default: 'pending'
  },
  crop: {
    type: String
  },
  cropDetails: {
    type: Schema.Types.Mixed
  },
  growthStartDate: {
    type: Date
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

// Create or use existing model
export default mongoose.models.Field || mongoose.model('Field', FieldSchema); 