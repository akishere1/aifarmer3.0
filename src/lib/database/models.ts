import mongoose from 'mongoose';

// User Model
export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'farmer' | 'admin' | 'agronomist';
  profile: {
    farmName?: string;
    location?: {
      address: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
    experience?: number; // years
    farmSize?: number; // hectares
    educationLevel: 'no_formal' | 'primary' | 'secondary' | 'higher_secondary' | 'graduate' | 'post_graduate';
    preferredLanguage: 'english' | 'hindi' | 'regional';
    farmingType: 'traditional' | 'organic' | 'mixed';
    hasSmartphone: boolean;
    hasInternet: boolean;
  };
  subscription: {
    plan: 'free' | 'premium' | 'professional';
    validUntil?: Date;
    features: string[];
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['farmer', 'admin', 'agronomist'], 
    default: 'farmer' 
  },
  profile: {
    farmName: { type: String },
    location: {
      address: { type: String },
      coordinates: { 
        type: [Number], 
        index: '2dsphere' 
      }
    },
    experience: { type: Number },
    farmSize: { type: Number },
    educationLevel: {
      type: String,
      enum: ['no_formal', 'primary', 'secondary', 'higher_secondary', 'graduate', 'post_graduate'],
      required: true
    },
    preferredLanguage: {
      type: String,
      enum: ['english', 'hindi', 'regional'],
      default: 'regional'
    },
    farmingType: {
      type: String,
      enum: ['traditional', 'organic', 'mixed'],
      default: 'traditional'
    },
    hasSmartphone: { type: Boolean, default: false },
    hasInternet: { type: Boolean, default: false }
  },
  subscription: {
    plan: { 
      type: String, 
      enum: ['free', 'premium', 'professional'], 
      default: 'free' 
    },
    validUntil: { type: Date },
    features: [{ type: String }]
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

// Field Model
export interface IField extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  location: {
    address: string;
    coordinates: [number, number];
    boundary?: {
      type: 'Polygon';
      coordinates: [Array<[number, number]>];
    };
  };
  size: number; // hectares
  sizeUnit: 'hectares' | 'acres' | 'bigha' | 'katha';
  waterSource: {
    type: 'rain_fed' | 'bore_well' | 'canal' | 'river' | 'pond' | 'mixed';
    reliability: 'excellent' | 'good' | 'fair' | 'poor';
    waterQuality: 'excellent' | 'good' | 'fair' | 'poor';
    notes?: string;
  };
  rainfall: {
    averageAnnual: number; // mm
    seasonPattern: 'monsoon_dependent' | 'year_round' | 'irregular';
    lastYearTotal: number; // mm
    irrigationNeeds: 'high' | 'medium' | 'low';
  };
  soilProfile: {
    type: 'clay' | 'sandy' | 'loamy' | 'silt' | 'mixed';
    ph: number;
    nutrients: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
    organicMatter: number;
    moisture: number;
    drainage: 'excellent' | 'good' | 'fair' | 'poor';
    depth: number; // cm
  };
  previousCrops: Array<{
    crop: string;
    year: number;
    yield: number;
    notes?: string;
  }>;
  currentStatus: 'active' | 'fallow' | 'preparation' | 'harvested';
  createdAt: Date;
  updatedAt: Date;
}

const fieldSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  location: {
    address: { type: String, required: true },
    coordinates: { 
      type: [Number], 
      required: true, 
      index: '2dsphere' 
    },
    boundary: {
      type: {
        type: String,
        enum: ['Polygon'],
      },
      coordinates: {
        type: [[[Number]]]
      }
    }
  },
  size: { type: Number, required: true, min: 0 },
  soilProfile: {
    type: { 
      type: String, 
      enum: ['clay', 'sandy', 'loamy', 'silt', 'mixed'], 
      required: true 
    },
    ph: { type: Number, min: 0, max: 14, required: true },
    nutrients: {
      nitrogen: { type: Number, required: true },
      phosphorus: { type: Number, required: true },
      potassium: { type: Number, required: true }
    },
    organicMatter: { type: Number, required: true },
    moisture: { type: Number, required: true }
  },
  previousCrops: [{
    crop: { type: String, required: true },
    year: { type: Number, required: true },
    yield: { type: Number, required: true },
    notes: { type: String }
  }],
  currentStatus: { 
    type: String, 
    enum: ['active', 'fallow', 'preparation', 'harvested'], 
    default: 'preparation' 
  }
}, { timestamps: true });

