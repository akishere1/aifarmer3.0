import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { FiRefreshCw, FiPlus, FiUser, FiMessageCircle } from 'react-icons/fi';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm } from 'react-icons/wi';
import NewFieldModal from './NewFieldModal';
import FieldDashboard from './FieldDashboard';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  LineElement,
  PointElement
);

// User interface
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

// Field interface
interface Field {
  _id: string;
  waterLevel: number;
  soilType: 'clay' | 'loamy' | 'sandy' | 'silt' | 'saline' | 'peaty';
  landArea: number;
  location: string;
  temperature: number;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  createdAt: string;
}

// Weather forecast interface
interface WeatherForecast {
  day: string;
  temperature: number;
  condition: string;
}

// Weather data interface
interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    day: string;
  };
  forecast: WeatherForecast[];
}

// Growth data interface
interface GrowthData {
  fields: {
    fieldId: string;
    location: string;
    season: string;
    soilType: string;
    daysPlanted: number;
    daysRemaining: number;
    growthPercentage: number;
    harvestTimeLeftPercentage: number;
    estimatedYield: number;
    growthHistory: { month: string; value: number }[];
  }[];
  summary: {
    avgGrowthPercentage: number;
    avgHarvestTimeLeftPercentage: number;
  };
}

const Dashboard = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeField, setActiveField] = useState<number>(0);
  const [isNewFieldModalOpen, setIsNewFieldModalOpen] = useState<boolean>(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [cropAnalysis, setCropAnalysis] = useState<any>(null);
  const [showPhotoUploader, setShowPhotoUploader] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'gov-schemes' | 'market-prices'>('dashboard');

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <WiDaySunny className="text-4xl text-yellow-500" />;
      case 'cloudy':
      case 'partly cloudy':
        return <WiCloudy className="text-4xl text-gray-500" />;
      case 'rainy':
        return <WiRain className="text-4xl text-blue-500" />;
      case 'thunderstorms':
        return <WiThunderstorm className="text-4xl text-purple-500" />;
      default:
        return <WiDaySunny className="text-4xl text-yellow-500" />;
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user data without authentication
      const userResponse = await axios.get('/api/user');
      setUser(userResponse.data.user);
      
      // Fetch fields data without authentication
      const fieldsResponse = await axios.get('/api/fields');
      setFields(fieldsResponse.data.data);
      
      // Fetch weather data without authentication
      const weatherResponse = await axios.get('/api/weather');
      setWeatherData(weatherResponse.data.data);
      
      // Fetch growth data without authentication
      const growthResponse = await axios.get('/api/growth');
      setGrowthData(growthResponse.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Prepare growth data for chart
  const growthChartData = {
    labels: growthData?.fields[activeField]?.growthHistory.map(item => item.month) || [],
    datasets: [
      {
        label: 'Growth Rate',
        data: growthData?.fields[activeField]?.growthHistory.map(item => item.value) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Handle opening the new field modal
  const handleOpenNewFieldModal = () => {
    setIsNewFieldModalOpen(true);
  };

  // Handle closing the new field modal
  const handleCloseNewFieldModal = () => {
    setIsNewFieldModalOpen(false);
  };

  // Handle successful field addition
  const handleFieldAdded = () => {
    // Refresh the fields data when a new field is added
    fetchAllData();
  };

  // Handle field selection to view detailed dashboard
  const handleFieldSelect = (fieldId: string) => {
    setSelectedFieldId(fieldId);
  };

  // Handle returning to the main dashboard
  const handleBackToMainDashboard = () => {
    setSelectedFieldId(null);
  };

  // Handle photo change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target && event.target.result) {
          setPreviewImage(event.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async () => {
    if (!previewImage) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Create form data to upload the image
      const formData = new FormData();
      // Convert base64 to blob
      const blob = await fetch(previewImage).then(r => r.blob());
      formData.append('image', blob, 'plant-image.jpg');
      
      // Check if selectedFieldId is not null before appending
      if (selectedFieldId) {
        formData.append('fieldId', selectedFieldId);
      } else {
        throw new Error('No field selected');
      }
      
      // Send to your API endpoint for crop disease detection
      const response = await axios.post('/api/crop-health/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update state with the analysis results
      setCropAnalysis(response.data.data);
      setShowPhotoUploader(false);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploadError(error.response?.data?.message || 'Failed to analyze image');
    } finally {
      setIsUploading(false);
    }
  };

  // Dummy data for government schemes
  const governmentSchemes = [
    {
      id: 1,
      name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      description: "A crop insurance scheme that provides financial support to farmers in case of crop failure due to natural calamities, pests, and diseases.",
      eligibility: "All farmers including sharecroppers and tenant farmers growing notified crops in the notified areas.",
      benefits: "Insurance coverage and financial support to farmers in case of crop failure.",
      applicationProcess: "Apply through local agricultural office, banks, or online portal.",
      lastDate: "July 31, 2023",
      link: "https://pmfby.gov.in/"
    },
    {
      id: 2,
      name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
      description: "A central sector scheme to provide income support to all landholding farmers' families in the country.",
      eligibility: "All landholding farmers' families, which have cultivable landholding in their names.",
      benefits: "₹6,000 per year transferred directly to farmers' bank accounts in three equal installments.",
      applicationProcess: "Register through local agricultural office or PM-KISAN portal.",
      lastDate: "Ongoing",
      link: "https://pmkisan.gov.in/"
    },
    {
      id: 3,
      name: "Kisan Credit Card (KCC)",
      description: "Provides farmers with affordable credit for their agricultural operations.",
      eligibility: "All farmers, sharecroppers, tenant farmers, and self-help groups of farmers.",
      benefits: "Short-term loans at reduced interest rates, personal accident insurance cover.",
      applicationProcess: "Apply at nearest bank branch or agricultural office.",
      lastDate: "Ongoing",
      link: "https://www.nabard.org/content.aspx?id=594"
    },
    {
      id: 4,
      name: "Soil Health Card Scheme",
      description: "Provides information to farmers on nutrient status of their soil along with recommendations on appropriate dosage of nutrients for improving soil health and fertility.",
      eligibility: "All farmers across India.",
      benefits: "Free soil testing and personalized recommendations for soil health improvement.",
      applicationProcess: "Contact local Krishi Vigyan Kendra or agricultural department.",
      lastDate: "Ongoing",
      link: "https://soilhealth.dac.gov.in/"
    }
  ];
  
  // Dummy data for market prices
  const marketPrices = [
    {
      id: 1,
      crop: "Rice (Common)",
      market: "Delhi",
      price: "₹2,400 per quintal",
      change: "+3.5%",
      updated: "Today, 10:30 AM"
    },
    {
      id: 2,
      crop: "Wheat",
      market: "Lucknow",
      price: "₹2,100 per quintal",
      change: "+1.2%",
      updated: "Today, 11:15 AM"
    },
    {
      id: 3,
      crop: "Cotton",
      market: "Gujarat",
      price: "₹6,200 per quintal",
      change: "-0.8%",
      updated: "Today, 9:45 AM"
    },
    {
      id: 4,
      crop: "Chickpea (Chana)",
      market: "Maharashtra",
      price: "₹5,300 per quintal",
      change: "+2.1%",
      updated: "Today, 10:00 AM"
    },
    {
      id: 5,
      crop: "Sugarcane",
      market: "Uttar Pradesh",
      price: "₹3,100 per quintal",
      change: "0%",
      updated: "Today, 8:30 AM"
    },
    {
      id: 6,
      crop: "Potato",
      market: "West Bengal",
      price: "₹1,600 per quintal",
      change: "+4.2%",
      updated: "Today, 9:30 AM"
    },
    {
      id: 7,
      crop: "Onion",
      market: "Maharashtra",
      price: "₹2,200 per quintal",
      change: "-1.5%",
      updated: "Today, 10:20 AM"
    },
    {
      id: 8,
      crop: "Tomato",
      market: "Karnataka",
      price: "₹1,800 per quintal",
      change: "+2.8%",
      updated: "Today, 11:00 AM"
    }
  ];

  // Render government schemes section
  const renderGovernmentSchemes = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-800">Government Schemes for Farmers</h1>
          <button 
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
          >
            <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {governmentSchemes.map((scheme) => (
            <div 
              key={scheme.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-medium mb-2 text-emerald-800">{scheme.name}</h3>
              <p className="text-gray-600 mb-4">{scheme.description}</p>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-emerald-700">Eligibility:</span>
                  <p className="text-sm text-gray-600">{scheme.eligibility}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-emerald-700">Benefits:</span>
                  <p className="text-sm text-gray-600">{scheme.benefits}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-emerald-700">How to Apply:</span>
                  <p className="text-sm text-gray-600">{scheme.applicationProcess}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-emerald-700">Last Date:</span>
                  <span className="text-sm font-medium">{scheme.lastDate}</span>
                </div>
              </div>
              
              <a 
                href={scheme.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Learn More
              </a>
            </div>
          ))}
            </div>
          </div>
    );
  };

  // Render market prices section
  const renderMarketPrices = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-800">Live Market Prices</h1>
          <button 
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
          >
            <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-emerald-100">
          <div className="grid grid-cols-5 bg-emerald-50 p-4 border-b border-emerald-100">
            <div className="font-medium text-emerald-800">Crop</div>
            <div className="font-medium text-emerald-800">Market</div>
            <div className="font-medium text-emerald-800">Price</div>
            <div className="font-medium text-emerald-800">Change</div>
            <div className="font-medium text-emerald-800">Last Updated</div>
          </div>
          
          {marketPrices.map((item) => (
            <div key={item.id} className="grid grid-cols-5 p-4 border-b border-gray-100 hover:bg-emerald-50 transition-colors">
              <div className="font-medium">{item.crop}</div>
              <div>{item.market}</div>
              <div>{item.price}</div>
              <div className={`${item.change.startsWith('+') ? 'text-green-600' : item.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                {item.change}
              </div>
              <div className="text-gray-500 text-sm">{item.updated}</div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-100">
          <h3 className="text-lg font-medium mb-4 text-amber-800">Price Trend Analysis</h3>
          <p className="text-gray-600 mb-4">
            Market analysts predict steady increase in wheat and rice prices over the next month due to increased export demand.
            Vegetable prices are expected to stabilize as the new harvest reaches the markets by next week.
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2">Rising Prices</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Rice: Expected to rise by 5-7% in the next two weeks</li>
                <li>• Potato: Steady increase due to lower production</li>
                <li>• Tomato: Seasonal price hike expected</li>
              </ul>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <h4 className="font-medium text-emerald-800 mb-2">Falling Prices</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Onion: Prices expected to drop by 10-12%</li>
                <li>• Sugarcane: Slight decrease due to surplus production</li>
                <li>• Cotton: Gradually decreasing due to international trends</li>
              </ul>
          </div>
          </div>
        </div>
      </div>
    );
  };

  // Conditional rendering based on selected section
  const renderContent = () => {
    switch (activeSection) {
      case 'gov-schemes':
        return renderGovernmentSchemes();
      case 'market-prices':
        return renderMarketPrices();
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-emerald-800">Fields Progress Overview</h1>
              <button 
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
              >
                <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
                </div>
                
            {/* Overall Growth Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-emerald-100 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-4 text-emerald-800">Average Growth Progress</h3>
                <div className="relative w-32 h-32 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-emerald-500"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${(growthData?.summary.avgGrowthPercentage || 45) > 25 ? '100% 0%' : `${50 + ((growthData?.summary.avgGrowthPercentage || 45)/25) * 50}% ${50 - ((growthData?.summary.avgGrowthPercentage || 45)/25) * 50}%`}, ${
                    (growthData?.summary.avgGrowthPercentage || 45) > 50 ? '100% 100%' : (growthData?.summary.avgGrowthPercentage || 45) > 25 ? `100% ${((growthData?.summary.avgGrowthPercentage || 45)-25)/25 * 100}%` : '50% 50%'
                  }, ${
                    (growthData?.summary.avgGrowthPercentage || 45) > 75 ? '0% 100%' : (growthData?.summary.avgGrowthPercentage || 45) > 50 ? `${100 - ((growthData?.summary.avgGrowthPercentage || 45)-50)/25 * 100}% 100%` : '50% 50%'
                  }, ${
                    (growthData?.summary.avgGrowthPercentage || 45) > 75 ? `0% ${100 - ((growthData?.summary.avgGrowthPercentage || 45)-75)/25 * 100}%` : '50% 50%'
                  })` 
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-700">{growthData?.summary.avgGrowthPercentage || 45}%</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm text-center">Average growth across all fields</p>
          </div>
          
              <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-100 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-4 text-amber-800">Harvest Time Left</h3>
                <div className="relative w-32 h-32 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-100"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-amber-500"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${(growthData?.summary.avgHarvestTimeLeftPercentage || 65) > 25 ? '100% 0%' : `${50 + ((growthData?.summary.avgHarvestTimeLeftPercentage || 65)/25) * 50}% ${50 - ((growthData?.summary.avgHarvestTimeLeftPercentage || 65)/25) * 50}%`}, ${
                    (growthData?.summary.avgHarvestTimeLeftPercentage || 65) > 50 ? '100% 100%' : (growthData?.summary.avgHarvestTimeLeftPercentage || 65) > 25 ? `100% ${((growthData?.summary.avgHarvestTimeLeftPercentage || 65)-25)/25 * 100}%` : '50% 50%'
                  }, ${
                    (growthData?.summary.avgHarvestTimeLeftPercentage || 65) > 75 ? '0% 100%' : (growthData?.summary.avgHarvestTimeLeftPercentage || 65) > 50 ? `${100 - ((growthData?.summary.avgHarvestTimeLeftPercentage || 65)-50)/25 * 100}% 100%` : '50% 50%'
                  }, ${
                    (growthData?.summary.avgHarvestTimeLeftPercentage || 65) > 75 ? `0% ${100 - ((growthData?.summary.avgHarvestTimeLeftPercentage || 65)-75)/25 * 100}%` : '50% 50%'
                  })` 
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-amber-700">{growthData?.summary.avgHarvestTimeLeftPercentage || 65}%</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm text-center">Average time remaining until harvest</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-emerald-100">
                <h3 className="text-lg font-medium mb-4 text-emerald-800">Farm Summary</h3>
                <ul className="space-y-4">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Total Fields:</span>
                    <span className="font-medium">{fields.length || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Avg Growth:</span>
                    <span className="font-medium">{growthData?.summary.avgGrowthPercentage || 0}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Fields Ready:</span>
                    <span className="font-medium">{growthData?.fields.filter(field => field.growthPercentage >= 90).length || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Today:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Fields List */}
            <h2 className="text-xl font-bold text-emerald-800 mb-4">Fields Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fields.map((field, index) => (
              <div 
                key={field._id}
                  className={`bg-white rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow border ${activeField === index ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-emerald-100'}`}
                onClick={() => {
                  setActiveField(index);
                  handleFieldSelect(field._id);
                }}
              >
                  <h3 className="text-lg font-medium mb-4 text-emerald-800">{field.location}</h3>
                  
                  {/* Growth Progress Bar */}
                  {growthData?.fields[index] && (
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Growth Progress:</span>
                        <span className="text-sm font-medium">{growthData.fields[index].growthPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-emerald-500 h-2.5 rounded-full" 
                          style={{width: `${growthData.fields[index].growthPercentage}%`}}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Harvest Time Bar */}
                  {growthData?.fields[index] && (
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Harvest in:</span>
                        <span className="text-sm font-medium">{growthData.fields[index].daysRemaining} days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-amber-500 h-2.5 rounded-full" 
                          style={{width: `${100 - growthData.fields[index].harvestTimeLeftPercentage}%`}}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Soil Type:</span>
                      <span className="text-sm font-medium capitalize">{field.soilType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Water Level:</span>
                      <span className="text-sm font-medium">{field.waterLevel} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Land Area:</span>
                      <span className="text-sm font-medium">{field.landArea} hectares</span>
                    </div>
                    {growthData?.fields[index] && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Est. Yield:</span>
                        <span className="text-sm font-medium">{growthData.fields[index].estimatedYield} kg/ha</span>
                      </div>
                    )}
                  </div>
              </div>
            ))}
            
              {/* Add Field Card */}
              {fields.length === 0 ? (
                <div 
                  className="bg-white rounded-lg p-6 shadow-sm border border-dashed border-emerald-300 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors"
                  onClick={handleOpenNewFieldModal}
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <FiPlus className="text-emerald-600 text-2xl" />
                  </div>
                  <p className="text-emerald-600 font-medium text-center">Add Your First Field</p>
                </div>
              ) : fields.length < 6 && (
                <div 
                  className="bg-white rounded-lg p-6 shadow-sm border border-dashed border-emerald-300 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors"
                  onClick={handleOpenNewFieldModal}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                    <FiPlus className="text-emerald-600 text-xl" />
                  </div>
                  <p className="text-emerald-600 font-medium">Add New Field</p>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  // If a field is selected, show the field dashboard
  if (selectedFieldId) {
    return (
      <FieldDashboard
        fieldId={selectedFieldId}
        onBack={handleBackToMainDashboard}
      />
    );
  }

  return (
    <div className="flex h-screen bg-emerald-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-emerald-100 flex flex-col">
        {/* Profile Section */}
        <div className="p-6 border-b border-emerald-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <FiUser className="text-emerald-600 text-xl" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">{user?.name || 'Loading...'}</span>
              <span className="text-xs text-gray-500">{user?.role || ''}</span>
              </div>
          </div>
          
          <button 
            onClick={handleOpenNewFieldModal}
            className="mt-6 w-full bg-emerald-600 text-white py-2 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-colors"
          >
            <FiPlus />
            <span>Add New Field</span>
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-grow p-4">
          <div className="space-y-3">
            <div 
              className={`p-3 rounded-md border cursor-pointer transition-colors ${activeSection === 'dashboard' ? 'bg-emerald-100 border-emerald-200 font-medium' : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}
              onClick={() => setActiveSection('dashboard')}
            >
              Dashboard
            </div>
            <div 
              className={`p-3 rounded-md border cursor-pointer transition-colors ${activeSection === 'gov-schemes' ? 'bg-emerald-100 border-emerald-200 font-medium' : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}
              onClick={() => setActiveSection('gov-schemes')}
            >
              Government Schemes
            </div>
            <div 
              className={`p-3 rounded-md border cursor-pointer transition-colors ${activeSection === 'market-prices' ? 'bg-emerald-100 border-emerald-200 font-medium' : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}
              onClick={() => setActiveSection('market-prices')}
            >
              Live Market Prices
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {renderContent()}
      </div>
      
      {/* New Field Modal */}
      {isNewFieldModalOpen && (
        <NewFieldModal 
          isOpen={isNewFieldModalOpen}
          onClose={handleCloseNewFieldModal} 
          onSuccess={handleFieldAdded} 
        />
      )}
        
        {/* Loading State */}
        {loading && !refreshing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}
    </div>
  );
};

export default Dashboard; 