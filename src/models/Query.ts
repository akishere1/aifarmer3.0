import mongoose, { Schema, Document } from 'mongoose';

export interface IQuery extends Document {
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
  askedBy: mongoose.Types.ObjectId;
  answers: {
    content: string;
    answeredBy: mongoose.Types.ObjectId;
    answeredAt: Date;
    upvotes: number;
    isAccepted: boolean;
  }[];
  status: 'open' | 'resolved';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuerySchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for your query'],
      trim: true,
      minlength: [10, 'Title should be at least 10 characters long'],
      maxlength: [100, 'Title should not exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description for your query'],
      minlength: [20, 'Description should be at least 20 characters long'],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Please select a category for your query'],
      enum: ['crop', 'pest', 'disease', 'fertilizer', 'market', 'weather', 'other'],
    },
    cropName: {
      type: String,
    },
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
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the user who asked this query'],
    },
    answers: [
      {
        content: {
          type: String,
          required: [true, 'Please provide content for your answer'],
          minlength: [20, 'Answer should be at least 20 characters long'],
        },
        answeredBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: [true, 'Please provide the user who answered this query'],
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
        upvotes: {
          type: Number,
          default: 0,
        },
        isAccepted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
QuerySchema.index({ category: 1, status: 1 });
QuerySchema.index({ 'location.district': 1, 'location.state': 1 });
QuerySchema.index({ askedBy: 1 });
QuerySchema.index({ tags: 1 });

export default mongoose.models.Query || mongoose.model<IQuery>('Query', QuerySchema); 