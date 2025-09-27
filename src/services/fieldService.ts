import { IField, Field, CropPlan, MonitoringEvent } from '@/lib/database/models';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export interface CreateFieldData {
  name: string;
  location: {
    address: string;
    coordinates: [number, number];
    boundary?: {
      type: 'Polygon';
      coordinates: [Array<[number, number]>];
    };
  };
  size: number;
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
  };
  previousCrops?: Array<{
    crop: string;
    year: number;
    yield: number;
    notes?: string;
  }>;
}

export interface UpdateFieldData extends Partial<CreateFieldData> {
  currentStatus?: 'active' | 'fallow' | 'preparation' | 'harvested';
}

export class FieldService {
  static async create(userId: string, fieldData: CreateFieldData): Promise<IField> {
    await connectDB();
    
    const field = new Field({
      userId: new mongoose.Types.ObjectId(userId),
      ...fieldData,
    });

    await field.save();
    return field;
  }

  static async getAll(
    userId: string, 
    options: {
      status?: string[];
      limit?: number;
      skip?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ fields: IField[]; total: number }> {
    await connectDB();

    const {
      status,
      limit = 10,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (status && status.length > 0) {
      query.currentStatus = { $in: status };
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [fields, total] = await Promise.all([
      Field.find(query)
        .sort(sortOptions)
        .limit(limit)
        .skip(skip)
        .lean(),
      Field.countDocuments(query)
    ]);

    return { fields: fields as IField[], total };
  }

  static async getById(userId: string, fieldId: string): Promise<IField | null> {
    await connectDB();
    
    const field = await Field.findOne({
      _id: new mongoose.Types.ObjectId(fieldId),
      userId: new mongoose.Types.ObjectId(userId)
    }).lean();

    return field as IField | null;
  }

  static async update(userId: string, fieldId: string, updates: UpdateFieldData): Promise<IField | null> {
    await connectDB();
    
    const field = await Field.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(fieldId),
        userId: new mongoose.Types.ObjectId(userId)
      },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    return field as IField | null;
  }

  static async delete(userId: string, fieldId: string): Promise<boolean> {
    await connectDB();
    
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Delete the field
        const deletedField = await Field.findOneAndDelete({
          _id: new mongoose.Types.ObjectId(fieldId),
          userId: new mongoose.Types.ObjectId(userId)
        }).session(session);

        if (!deletedField) {
          throw new Error('Field not found');
        }

        // Delete related crop plans
        await CropPlan.deleteMany({
          fieldId: new mongoose.Types.ObjectId(fieldId),
          userId: new mongoose.Types.ObjectId(userId)
        }).session(session);

        // Delete related monitoring events
        await MonitoringEvent.deleteMany({
          fieldId: new mongoose.Types.ObjectId(fieldId),
          userId: new mongoose.Types.ObjectId(userId)
        }).session(session);
      });

      return true;
    } catch (error) {
      console.error('Error deleting field:', error);
      return false;
    } finally {
      await session.endSession();
    }
  }

  static async getFieldStatistics(userId: string, fieldId?: string): Promise<{
    totalFields: number;
    activeFields: number;
    totalArea: number;
    averageHealth: number;
    statusDistribution: Record<string, number>;
    soilTypeDistribution: Record<string, number>;
  }> {
    await connectDB();

    const baseQuery: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (fieldId) {
      baseQuery._id = new mongoose.Types.ObjectId(fieldId);
    }

    const aggregation = [
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          totalFields: { $sum: 1 },
          totalArea: { $sum: '$size' },
          statusDistribution: {
            $push: '$currentStatus'
          },
          soilTypeDistribution: {
            $push: '$soilProfile.type'
          }
        }
      }
    ];

    const [stats] = await Field.aggregate(aggregation);
    
    if (!stats) {
      return {
        totalFields: 0,
        activeFields: 0,
        totalArea: 0,
        averageHealth: 0,
        statusDistribution: {},
        soilTypeDistribution: {}
      };
    }

    // Calculate status distribution
    const statusDistribution: Record<string, number> = {};
    stats.statusDistribution.forEach((status: string) => {
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });

    // Calculate soil type distribution
    const soilTypeDistribution: Record<string, number> = {};
    stats.soilTypeDistribution.forEach((type: string) => {
      soilTypeDistribution[type] = (soilTypeDistribution[type] || 0) + 1;
    });

    // Get active fields count
    const activeFields = statusDistribution['active'] || 0;

    // Calculate average health from recent crop plans
    const healthAggregation = await CropPlan.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'accepted' } },
      { $group: { _id: null, avgConfidence: { $avg: '$selectedCrop.confidence' } } }
    ]);

    const averageHealth = healthAggregation.length > 0 ? healthAggregation[0].avgConfidence || 0 : 0;

    return {
      totalFields: stats.totalFields,
      activeFields,
      totalArea: stats.totalArea,
      averageHealth: Math.round(averageHealth),
      statusDistribution,
      soilTypeDistribution
    };
  }

  static async getNearbyFields(
    coordinates: [number, number],
    radiusInKm: number = 10,
    excludeUserId?: string
  ): Promise<IField[]> {
    await connectDB();

    const query: any = {
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: radiusInKm * 1000 // Convert to meters
        }
      }
    };

    if (excludeUserId) {
      query.userId = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
    }

    const fields = await Field.find(query)
      .limit(20)
      .select('-soilProfile.nutrients') // Exclude sensitive data
      .populate('userId', 'name profile.farmName')
      .lean();

    return fields as IField[];
  }

  static async validateFieldData(fieldData: CreateFieldData): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate name
    if (!fieldData.name || fieldData.name.trim().length < 2) {
      errors.push('Field name must be at least 2 characters long');
    }

    // Validate size
    if (!fieldData.size || fieldData.size <= 0) {
      errors.push('Field size must be greater than 0');
    }

    if (fieldData.size > 10000) {
      errors.push('Field size cannot exceed 10,000 hectares');
    }

    // Validate coordinates
    const [lng, lat] = fieldData.location.coordinates;
    if (lng < -180 || lng > 180) {
      errors.push('Invalid longitude coordinate');
    }
    if (lat < -90 || lat > 90) {
      errors.push('Invalid latitude coordinate');
    }

    // Validate soil profile
    if (fieldData.soilProfile.ph < 0 || fieldData.soilProfile.ph > 14) {
      errors.push('Soil pH must be between 0 and 14');
    }

    const { nitrogen, phosphorus, potassium } = fieldData.soilProfile.nutrients;
    if (nitrogen < 0 || nitrogen > 100) {
      errors.push('Nitrogen level must be between 0 and 100');
    }
    if (phosphorus < 0 || phosphorus > 100) {
      errors.push('Phosphorus level must be between 0 and 100');
    }
    if (potassium < 0 || potassium > 100) {
      errors.push('Potassium level must be between 0 and 100');
    }

    if (fieldData.soilProfile.organicMatter < 0 || fieldData.soilProfile.organicMatter > 100) {
      errors.push('Organic matter must be between 0 and 100%');
    }

    if (fieldData.soilProfile.moisture < 0 || fieldData.soilProfile.moisture > 100) {
      errors.push('Soil moisture must be between 0 and 100%');
    }

    // Validate previous crops
    if (fieldData.previousCrops) {
      const currentYear = new Date().getFullYear();
      for (const crop of fieldData.previousCrops) {
        if (crop.year > currentYear || crop.year < currentYear - 10) {
          errors.push(`Crop year ${crop.year} is invalid`);
        }
        if (crop.yield < 0) {
          errors.push('Crop yield cannot be negative');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default FieldService;
