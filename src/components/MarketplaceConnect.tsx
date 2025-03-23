import React, { useState, useEffect } from 'react';
import { FiPhone, FiMail, FiMapPin, FiDollarSign, FiUsers, FiSearch, FiFilter, FiRefreshCw, FiStar, FiTrendingUp, FiCheck, FiClock } from 'react-icons/fi';
import axios from 'axios';
import BuyerDetailsModal from './BuyerDetailsModal';
import { calculateAddressDistance } from '../utils/locationUtils';
import '../styles/animations.css'; // Import animations

interface Buyer {
  _id: string;
  name: string;
  location: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  interestedCrops: string[];
  offerPrice?: {
    [crop: string]: number;
  };
  distance?: number; // Distance from farmer in km
  additionalInfo?: string;
}

interface MarketplaceConnectProps {
  farmerLocation: string;
  farmerCrops: string[];
}

const MarketplaceConnect: React.FC<MarketplaceConnectProps> = ({ farmerLocation, farmerCrops }) => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [sortBy, setSortBy] = useState<string>('distance');
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);

  // Mock data for buyers (replace with actual API call)
  const mockBuyers: Buyer[] = [
    {
      _id: '1',
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
      distance: 5.3,
      additionalInfo: 'We are looking for certified organic produce. We can provide transportation if the quantity is more than 500kg. We pay premium prices for certified organic produce.'
    },
    {
      _id: '2',
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
      distance: 15.7,
      additionalInfo: 'We supply to export markets and have strict quality requirements. Looking for consistent suppliers for long-term contracts.'
    },
    {
      _id: '3',
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
      distance: 8.2,
      additionalInfo: 'We are a farm-to-table supplier for restaurants and hotels. Looking for fresh, high-quality produce delivered within 24 hours of harvest.'
    },
    {
      _id: '4',
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
      distance: 35.1,
      additionalInfo: 'International exporter with connections to Middle East and European markets. We require produce that meets international certification standards.'
    },
    {
      _id: '5',
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
      distance: 22.8,
      additionalInfo: 'We represent a coalition of local markets and can offer immediate cash payment upon delivery. No minimum quantity requirements.'
    },
    {
      _id: '6',
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
      distance: 3.8,
      additionalInfo: 'We focus on environmentally sustainable farming practices. Looking for farmers who use minimal pesticides and follow natural farming techniques.'
    },
    {
      _id: '7',
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
      distance: 7.2,
      additionalInfo: 'We supply fresh produce to supermarkets and retail chains. Require consistent quality and reliable delivery schedule.'
    }
  ];

  // Fetch buyers
  const fetchBuyers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call our API endpoint with API key header
      const response = await axios.get('/api/marketplace/buyers', { 
        params: { 
          location: farmerLocation,
          crop: filterCrop !== 'all' ? filterCrop : undefined,
          maxDistance
        },
        headers: {
          'x-api-key': 'aifarm-user-key'  // This should be stored in env variables in production
        }
      });
      
      if (response.data && response.data.buyers) {
        setBuyers(response.data.buyers);
      } else {
        // Fallback to mock data if API returns empty results (for development/demo)
        console.log('Using mock data as fallback');
        // Calculate real distances based on addresses
        const buyersWithDistance = mockBuyers.map(buyer => ({
          ...buyer,
          distance: calculateAddressDistance(farmerLocation, buyer.location)
        }));
        
        setBuyers(buyersWithDistance);
      }
    } catch (err: any) {
      console.error('Error fetching buyers:', err);
      setError(err.message || 'Failed to fetch buyers');
      
      // Fallback to mock data on error
      console.log('Using mock data as fallback due to error');
      const buyersWithDistance = mockBuyers.map(buyer => ({
        ...buyer,
        distance: calculateAddressDistance(farmerLocation, buyer.location)
      }));
      
      setBuyers(buyersWithDistance);
    } finally {
      setLoading(false);
    }
  };

  // Start a transaction with a buyer
  const initiateTransaction = async (buyer: Buyer, cropType: string) => {
    try {
      // Find the price for the selected crop
      const price = buyer.offerPrice?.[cropType] || 0;
      
      if (!price) {
        alert(`No price available for ${cropType}. Please contact the buyer directly to negotiate.`);
        return;
      }
      
      const confirmed = window.confirm(
        `Are you sure you want to initiate a transaction with ${buyer.name} for ${cropType} at ₹${price}/kg?`
      );
      
      if (!confirmed) return;
      
      // Call the transactions API with API key header
      const response = await axios.post('/api/marketplace/transactions', {
        farmerId: '123456', // This should be the actual user ID in production
        buyerId: buyer._id,
        cropType,
        quantity: 100, // Default value, can be replaced with a form input
        pricePerUnit: price,
        notes: `Initial inquiry for ${cropType}`
      }, {
        headers: {
          'x-api-key': 'aifarm-user-key'  // This should be stored in env variables in production
        }
      });
      
      alert(`Transaction initiated successfully! The buyer will be notified.`);
      console.log('Transaction created:', response.data);
      
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      alert(`Failed to create transaction: ${err.message || 'Unknown error'}`);
    }
  };

  // Apply filters and search
  useEffect(() => {
    if (buyers.length === 0) return;
    
    let filtered = [...buyers];
    
    // Filter by crop
    if (filterCrop !== 'all') {
      filtered = filtered.filter(buyer => 
        buyer.interestedCrops.includes(filterCrop)
      );
    }
    
    // Filter by distance
    filtered = filtered.filter(buyer => 
      buyer.distance && buyer.distance <= maxDistance
    );
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(buyer => 
        buyer.name.toLowerCase().includes(term) || 
        buyer.location.toLowerCase().includes(term) ||
        buyer.interestedCrops.some(crop => crop.toLowerCase().includes(term))
      );
    }
    
    // Sort results
    if (sortBy === 'distance') {
      filtered.sort((a, b) => (a.distance || 100) - (b.distance || 100));
    } else if (sortBy === 'price') {
      // Sort by the best price offered for any crop
      filtered.sort((a, b) => {
        const maxPriceA = Math.max(...farmerCrops
          .filter(crop => a.offerPrice && a.offerPrice[crop])
          .map(crop => a.offerPrice ? a.offerPrice[crop] : 0));
        
        const maxPriceB = Math.max(...farmerCrops
          .filter(crop => b.offerPrice && b.offerPrice[crop])
          .map(crop => b.offerPrice ? b.offerPrice[crop] : 0));
          
        return maxPriceB - maxPriceA;
      });
    }
    
    setFilteredBuyers(filtered);
  }, [buyers, searchTerm, filterCrop, maxDistance, sortBy, farmerCrops]);

  // Load data on component mount
  useEffect(() => {
    fetchBuyers();
  }, [farmerLocation]);

  // Get all unique crops from buyers
  const allCrops = Array.from(
    new Set(buyers.flatMap(buyer => buyer.interestedCrops))
  ).sort();

  // Calculate how many crops match with each buyer
  const getMatchCount = (buyer: Buyer) => {
    return buyer.interestedCrops.filter(crop => farmerCrops.includes(crop)).length;
  };

  // Get best price for farmer's crops
  const getBestPrice = (buyer: Buyer) => {
    if (!buyer.offerPrice) return 0;
    
    const prices = farmerCrops
      .filter(crop => buyer.offerPrice && buyer.offerPrice[crop])
      .map(crop => buyer.offerPrice![crop]);
    
    return prices.length > 0 ? Math.max(...prices) : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
      {/* Header with gradient background */}
      <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 p-4 -mt-6 -mx-6 mb-6 text-white shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold animate-fadeIn">Connect with Buyers</h2>
          <button 
            onClick={fetchBuyers}
            className="flex items-center gap-2 bg-white bg-opacity-20 py-1 px-3 rounded-full hover:bg-opacity-30 transition-all"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span className="text-sm">{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
      
      {/* Info banner */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md text-blue-800 text-sm animate-scaleUp">
        <p className="font-medium text-blue-700 mb-1">Your Marketplace Profile</p>
        <p>
          <strong className="inline-flex items-center mr-1"><FiMapPin className="mr-1" /> Location:</strong> {farmerLocation}
        </p>
        <p className="mt-1">
          <strong className="inline-flex items-center mr-1"><FiStar className="mr-1" /> Your crops:</strong>
          <span className="inline-flex flex-wrap gap-1 mt-1">
            {farmerCrops.map((crop, index) => (
              <span key={crop} className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs" style={{animationDelay: `${index * 0.1}s`}}>
                {crop}
              </span>
            ))}
          </span>
        </p>
        <p className="mt-3 text-blue-600">
          Connect directly with buyers interested in your crops for better prices and streamlined sales.
        </p>
      </div>
      
      {/* Search and filters with improved styling */}
      <div className="space-y-5 mb-6 animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search buyers by name, location or crop..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Crop</label>
            <div className="relative">
              <select
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                value={filterCrop}
                onChange={(e) => setFilterCrop(e.target.value)}
              >
                <option value="all">All Crops</option>
                {allCrops.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Distance: <span className="text-emerald-600 font-semibold">{maxDistance} km</span>
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>5km</span>
              <span>50km</span>
              <span>100km</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <div className="relative">
              <select
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="distance">Distance (Nearest first)</option>
                <option value="price">Best Price (Highest first)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Buyers list with improved card styling */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-500">Finding buyers near you...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-fadeIn" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      ) : filteredBuyers.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200 animate-scaleUp">
          <FiUsers className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-700 font-medium">No buyers found matching your criteria</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or increasing the distance range</p>
          <button 
            onClick={() => {
              setFilterCrop('all');
              setMaxDistance(50);
              setSearchTerm('');
            }}
            className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2 px-2 animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <p className="text-gray-600">
              <span className="font-semibold text-emerald-700">{filteredBuyers.length}</span> buyers found
            </p>
            {sortBy === 'distance' ? (
              <div className="text-sm text-gray-600 flex items-center">
                <FiMapPin className="mr-1" /> Sorted by distance
              </div>
            ) : (
              <div className="text-sm text-gray-600 flex items-center">
                <FiDollarSign className="mr-1" /> Sorted by best price
              </div>
            )}
          </div>
          
          <div className="stagger-fade-in">
            {filteredBuyers.map((buyer) => {
              const matchCount = getMatchCount(buyer);
              const bestPrice = getBestPrice(buyer);
              
              return (
                <div 
                  key={buyer._id} 
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow bg-white relative overflow-hidden mb-6"
                >
                  {/* Top match indicator */}
                  {matchCount === farmerCrops.length && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-amber-500 text-white px-3 py-1 rounded-bl-lg text-xs font-semibold shadow-md flex items-center">
                        <FiCheck className="mr-1" /> Perfect Match
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-800">{buyer.name}</h3>
                      <p className="text-gray-600 mt-1 flex items-center text-sm">
                        <FiMapPin className="mr-2 text-gray-400" /> {buyer.location}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center font-medium">
                        <FiMapPin className="mr-1" /> {buyer.distance} km away
                      </span>
                      {bestPrice > 0 && (
                        <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center mt-2 font-medium">
                          <FiTrendingUp className="mr-1" /> Best price: ₹{bestPrice}/kg
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FiStar className="mr-1 text-amber-500" /> Interested Crops
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {buyer.interestedCrops.map((crop) => (
                          <span 
                            key={crop} 
                            className={`text-xs px-2 py-1 rounded-full flex items-center ${
                              farmerCrops.includes(crop) 
                                ? 'bg-emerald-100 text-emerald-800 font-medium' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {farmerCrops.includes(crop) && (
                              <>
                                <FiCheck className="mr-1 text-emerald-600" size={12} />
                                <button 
                                  className="ml-1 text-blue-600 underline"
                                  onClick={() => initiateTransaction(buyer, crop)}
                                  title={`Sell ${crop} to ${buyer.name}`}
                                >
                                  Sell
                                </button>
                              </>
                            )}
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FiDollarSign className="mr-1 text-emerald-500" /> Offering Prices
                      </h4>
                      <div className="space-y-1.5 mt-1">
                        {buyer.offerPrice && Object.entries(buyer.offerPrice)
                          .filter(([crop]) => farmerCrops.includes(crop))
                          .length > 0 ? (
                            Object.entries(buyer.offerPrice)
                              .filter(([crop]) => farmerCrops.includes(crop))
                              .map(([crop, price]) => (
                                <div key={crop} className="flex items-center justify-between text-sm bg-white rounded p-1.5 border border-gray-100">
                                  <span className="text-gray-600">{crop}</span>
                                  <span className="font-medium text-emerald-700 flex items-center">
                                    <FiDollarSign className="text-xs mr-1" />
                                    ₹{price} per kg
                                  </span>
                                </div>
                              ))
                          ) : (
                            <div className="text-sm text-gray-500 italic flex items-center">
                              <FiClock className="mr-1" /> Ask for custom pricing
                            </div>
                          )
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 border-t pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <a href={`tel:${buyer.contactInfo.phone}`} className="flex items-center text-blue-600 hover:underline">
                        <FiPhone className="text-blue-500 mr-1.5" />
                        <span className="text-sm">{buyer.contactInfo.phone}</span>
                      </a>
                      <a href={`mailto:${buyer.contactInfo.email}`} className="flex items-center text-blue-600 hover:underline">
                        <FiMail className="text-blue-500 mr-1.5" />
                        <span className="text-sm truncate max-w-[160px]">{buyer.contactInfo.email}</span>
                      </a>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedBuyer(buyer)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition flex items-center justify-center sm:justify-start w-full sm:w-auto"
                    >
                      <span className="mr-2">View Details</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Modal for viewing buyer details */}
      {selectedBuyer && (
        <BuyerDetailsModal 
          buyer={selectedBuyer} 
          onClose={() => setSelectedBuyer(null)} 
        />
      )}
    </div>
  );
};

export default MarketplaceConnect; 