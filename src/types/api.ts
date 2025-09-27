// API Response Types for AI Farm Application

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  stack?: string;
}

// User Types
export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'farmer' | 'expert' | 'admin';
  location: {
    district: string;
    state: string;
    country: string;
  };
  phoneNumber?: string;
  expertise?: string[];
  farmSize?: number;
  crops?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'farmer' | 'expert' | 'admin';
  location: {
    district: string;
    state: string;
    country: string;
  };
  phoneNumber?: string;
}

export interface AuthResponse extends ApiResponse<UserData> {
  user: UserData;
}

// Field Types
export interface FieldData {
  _id?: string;
  userId: string;
  name: string;
  location: string;
  landArea: number;
  soilType: 'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty' | 'chalky' | 'mixed';
  waterLevel: number;
  temperature: number;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  status: 'pending' | 'active' | 'harvested' | 'inactive';
  crop?: string;
  cropDetails?: any;
  growthStartDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Crop Types
export interface CropData {
  _id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

// Query Types
export interface QueryData {
  _id?: string;
  title: string;
  description: string;
  images?: string[];
  category: 'crop' | 'pest' | 'disease' | 'fertilizer' | 'market' | 'weather' | 'other';
  cropName?: string;
  location: {
    district: string;
    state: string;
    country: string;
  };
  askedBy: string;
  answers: {
    _id?: string;
    content: string;
    answeredBy: string;
    answeredAt: Date;
    upvotes: number;
    isAccepted: boolean;
  }[];
  status: 'open' | 'resolved';
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ML API Types
export interface CropPredictionRequest {
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  water_level: number;
  soil_type: number;
  land_area: number;
  location: string;
  season: number;
}

export interface CropPredictionResponse {
  prediction: string;
  confidence: number;
}

export interface DiseasePredictionResponse {
  'Predicted Disease': string;
  Confidence: number;
  'Recommended Pesticide': string;
  'Pesticide Image': string | null;
}

// Buyer/Marketplace Types
export interface BuyerData {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  location: {
    district: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  interestedCrops: string[];
  priceRange: {
    min: number;
    max: number;
  };
  businessType: string;
  verified: boolean;
  rating?: number;
  createdAt?: Date;
}

// Dashboard Types
export interface DashboardSummary {
  totalFields: number;
  activeFields: number;
  totalCrops: number;
  totalQueries: number;
  recentActivity: any[];
}

// Weather Types
export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  location: string;
  date: Date;
}

// Growth tracking
export interface GrowthData {
  _id?: string;
  fieldId: string;
  stage: string;
  date: Date;
  notes?: string;
  images?: string[];
  measurements?: {
    height?: number;
    healthScore?: number;
  };
}

// Component Props Types
export interface DashboardProps {
  user: UserData;
}

export interface FieldDashboardProps {
  fieldId: string;
  user: UserData;
}

export interface MarketplaceProps {
  location: {
    district: string;
    state: string;
  };
}

// Utility Types
export type SoilType = 'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty' | 'chalky' | 'mixed';
export type Season = 'Kharif' | 'Rabi' | 'Zaid';
export type UserRole = 'farmer' | 'expert' | 'admin';
export type QueryCategory = 'crop' | 'pest' | 'disease' | 'fertilizer' | 'market' | 'weather' | 'other';
export type QueryStatus = 'open' | 'resolved';
export type FieldStatus = 'pending' | 'active' | 'harvested' | 'inactive';
