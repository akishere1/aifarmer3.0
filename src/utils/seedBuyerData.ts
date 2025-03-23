import mongoose from 'mongoose';
import Buyer from '@/models/Buyer';

// Function to connect to MongoDB
async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) return;
    
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aifarm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Sample buyer data
const buyerData = [
  {
    name: 'Organic Foods Co.',
    location: 'Bengaluru, Karnataka',
    contactInfo: {
      phone: '+91 9876543210',
      email: 'purchase@organicfoods.com',
    },
    interestedCrops: ['Rice', 'Wheat', 'Vegetables'],
    offerPrice: {
      'Rice': 25,
      'Wheat': 22,
      'Vegetables': 18
    },
    coordinates: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    additionalInfo: 'We are looking for certified organic produce. We can provide transportation if the quantity is more than 500kg. We pay premium prices for certified organic produce.',
    buyingPreferences: {
      minQuantity: 100,
      regularSupplier: true,
      transportAvailable: true,
      paymentTerms: 'immediate',
      organicPreference: true
    }
  },
  {
    name: 'Green Harvest Buyers',
    location: 'Mysuru, Karnataka',
    contactInfo: {
      phone: '+91 9988776655',
      email: 'buy@greenharvest.com',
    },
    interestedCrops: ['Rice', 'Maize', 'Fruits'],
    offerPrice: {
      'Rice': 24,
      'Maize': 19,
      'Fruits': 35
    },
    coordinates: {
      latitude: 12.2958,
      longitude: 76.6394
    },
    additionalInfo: 'We supply to export markets and have strict quality requirements. Looking for consistent suppliers for long-term contracts.',
    buyingPreferences: {
      minQuantity: 200,
      regularSupplier: true,
      transportAvailable: false,
      paymentTerms: 'weekly',
      organicPreference: true
    }
  },
  {
    name: 'Farm Fresh Direct',
    location: 'Bengaluru, Karnataka',
    contactInfo: {
      phone: '+91 8765432109',
      email: 'procurement@farmfresh.com',
    },
    interestedCrops: ['Vegetables', 'Fruits', 'Herbs'],
    offerPrice: {
      'Vegetables': 20,
      'Fruits': 38,
      'Herbs': 45
    },
    coordinates: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    additionalInfo: 'We are a farm-to-table supplier for restaurants and hotels. Looking for fresh, high-quality produce delivered within 24 hours of harvest.',
    buyingPreferences: {
      minQuantity: 50,
      regularSupplier: true,
      transportAvailable: false,
      paymentTerms: 'immediate',
      organicPreference: false
    }
  },
  {
    name: 'AgriExport International',
    location: 'Chennai, Tamil Nadu',
    contactInfo: {
      phone: '+91 7788990011',
      email: 'exports@agriexport.com',
    },
    interestedCrops: ['Rice', 'Cotton', 'Spices'],
    offerPrice: {
      'Rice': 26,
      'Cotton': 75,
      'Spices': 120
    },
    coordinates: {
      latitude: 13.0827,
      longitude: 80.2707
    },
    additionalInfo: 'International exporter with connections to Middle East and European markets. We require produce that meets international certification standards.',
    buyingPreferences: {
      minQuantity: 500,
      regularSupplier: true,
      transportAvailable: true,
      paymentTerms: 'monthly',
      organicPreference: true
    }
  },
  {
    name: 'Local Market Association',
    location: 'Hosur, Tamil Nadu',
    contactInfo: {
      phone: '+91 9090909090',
      email: 'contact@localmarket.org',
    },
    interestedCrops: ['Rice', 'Wheat', 'Vegetables', 'Fruits', 'Maize'],
    offerPrice: {
      'Rice': 23,
      'Wheat': 21,
      'Vegetables': 17,
      'Fruits': 32,
      'Maize': 18
    },
    coordinates: {
      latitude: 12.7409,
      longitude: 77.8253
    },
    additionalInfo: 'We represent a coalition of local markets and can offer immediate cash payment upon delivery. No minimum quantity requirements.',
    buyingPreferences: {
      minQuantity: 0,
      regularSupplier: false,
      transportAvailable: false,
      paymentTerms: 'immediate',
      organicPreference: false
    }
  },
  {
    name: 'Eco Friendly Foods',
    location: 'Bengaluru, Karnataka',
    contactInfo: {
      phone: '+91 9555000111',
      email: 'purchase@ecofriendlyfoods.com',
    },
    interestedCrops: ['Vegetables', 'Fruits', 'Grains', 'Pulses'],
    offerPrice: {
      'Vegetables': 22,
      'Fruits': 40,
      'Grains': 30,
      'Pulses': 60
    },
    coordinates: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    additionalInfo: 'We focus on environmentally sustainable farming practices. Looking for farmers who use minimal pesticides and follow natural farming techniques.',
    buyingPreferences: {
      minQuantity: 100,
      regularSupplier: false,
      transportAvailable: false,
      paymentTerms: 'weekly',
      organicPreference: true
    }
  },
  {
    name: 'Daily Fresh Supply Co.',
    location: 'Electronic City, Bengaluru',
    contactInfo: {
      phone: '+91 8844556677',
      email: 'sourcing@dailyfresh.com',
    },
    interestedCrops: ['Vegetables', 'Fruits', 'Herbs', 'Leafy Greens'],
    offerPrice: {
      'Vegetables': 19,
      'Fruits': 36,
      'Herbs': 42,
      'Leafy Greens': 25
    },
    coordinates: {
      latitude: 12.8458,
      longitude: 77.6716
    },
    additionalInfo: 'We supply fresh produce to supermarkets and retail chains. Require consistent quality and reliable delivery schedule.',
    buyingPreferences: {
      minQuantity: 150,
      regularSupplier: true,
      transportAvailable: true,
      paymentTerms: 'weekly',
      organicPreference: false
    }
  }
];

// Function to seed the database
export async function seedBuyerData() {
  try {
    await connectDB();
    
    // Check if buyers already exist
    const existingCount = await Buyer.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} buyers. Skipping seed.`);
      return;
    }
    
    // Clear existing data
    await Buyer.deleteMany({});
    
    // Convert offerPrice to Map objects
    const formattedBuyerData = buyerData.map(buyer => {
      // Convert offerPrice from object to Map if needed
        let offerPriceMap: Map<string, number> | undefined;
      if (buyer.offerPrice && typeof buyer.offerPrice === 'object') {
        offerPriceMap = new Map<string, number>();
        Object.entries(buyer.offerPrice).forEach(([crop, price]) => {
          offerPriceMap!.set(crop, price as number);
        });
      }
      
      return {
        ...buyer,
        offerPrice: offerPriceMap,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    
    // Insert buyers
    await Buyer.insertMany(formattedBuyerData);
    
    console.log(`✅ Successfully seeded ${buyerData.length} buyers!`);
  } catch (error) {
    console.error('Error seeding buyer data:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedBuyerData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 