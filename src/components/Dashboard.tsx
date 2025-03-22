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
      
      // Fetch user data
      const userResponse = await axios.get('/api/user');
      setUser(userResponse.data.data);
      
      // Fetch fields data
      const fieldsResponse = await axios.get('/api/fields');
      setFields(fieldsResponse.data.data);
      
      // Fetch weather data
      const weatherResponse = await axios.get('/api/weather');
      setWeatherData(weatherResponse.data.data);
      
      // Fetch growth data
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <FiUser className="text-green-600 text-xl" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">{user?.name || 'Loading...'}</span>
              <span className="text-xs text-gray-500">{user?.role || ''}</span>
            </div>
          </div>
          
          <button 
            onClick={handleOpenNewFieldModal}
            className="mt-6 w-full bg-green-100 text-green-800 py-2 px-4 rounded-md flex items-center justify-center space-x-2"
          >
            <FiPlus />
            <span>new</span>
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-grow p-4">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-md"></div>
            <div className="p-3 bg-blue-50 rounded-md"></div>
            <div className="p-3 bg-blue-50 rounded-md"></div>
          </div>
        </div>
        
        {/* Bot */}
        <div className="p-6 border-t border-gray-200">
          <div className="w-12 h-12 mx-auto rounded-full bg-pink-100 flex items-center justify-center">
            <FiMessageCircle className="text-pink-600 text-xl" />
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">bot</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Weather Widget */}
          <div className="col-span-1 bg-green-100 rounded-lg p-4 shadow-sm">
            {weatherData ? (
              <>
                <div className="text-2xl font-bold">{weatherData.current.temperature} °C</div>
                <div className="text-gray-600">{weatherData.current.day}</div>
                
                <div className="flex justify-center my-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    {getWeatherIcon(weatherData.current.condition)}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="bg-green-50 p-2 rounded text-center">
                      <div className="text-xl">{getWeatherIcon(day.condition)}</div>
                      <div className="text-xs">{day.day}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center">
                <span className="text-gray-500">Weather data loading...</span>
              </div>
            )}
          </div>
          
          {/* Growth Progress */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-2">growth</h3>
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-green-500"
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
                <span className="text-2xl font-bold">{growthData?.summary.avgGrowthPercentage || 45}%</span>
              </div>
            </div>
          </div>
          
          {/* Harvest Time Left */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-2">harvest time left</h3>
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
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
                <span className="text-2xl font-bold">{growthData?.summary.avgHarvestTimeLeftPercentage || 65}%</span>
              </div>
            </div>
          </div>
          
          {/* Right sidebar info */}
          <div className="col-span-1 flex flex-col">
            <ul className="space-y-2 text-sm">
              <li><strong>weather</strong></li>
              <li><strong>fields</strong></li>
              <li><strong>grot</strong></li>
              <li><strong>date or days</strong></li>
            </ul>
            
            <button 
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="mt-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          
          {/* Field Maps section label */}
          <div className="col-span-1 md:col-span-3 flex items-center space-x-4 mt-2">
            <div className="bg-gray-100 p-2 rounded-md flex-1">
              <span className="text-gray-600">fields maps</span>
            </div>
            <div className="bg-gray-100 p-2 rounded-md flex-1">
            </div>
            <div className="bg-gray-100 p-2 rounded-md flex-1">
            </div>
          </div>
          
          {/* Growth Graph */}
          <div className="col-span-1 bg-pink-50 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-2">growth graph</h3>
            <div className="h-32">
              <Line 
                data={growthChartData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      display: false
                    },
                    y: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Fields Maps */}
          <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {/* Field 1-3 */}
            {fields.slice(0, 3).map((field, index) => (
              <div 
                key={field._id}
                className={`bg-green-100 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${activeField === index ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => {
                  setActiveField(index);
                  handleFieldSelect(field._id);
                }}
              >
                <h3 className="text-lg font-medium mb-2">field {index + 1}</h3>
                <div className="mt-4 space-y-2">
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="text-sm font-medium">{field.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Soil Type:</span>
                      <span className="text-sm font-medium capitalize">{field.soilType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Water Level:</span>
                      <span className="text-sm font-medium">{field.waterLevel} mm</span>
                    </div>
                    {growthData?.fields[index] && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Growth:</span>
                        <span className="text-sm font-medium">{growthData.fields[index].growthPercentage}%</span>
                      </div>
                    )}
                  </>
                </div>
              </div>
            ))}
            
            {/* Empty field placeholders */}
            {Array.from({ length: Math.max(0, 3 - fields.length) }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-green-100 rounded-lg p-4 shadow-sm opacity-50">
                <h3 className="text-lg font-medium mb-2">field {fields.length + index + 1}</h3>
                <div className="h-20 flex items-center justify-center">
                  <span className="text-gray-500">No field data available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Loading State */}
        {loading && !refreshing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {/* New Field Modal */}
      <NewFieldModal 
        isOpen={isNewFieldModalOpen}
        onClose={handleCloseNewFieldModal}
        onSuccess={handleFieldAdded}
      />
    </div>
  );
};

export default Dashboard; 