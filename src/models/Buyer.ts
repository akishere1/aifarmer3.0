import mongoose, { Schema } from 'mongoose';

const BuyerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  interestedCrops: {
    type: [String],
    required: true
  },
  offerPrice: {
    type: Map,
    of: Number,
    default: {}
  },
  coordinates: {
    // For GeoSpatial queries
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  additionalInfo: {
    type: String
  },
  profileImage: {
    type: String
  },
  buyingPreferences: {
    minQuantity: {
      type: Number,
      default: 0
    },
    regularSupplier: {
      type: Boolean,
      default: false
    },
    transportAvailable: {
      type: Boolean,
      default: false
    },
    paymentTerms: {
      type: String,
      enum: ['immediate', 'weekly', 'monthly', 'custom'],
      default: 'immediate'
    },
    organicPreference: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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
export default mongoose.models.Buyer || mongoose.model('Buyer', BuyerSchema); 