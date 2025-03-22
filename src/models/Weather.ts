import mongoose, { Schema, Document } from 'mongoose';

export interface IWeather extends Document {
  location: {
    district: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  date: Date;
  temperature: {
    min: number;
    max: number;
    unit: string;
  };
  humidity: number;
  rainfall: {
    amount: number;
    unit: string;
  };
  windSpeed: {
    value: number;
    unit: string;
  };
  forecast: {
    date: Date;
    temperature: {
      min: number;
      max: number;
    };
    humidity: number;
    rainfall: {
      amount: number;
      unit: string;
    };
    description: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const WeatherSchema: Schema = new Schema(
  {
    location: {
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
      coordinates: {
        latitude: {
          type: Number,
        },
        longitude: {
          type: Number,
        },
      },
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    temperature: {
      min: {
        type: Number,
        required: [true, 'Please provide a minimum temperature'],
      },
      max: {
        type: Number,
        required: [true, 'Please provide a maximum temperature'],
      },
      unit: {
        type: String,
        default: 'Celsius',
      },
    },
    humidity: {
      type: Number,
      required: [true, 'Please provide humidity'],
    },
    rainfall: {
      amount: {
        type: Number,
        required: [true, 'Please provide rainfall amount'],
      },
      unit: {
        type: String,
        default: 'mm',
      },
    },
    windSpeed: {
      value: {
        type: Number,
        required: [true, 'Please provide wind speed'],
      },
      unit: {
        type: String,
        default: 'km/h',
      },
    },
    forecast: [
      {
        date: {
          type: Date,
          required: true,
        },
        temperature: {
          min: {
            type: Number,
            required: true,
          },
          max: {
            type: Number,
            required: true,
          },
        },
        humidity: {
          type: Number,
          required: true,
        },
        rainfall: {
          amount: {
            type: Number,
            required: true,
          },
          unit: {
            type: String,
            default: 'mm',
          },
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Create a compound index for location and date
WeatherSchema.index({ 'location.district': 1, 'location.state': 1, date: 1 }, { unique: true });

export default mongoose.models.Weather || mongoose.model<IWeather>('Weather', WeatherSchema); 