// Crop Plan Model
export interface ICropPlan extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fieldId: mongoose.Types.ObjectId;
  recommendedCrops: Array<{
    crop: string;
    variety: string;
    predictedYield: number;
    confidence: number; // 0-100
    reasons: string[];
    plantingWindow: {
      start: Date;
      end: Date;
    };
    harvestWindow: {
      start: Date;
      end: Date;
    };
  }>;
  costAnalysis: {
    seeds: { cost: number; quantity: number; unit: string };
    fertilizers: Array<{ name: string; cost: number; quantity: number; unit: string }>;
    pesticides: Array<{ name: string; cost: number; quantity: number; unit: string }>;
    labor: { cost: number; hours: number };
    irrigation: { cost: number; type: string };
    equipment: { cost: number; items: string[] };
    total: number;
  };
  expectedRevenue: {
    cropPrice: number; // per kg/quintal
    totalRevenue: number;
    profit: number;
    profitMargin: number; // percentage
  };
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  selectedCrop?: {
    crop: string;
    variety: string;
    modifiedCosts?: any;
    plantingDate?: Date;
    notes?: string;
  };
  aiModelVersion: string;
  generatedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cropPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  recommendedCrops: [{
    crop: { type: String, required: true },
    variety: { type: String, required: true },
    predictedYield: { type: Number, required: true },
    confidence: { type: Number, min: 0, max: 100, required: true },
    reasons: [{ type: String }],
    plantingWindow: {
      start: { type: Date, required: true },
      end: { type: Date, required: true }
    },
    harvestWindow: {
      start: { type: Date, required: true },
      end: { type: Date, required: true }
    }
  }],
  costAnalysis: {
    seeds: {
      cost: { type: Number, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    fertilizers: [{
      name: { type: String, required: true },
      cost: { type: Number, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, required: true }
    }],
    pesticides: [{
      name: { type: String, required: true },
      cost: { type: Number, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, required: true }
    }],
    labor: {
      cost: { type: Number, required: true },
      hours: { type: Number, required: true }
    },
    irrigation: {
      cost: { type: Number, required: true },
      type: { type: String, required: true }
    },
    equipment: {
      cost: { type: Number, required: true },
      items: [{ type: String }]
    },
    total: { type: Number, required: true }
  },
  expectedRevenue: {
    cropPrice: { type: Number, required: true },
    totalRevenue: { type: Number, required: true },
    profit: { type: Number, required: true },
    profitMargin: { type: Number, required: true }
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'modified'], 
    default: 'pending' 
  },
  selectedCrop: {
    crop: { type: String },
    variety: { type: String },
    modifiedCosts: { type: mongoose.Schema.Types.Mixed },
    plantingDate: { type: Date },
    notes: { type: String }
  },
  aiModelVersion: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date }
}, { timestamps: true });

// Monitoring Event Model
export interface IMonitoringEvent extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fieldId: mongoose.Types.ObjectId;
  cropPlanId?: mongoose.Types.ObjectId;
  type: 'planting' | 'irrigation' | 'fertilization' | 'pesticide' | 'weeding' | 'photo_analysis' | 'harvest' | 'custom';
  title: string;
  description?: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'overdue';
  metadata: {
    crops?: string[];
    quantity?: number;
    unit?: string;
    cost?: number;
    weather?: {
      temperature: number;
      humidity: number;
      conditions: string;
    };
    notes?: string;
  };
  photos?: mongoose.Types.ObjectId[]; // Reference to Photo documents
  reminders: Array<{
    type: 'email' | 'sms' | 'push';
    sentAt?: Date;
    scheduledFor: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const monitoringEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  cropPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'CropPlan' },
  type: { 
    type: String, 
    enum: ['planting', 'irrigation', 'fertilization', 'pesticide', 'weeding', 'photo_analysis', 'harvest', 'custom'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date },
  status: { 
    type: String, 
    enum: ['scheduled', 'in_progress', 'completed', 'skipped', 'overdue'], 
    default: 'scheduled' 
  },
  metadata: {
    crops: [{ type: String }],
    quantity: { type: Number },
    unit: { type: String },
    cost: { type: Number },
    weather: {
      temperature: { type: Number },
      humidity: { type: Number },
      conditions: { type: String }
    },
    notes: { type: String }
  },
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
  reminders: [{
    type: { type: String, enum: ['email', 'sms', 'push'], required: true },
    sentAt: { type: Date },
    scheduledFor: { type: Date, required: true }
  }]
}, { timestamps: true });

