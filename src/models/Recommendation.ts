import mongoose, { Schema } from 'mongoose';

const RecommendationSchema = new Schema({
  fieldId: {
    type: Schema.Types.ObjectId,
    ref: 'Field',
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  recommendations: [{
    crop: String,
    suitability: Number,
    waterNeeds: String,
    growthDays: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create or use existing model
export default mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema); 