import mongoose, { Schema } from 'mongoose';

const GrowthHistorySchema = new Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  stage: {
    type: String,
    required: true,
    enum: ['germination', 'seedling', 'vegetative', 'budding', 'flowering', 'ripening', 'harvest']
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  notes: {
    type: String
  }
});

const GrowthSchema = new Schema({
  fieldId: {
    type: Schema.Types.ObjectId,
    ref: 'Field',
    required: true,
    index: true
  },
  crop: {
    type: String,
    required: true
  },
  growthStartDate: {
    type: Date,
    required: true
  },
  estimatedHarvestDate: {
    type: Date,
    required: true
  },
  currentGrowthStage: {
    type: String,
    required: true,
    enum: ['germination', 'seedling', 'vegetative', 'budding', 'flowering', 'ripening', 'harvest']
  },
  growthPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  growthHistory: [GrowthHistorySchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create or use existing model
export default mongoose.models.Growth || mongoose.model('Growth', GrowthSchema); 