// Photo Analysis Model
export interface IPhoto extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fieldId: mongoose.Types.ObjectId;
  monitoringEventId?: mongoose.Types.ObjectId;
  type: 'plant' | 'soil' | 'general';
  filename: string;
  originalPath: string;
  thumbnailPath?: string;
  uploadDate: Date;
  metadata: {
    size: number; // bytes
    format: string;
    dimensions: { width: number; height: number };
    location?: { latitude: number; longitude: number };
    capturedAt?: Date;
  };
  aiAnalysis?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    processedAt?: Date;
    modelVersion?: string;
    results: {
      // Plant analysis results
      healthScore?: number; // 0-100
      diseases?: Array<{
        name: string;
        confidence: number;
        severity: 'low' | 'medium' | 'high';
        treatment?: string;
      }>;
      pests?: Array<{
        name: string;
        confidence: number;
        severity: 'low' | 'medium' | 'high';
        treatment?: string;
      }>;
      nutrients?: {
        deficiency?: string[];
        excess?: string[];
      };
      growthStage?: string;
      // Soil analysis results
      soilHealth?: {
        score: number;
        moisture: number;
        organicMatter: number;
        compaction: string;
      };
      recommendations?: string[];
    };
    confidence: number; // overall confidence 0-100
  };
  tags: string[];
  notes?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  monitoringEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'MonitoringEvent' },
  type: { type: String, enum: ['plant', 'soil', 'general'], required: true },
  filename: { type: String, required: true },
  originalPath: { type: String, required: true },
  thumbnailPath: { type: String },
  uploadDate: { type: Date, default: Date.now },
  metadata: {
    size: { type: Number, required: true },
    format: { type: String, required: true },
    dimensions: {
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    capturedAt: { type: Date }
  },
  aiAnalysis: {
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'], 
      default: 'pending' 
    },
    processedAt: { type: Date },
    modelVersion: { type: String },
    results: {
      healthScore: { type: Number, min: 0, max: 100 },
      diseases: [{
        name: { type: String, required: true },
        confidence: { type: Number, min: 0, max: 100, required: true },
        severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
        treatment: { type: String }
      }],
      pests: [{
        name: { type: String, required: true },
        confidence: { type: Number, min: 0, max: 100, required: true },
        severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
        treatment: { type: String }
      }],
      nutrients: {
        deficiency: [{ type: String }],
        excess: [{ type: String }]
      },
      growthStage: { type: String },
      soilHealth: {
        score: { type: Number },
        moisture: { type: Number },
        organicMatter: { type: Number },
        compaction: { type: String }
      },
      recommendations: [{ type: String }]
    },
    confidence: { type: Number, min: 0, max: 100 }
  },
  tags: [{ type: String }],
  notes: { type: String },
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

// Create compound indexes for better query performance
userSchema.index({ email: 1, isActive: 1 });
fieldSchema.index({ userId: 1, currentStatus: 1 });
fieldSchema.index({ 'location.coordinates': '2dsphere' });
cropPlanSchema.index({ userId: 1, fieldId: 1, status: 1 });
cropPlanSchema.index({ generatedAt: -1 });
monitoringEventSchema.index({ userId: 1, fieldId: 1, scheduledDate: 1 });
monitoringEventSchema.index({ status: 1, scheduledDate: 1 });
photoSchema.index({ userId: 1, fieldId: 1, uploadDate: -1 });
photoSchema.index({ 'aiAnalysis.status': 1 });

// Export models
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export const Field = mongoose.models.Field || mongoose.model<IField>('Field', fieldSchema);
export const CropPlan = mongoose.models.CropPlan || mongoose.model<ICropPlan>('CropPlan', cropPlanSchema);
export const MonitoringEvent = mongoose.models.MonitoringEvent || mongoose.model<IMonitoringEvent>('MonitoringEvent', monitoringEventSchema);
export const Photo = mongoose.models.Photo || mongoose.model<IPhoto>('Photo', photoSchema);

export default {
  User,
  Field,
  CropPlan,
  MonitoringEvent,
  Photo,
};
