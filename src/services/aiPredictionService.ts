import { IField, ICropPlan, CropPlan } from '@/lib/database/models';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';


export interface CropRecommendation {
  crop: string;
  variety: string;
  predictedYield: number;
  confidence: number;
  reasons: string[];
  plantingWindow: {
    start: Date;
    end: Date;
  };
  harvestWindow: {
    start: Date;
    end: Date;
  };
}

export interface CostAnalysis {
  seeds: { cost: number; quantity: number; unit: string };
  fertilizers: Array<{ name: string; cost: number; quantity: number; unit: string }>;
  pesticides: Array<{ name: string; cost: number; quantity: number; unit: string }>;
  labor: { cost: number; hours: number };
  irrigation: { cost: number; type: string };
  equipment: { cost: number; items: string[] };
  total: number;
}

export interface ExpectedRevenue {
  cropPrice: number;
  totalRevenue: number;
  profit: number;
  profitMargin: number;
}

export interface PredictionInput {
  fieldId: string;
  userId: string;
  fieldData: IField;
  preferences?: {
    preferredCrops?: string[];
    budgetConstraints?: number;
    organicPreferred?: boolean;
    timeframe?: 'short' | 'medium' | 'long';
  };
}

// Mock crop database - In production, this would be a comprehensive database
const CROP_DATABASE = {
  wheat: {
    varieties: ['HD-2967', 'PBW-550', 'WH-542', 'DBW-88'],
    soilPreference: ['loamy', 'clay'],
    phRange: [6.0, 7.5],
    seasonalTiming: {
      planting: { start: 11, end: 12 }, // November-December
      harvest: { start: 3, end: 5 } // March-May
    },
    yieldPotential: { min: 35, max: 65 }, // quintals per hectare
    baseCosts: {
      seeds: { cost: 2500, quantity: 50, unit: 'kg' },
      fertilizers: [
        { name: 'Urea', cost: 1500, quantity: 100, unit: 'kg' },
        { name: 'DAP', cost: 2000, quantity: 50, unit: 'kg' },
        { name: 'Potash', cost: 1200, quantity: 25, unit: 'kg' }
      ],
      pesticides: [
        { name: 'Herbicide', cost: 800, quantity: 2, unit: 'liters' }
      ]
    },
    marketPrice: 2100 // per quintal
  },
  rice: {
    varieties: ['Basmati-370', 'PR-126', 'Pusa-44', 'CSR-30'],
    soilPreference: ['clay', 'silt'],
    phRange: [5.5, 7.0],
    seasonalTiming: {
      planting: { start: 6, end: 7 }, // June-July
      harvest: { start: 10, end: 11 } // October-November
    },
    yieldPotential: { min: 40, max: 70 },
    baseCosts: {
      seeds: { cost: 3000, quantity: 30, unit: 'kg' },
      fertilizers: [
        { name: 'Urea', cost: 2000, quantity: 120, unit: 'kg' },
        { name: 'DAP', cost: 2500, quantity: 60, unit: 'kg' }
      ],
      pesticides: [
        { name: 'Insecticide', cost: 1200, quantity: 3, unit: 'liters' }
      ]
    },
    marketPrice: 2800
  },
  maize: {
    varieties: ['Pioneer-3396', 'NK-6240', 'DKC-9108', 'Monsanto-900M'],
    soilPreference: ['loamy', 'sandy', 'clay'],
    phRange: [6.0, 7.0],
    seasonalTiming: {
      planting: { start: 6, end: 7 },
      harvest: { start: 10, end: 11 }
    },
    yieldPotential: { min: 60, max: 110 },
    baseCosts: {
      seeds: { cost: 4000, quantity: 20, unit: 'kg' },
      fertilizers: [
        { name: 'Urea', cost: 1800, quantity: 150, unit: 'kg' },
        { name: 'DAP', cost: 2200, quantity: 75, unit: 'kg' }
      ],
      pesticides: [
        { name: 'Herbicide', cost: 900, quantity: 2.5, unit: 'liters' }
      ]
    },
    marketPrice: 2200
  },
  cotton: {
    varieties: ['Bt-Cotton-1', 'RCH-650', 'MRC-7347', 'Bollgard-II'],
    soilPreference: ['clay', 'loamy'],
    phRange: [5.8, 8.0],
    seasonalTiming: {
      planting: { start: 4, end: 6 },
      harvest: { start: 10, end: 12 }
    },
    yieldPotential: { min: 15, max: 35 }, // quintals per hectare
    baseCosts: {
      seeds: { cost: 5500, quantity: 4, unit: 'kg' },
      fertilizers: [
        { name: 'Urea', cost: 2500, quantity: 200, unit: 'kg' },
        { name: 'DAP', cost: 3000, quantity: 100, unit: 'kg' }
      ],
      pesticides: [
        { name: 'Insecticide', cost: 2000, quantity: 5, unit: 'liters' },
        { name: 'Fungicide', cost: 1500, quantity: 3, unit: 'liters' }
      ]
    },
    marketPrice: 6500
  },
  sugarcane: {
    varieties: ['Co-0238', 'CoJ-64', 'Co-86032', 'CoLk-94184'],
    soilPreference: ['loamy', 'clay'],
    phRange: [6.5, 7.5],
    seasonalTiming: {
      planting: { start: 2, end: 4 },
      harvest: { start: 12, end: 2 } // Next year
    },
    yieldPotential: { min: 600, max: 1200 },
    baseCosts: {
      seeds: { cost: 8000, quantity: 40000, unit: 'setts' },
      fertilizers: [
        { name: 'Urea', cost: 4000, quantity: 300, unit: 'kg' },
        { name: 'DAP', cost: 5000, quantity: 200, unit: 'kg' }
      ],
      pesticides: [
        { name: 'Herbicide', cost: 1200, quantity: 4, unit: 'liters' }
      ]
    },
    marketPrice: 350 // per quintal
  }
};

