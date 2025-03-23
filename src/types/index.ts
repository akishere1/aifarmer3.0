export interface Field {
  _id: string;
  name: string;
  location: string;
  landArea: number;
  soilType: string;
  waterLevel: number;
  temperature: number;
  season: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CropPrediction {
  predictedCrop: string;
  confidence: number;
  suitableCrops: {
    crop: string;
    score: number;
  }[];
  lastUpdated: string;
}

export interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  forecast: {
    date: string;
    condition: string;
    temperature: number;
    precipitation: number;
  }[];
  lastUpdated: string;
}

export interface GrowthData {
  date: string;
  stage: string;
  healthStatus: string;
  height: number;
  notes: string;
}

export interface Recommendations {
  watering: {
    frequency: string;
    amount: number;
    notes: string;
  };
  fertilizing: {
    type: string;
    frequency: string;
    amount: number;
    notes: string;
  };
  pestControl: {
    type: string;
    frequency: string;
    notes: string;
  };
  harvesting: {
    estimatedDate: string;
    notes: string;
  };
}

export interface FieldData {
  field: Field;
  weather: WeatherData;
  growthHistory: GrowthData[];
  recommendations?: Recommendations;
} 