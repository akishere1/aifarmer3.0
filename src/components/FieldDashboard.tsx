import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm } from 'react-icons/wi';

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

interface FieldData {
  field: Field;
  growth: {
    growthPercentage: number;
    harvestTimeLeftPercentage: number;
    daysPlanted: number;
    daysRemaining: number;
    estimatedYield: number;
    growthHistory: { month: string; value: number }[];
    recommendations: string[];
  };
  weather: {
    current: {
      temperature: number;
      condition: string;
      humidity: number;
      windSpeed: number;
      day: string;
    };
    forecast: {
      day: string;
      temperature: number;
      condition: string;
    }[];
  };
  soil: {
    moisture: number;
    pH: number;
    nutrition: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
    healthScore: number;
  };
}

interface FieldDashboardProps {
  fieldId: string;
  onBack: () => void;
}

const FieldDashboard: React.FC<FieldDashboardProps> = ({ fieldId, onBack }) => {
  const [fieldData, setFieldData] = useState<FieldData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
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
  
  // Fetch field data
  const fetchFieldData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch field details
      const response = await axios.get(`/api/fields/${fieldId}`);
      setFieldData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch field data');
      console.error('Error fetching field data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchFieldData();
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchFieldData();
  }, [fieldId]);
  
  // Prepare growth data for chart
  const growthChartData = {
    labels: fieldData?.growth.growthHistory.map(item => item.month) || [],
    datasets: [
      {
        label: 'Growth Rate',
        data: fieldData?.growth.growthHistory.map(item => item.value) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Prepare soil nutrition data for chart
  const soilNutritionData = {
    labels: ['Nitrogen', 'Phosphorus', 'Potassium'],
    datasets: [
      {
        label: 'Soil Nutrition',
        data: fieldData ? [
          fieldData.soil.nutrition.nitrogen,
          fieldData.soil.nutrition.phosphorus,
          fieldData.soil.nutrition.potassium
        ] : [0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  if (loading && !fieldData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error && !fieldData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={onBack}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto p-6">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">
          Field Dashboard - {fieldData?.field.location || 'Loading...'}
        </h1>
        
        <button 
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="ml-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Field Info Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Field Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{fieldData?.field.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Soil Type:</span>
              <span className="font-medium capitalize">{fieldData?.field.soilType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Land Area:</span>
              <span className="font-medium">{fieldData?.field.landArea} hectares</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Water Level:</span>
              <span className="font-medium">{fieldData?.field.waterLevel} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Temperature:</span>
              <span className="font-medium">{fieldData?.field.temperature} °C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Season:</span>
              <span className="font-medium">{fieldData?.field.season}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{new Date(fieldData?.field.createdAt || '').toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* Weather Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Weather</h2>
          
          {fieldData?.weather ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold">{fieldData.weather.current.temperature} °C</div>
                  <div className="text-gray-600">{fieldData.weather.current.condition}</div>
                  <div className="text-gray-600">{fieldData.weather.current.day}</div>
                </div>
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  {getWeatherIcon(fieldData.weather.current.condition)}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mt-6">
                {fieldData.weather.forecast.map((day, index) => (
                  <div key={index} className="bg-blue-50 p-2 rounded text-center">
                    <div className="text-xl">{getWeatherIcon(day.condition)}</div>
                    <div className="text-xs">{day.day}</div>
                    <div className="text-sm font-medium">{day.temperature}°</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Humidity:</span>
                  <span className="font-medium">{fieldData.weather.current.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wind Speed:</span>
                  <span className="font-medium">{fieldData.weather.current.windSpeed} km/h</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <span className="text-gray-500">Weather data loading...</span>
            </div>
          )}
        </div>
        
        {/* Growth Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Growth Status</h2>
          
          {fieldData?.growth ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-gray-600 mb-1">Growth Progress</h3>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-4 text-xs flex rounded bg-green-200">
                      <div 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        style={{ width: `${fieldData.growth.growthPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right mt-1 text-sm font-medium">
                      {fieldData.growth.growthPercentage}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-600 mb-1">Time Until Harvest</h3>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-4 text-xs flex rounded bg-amber-200">
                      <div 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"
                        style={{ width: `${fieldData.growth.harvestTimeLeftPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right mt-1 text-sm font-medium">
                      {fieldData.growth.harvestTimeLeftPercentage}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Planted:</span>
                  <span className="font-medium">{fieldData.growth.daysPlanted} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days to Harvest:</span>
                  <span className="font-medium">{fieldData.growth.daysRemaining} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Yield:</span>
                  <span className="font-medium">{fieldData.growth.estimatedYield} kg/hectare</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <span className="text-gray-500">Growth data loading...</span>
            </div>
          )}
        </div>
        
        {/* Growth History Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Growth History</h2>
          <div className="h-60">
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
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Growth Rate'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Soil Health */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Soil Health</h2>
          
          {fieldData?.soil ? (
            <>
              <div className="mb-6">
                <h3 className="text-center text-gray-600 mb-1">Soil Health Score</h3>
                <div className="flex justify-center">
                  <div className="relative w-36 h-36">
                    <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                    <div 
                      className="absolute inset-0 rounded-full border-8"
                      style={{ 
                        borderColor: `${fieldData.soil.healthScore > 70 ? 'rgb(34, 197, 94)' : fieldData.soil.healthScore > 40 ? 'rgb(234, 179, 8)' : 'rgb(239, 68, 68)'}`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${fieldData.soil.healthScore > 25 ? '100% 0%' : `${50 + (fieldData.soil.healthScore/25) * 50}% ${50 - (fieldData.soil.healthScore/25) * 50}%`}, ${
                          fieldData.soil.healthScore > 50 ? '100% 100%' : fieldData.soil.healthScore > 25 ? `100% ${(fieldData.soil.healthScore-25)/25 * 100}%` : '50% 50%'
                        }, ${
                          fieldData.soil.healthScore > 75 ? '0% 100%' : fieldData.soil.healthScore > 50 ? `${100 - (fieldData.soil.healthScore-50)/25 * 100}% 100%` : '50% 50%'
                        }, ${
                          fieldData.soil.healthScore > 75 ? `0% ${100 - (fieldData.soil.healthScore-75)/25 * 100}%` : '50% 50%'
                        })` 
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{fieldData.soil.healthScore}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Soil Moisture:</span>
                  <span className="font-medium">{fieldData.soil.moisture}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Soil pH:</span>
                  <span className="font-medium">{fieldData.soil.pH}</span>
                </div>
              </div>
              
              <h3 className="text-gray-600 mt-4 mb-1">Soil Nutrition Levels</h3>
              <div className="h-40">
                <Bar 
                  data={soilNutritionData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <span className="text-gray-500">Soil data loading...</span>
            </div>
          )}
        </div>
        
        {/* Recommendations */}
        <div className="bg-white rounded-lg p-6 shadow-sm col-span-1 md:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          
          {fieldData?.growth.recommendations ? (
            <ul className="list-disc pl-5 space-y-2">
              {fieldData.growth.recommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-700">{recommendation}</li>
              ))}
            </ul>
          ) : (
            <div className="h-20 flex items-center justify-center">
              <span className="text-gray-500">No recommendations available</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Loading State */}
      {loading && refreshing && (
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
  );
};

export default FieldDashboard; 