export class AIPredictionService {
  static async generateCropRecommendations(input: PredictionInput): Promise<CropRecommendation[]> {
    const { fieldData, preferences } = input;
    const recommendations: CropRecommendation[] = [];

    // Analyze field conditions
    const soilType = fieldData.soilProfile.type;
    const ph = fieldData.soilProfile.ph;
    const fieldSize = fieldData.size;
    const location = fieldData.location.coordinates;

    // Get current season
    const currentMonth = new Date().getMonth() + 1;

    // Evaluate each crop
    for (const [cropName, cropData] of Object.entries(CROP_DATABASE)) {
      let confidence = 0;
      const reasons: string[] = [];

      // Soil compatibility check
      if (cropData.soilPreference.includes(soilType)) {
        confidence += 25;
        reasons.push(`Excellent soil compatibility with ${soilType} soil`);
      } else {
        confidence += 10;
        reasons.push(`Moderate compatibility with ${soilType} soil`);
      }

      // pH compatibility check
      if (ph >= cropData.phRange[0] && ph <= cropData.phRange[1]) {
        confidence += 20;
        reasons.push(`Optimal pH range (${cropData.phRange[0]}-${cropData.phRange[1]})`);
      } else if (ph >= cropData.phRange[0] - 0.5 && ph <= cropData.phRange[1] + 0.5) {
        confidence += 10;
        reasons.push(`Acceptable pH range with minor adjustments needed`);
      } else {
        confidence -= 10;
        reasons.push(`pH adjustment required for optimal growth`);
      }

      // Seasonal timing check
      const plantingStart = cropData.seasonalTiming.planting.start;
      const plantingEnd = cropData.seasonalTiming.planting.end;
      
      if (currentMonth >= plantingStart && currentMonth <= plantingEnd) {
        confidence += 20;
        reasons.push('Perfect planting season');
      } else if (
        (currentMonth >= plantingStart - 1 && currentMonth <= plantingEnd + 1) ||
        (plantingStart > plantingEnd && (currentMonth >= plantingStart - 1 || currentMonth <= plantingEnd + 1))
      ) {
        confidence += 10;
        reasons.push('Good planting season with slight timing adjustments');
      } else {
        confidence -= 15;
        reasons.push('Off-season planting - consider seasonal timing');
      }

      // Previous crop history analysis
      const previousCrops = fieldData.previousCrops || [];
      const lastCrop = previousCrops.find(crop => crop.year === new Date().getFullYear() - 1);
      
      if (lastCrop && lastCrop.crop === cropName) {
        confidence -= 10;
        reasons.push('Same crop grown last year - rotation recommended');
      } else if (lastCrop) {
        confidence += 5;
        reasons.push('Good crop rotation practice');
      }

      // Nutrient analysis
      const { nitrogen, phosphorus, potassium } = fieldData.soilProfile.nutrients;
      let nutrientScore = 0;

      if (nitrogen >= 50) nutrientScore += 5;
      if (phosphorus >= 30) nutrientScore += 5;
      if (potassium >= 40) nutrientScore += 5;

      confidence += nutrientScore;
      if (nutrientScore > 10) {
        reasons.push('Excellent nutrient profile');
      } else if (nutrientScore > 5) {
        reasons.push('Good nutrient levels with minor supplements needed');
      } else {
        reasons.push('Nutrient supplementation recommended');
      }

      // Organic matter check
      if (fieldData.soilProfile.organicMatter >= 2.5) {
        confidence += 5;
        reasons.push('Good organic matter content');
      } else {
        reasons.push('Consider organic matter enhancement');
      }

      // Field size suitability
      if (fieldSize >= 0.5 && fieldSize <= 10) {
        confidence += 5;
        reasons.push('Optimal field size for mechanization');
      }

      // User preferences
      if (preferences?.preferredCrops?.includes(cropName)) {
        confidence += 10;
        reasons.push('Matches your crop preferences');
      }

      // Ensure confidence is within bounds
      confidence = Math.max(0, Math.min(100, confidence));

      // Only include crops with reasonable confidence
      if (confidence >= 30) {
        // Calculate yield prediction
        const baseYield = (cropData.yieldPotential.min + cropData.yieldPotential.max) / 2;
        const yieldAdjustment = (confidence / 100) * 0.3; // Max 30% adjustment
        const predictedYield = Math.round(baseYield * (0.7 + yieldAdjustment) * fieldSize);

        // Calculate planting and harvest windows
        const currentYear = new Date().getFullYear();
        const plantingStartDate = new Date(currentYear, cropData.seasonalTiming.planting.start - 1, 1);
        const plantingEndDate = new Date(currentYear, cropData.seasonalTiming.planting.end - 1, 28);
        
        let harvestStart = new Date(currentYear, cropData.seasonalTiming.harvest.start - 1, 1);
        let harvestEnd = new Date(currentYear, cropData.seasonalTiming.harvest.end - 1, 28);
        
        // Handle cross-year crops like sugarcane
        if (cropData.seasonalTiming.harvest.start < cropData.seasonalTiming.planting.start) {
          harvestStart = new Date(currentYear + 1, cropData.seasonalTiming.harvest.start - 1, 1);
          harvestEnd = new Date(currentYear + 1, cropData.seasonalTiming.harvest.end - 1, 28);
        }

        // Select best variety
        const selectedVariety = cropData.varieties[0]; // In production, this would be more sophisticated

        recommendations.push({
          crop: cropName,
          variety: selectedVariety,
          predictedYield,
          confidence: Math.round(confidence),
          reasons,
          plantingWindow: { start: plantingStartDate, end: plantingEndDate },
          harvestWindow: { start: harvestStart, end: harvestEnd }
        });
      }
    }

    // Sort by confidence
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  static calculateCostAnalysis(crop: string, fieldSize: number, customizations?: any): CostAnalysis {
    const cropData = CROP_DATABASE[crop as keyof typeof CROP_DATABASE];
    
    if (!cropData) {
      throw new Error(`Crop data not found for ${crop}`);
    }

    const baseCosts = cropData.baseCosts;

    // Scale costs based on field size
    const seeds = {
      cost: Math.round(baseCosts.seeds.cost * fieldSize),
      quantity: Math.round(baseCosts.seeds.quantity * fieldSize),
      unit: baseCosts.seeds.unit
    };

    const fertilizers = baseCosts.fertilizers.map(fert => ({
      ...fert,
      cost: Math.round(fert.cost * fieldSize),
      quantity: Math.round(fert.quantity * fieldSize)
    }));

    const pesticides = baseCosts.pesticides.map(pest => ({
      ...pest,
      cost: Math.round(pest.cost * fieldSize),
      quantity: Math.round(pest.quantity * fieldSize * 10) / 10
    }));

    // Calculate labor costs (varies by crop and field size)
    const laborHoursPerHectare = {
      wheat: 40,
      rice: 60,
      maize: 45,
      cotton: 80,
      sugarcane: 120
    };

    const laborHours = Math.round((laborHoursPerHectare[crop as keyof typeof laborHoursPerHectare] || 50) * fieldSize);
    const laborCost = laborHours * 250; // ₹250 per hour

    const labor = {
      cost: laborCost,
      hours: laborHours
    };

    // Calculate irrigation costs
    const irrigationCostPerHectare = 5000; // Base cost
    const irrigation = {
      cost: Math.round(irrigationCostPerHectare * fieldSize),
      type: 'drip irrigation'
    };

    // Calculate equipment costs
    const equipmentItems = ['plowing', 'seeding', 'harvesting'];
    const equipmentCostPerHectare = 3000;
    const equipment = {
      cost: Math.round(equipmentCostPerHectare * fieldSize),
      items: equipmentItems
    };

    // Calculate total
    const total = seeds.cost + 
                 fertilizers.reduce((sum, fert) => sum + fert.cost, 0) +
                 pesticides.reduce((sum, pest) => sum + pest.cost, 0) +
                 labor.cost +
                 irrigation.cost +
                 equipment.cost;

    return {
      seeds,
      fertilizers,
      pesticides,
      labor,
      irrigation,
      equipment,
      total: Math.round(total)
    };
  }

  static calculateExpectedRevenue(crop: string, predictedYield: number, costAnalysis: CostAnalysis): ExpectedRevenue {
    const cropData = CROP_DATABASE[crop as keyof typeof CROP_DATABASE];
    
    if (!cropData) {
      throw new Error(`Crop data not found for ${crop}`);
    }

    const cropPrice = cropData.marketPrice;
    const totalRevenue = Math.round(predictedYield * cropPrice);
    const profit = totalRevenue - costAnalysis.total;
    const profitMargin = costAnalysis.total > 0 ? Math.round((profit / totalRevenue) * 100) : 0;

    return {
      cropPrice,
      totalRevenue,
      profit,
      profitMargin
    };
  }

  static async generateCropPlan(input: PredictionInput): Promise<ICropPlan> {
    await connectDB();

    const { userId, fieldId } = input;

    // Generate recommendations
    const recommendations = await this.generateCropRecommendations(input);
    
    if (recommendations.length === 0) {
      throw new Error('No suitable crops found for this field');
    }

    // Calculate cost analysis for each recommendation
    const recommendationsWithCosts = recommendations.map(rec => {
      const costAnalysis = this.calculateCostAnalysis(rec.crop, input.fieldData.size);
      const expectedRevenue = this.calculateExpectedRevenue(rec.crop, rec.predictedYield, costAnalysis);
      
      return {
        ...rec,
        costAnalysis,
        expectedRevenue
      };
    });

    // Use the top recommendation for cost analysis
    const topRecommendation = recommendationsWithCosts[0];
    
    const cropPlan = new CropPlan({
      userId: new mongoose.Types.ObjectId(userId),
      fieldId: new mongoose.Types.ObjectId(fieldId),
      recommendedCrops: recommendations,
      costAnalysis: topRecommendation.costAnalysis,
      expectedRevenue: topRecommendation.expectedRevenue,
      status: 'pending',
      aiModelVersion: 'v1.0.0'
    });

    await cropPlan.save();
    return cropPlan;
  }

  static async acceptCropPlan(
    userId: string, 
    cropPlanId: string, 
    selectedCrop: {
      crop: string;
      variety: string;
      plantingDate?: Date;
      notes?: string;
      modifiedCosts?: any;
    }
  ): Promise<ICropPlan | null> {
    await connectDB();

    const cropPlan = await CropPlan.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(cropPlanId),
        userId: new mongoose.Types.ObjectId(userId)
      },
      {
        $set: {
          status: 'accepted',
          selectedCrop,
          respondedAt: new Date()
        }
      },
      { new: true }
    ).lean();

    return cropPlan as ICropPlan | null;
  }

  static async rejectCropPlan(userId: string, cropPlanId: string): Promise<boolean> {
    await connectDB();

    const result = await CropPlan.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(cropPlanId),
        userId: new mongoose.Types.ObjectId(userId)
      },
      {
        $set: {
          status: 'rejected',
          respondedAt: new Date()
        }
      }
    );

    return !!result;
  }

  static async getCropPlans(
    userId: string,
    options: {
      fieldId?: string;
      status?: string;
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<{ cropPlans: ICropPlan[]; total: number }> {
    await connectDB();

    const { fieldId, status, limit = 10, skip = 0 } = options;

    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (fieldId) {
      query.fieldId = new mongoose.Types.ObjectId(fieldId);
    }
    
    if (status) {
      query.status = status;
    }

    const [cropPlans, total] = await Promise.all([
      CropPlan.find(query)
        .populate('fieldId', 'name location.address')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      CropPlan.countDocuments(query)
    ]);

    return { cropPlans: cropPlans as ICropPlan[], total };
  }
}

export default AIPredictionService;
