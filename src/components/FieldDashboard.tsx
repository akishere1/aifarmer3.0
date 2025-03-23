import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { FiArrowLeft, FiRefreshCw, FiCamera, FiUpload, FiCheck, FiDatabase } from 'react-icons/fi';
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

// New interface for the crop prediction
interface CropPrediction {
  predictedCrop: string;
  confidence: number;
  suitableCrops: Array<{crop: string, score: number}>;
  lastUpdated: string;
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
  const [cropAnalysis, setCropAnalysis] = useState<any>(null);
  const [showPhotoUploader, setShowPhotoUploader] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Add state for crop prediction
  const [cropPrediction, setCropPrediction] = useState<CropPrediction | null>(null);
  const [predictingCrop, setPredictingCrop] = useState<boolean>(false);
  // Add state for mock data mode
  const [useMockData, setUseMockData] = useState<boolean>(false);
  
  // Mock data for crop prediction when API is unavailable
  const mockCropPrediction: CropPrediction = {
    predictedCrop: 'Rice',
    confidence: 92,
    suitableCrops: [
      { crop: 'Rice', score: 92 },
      { crop: 'Wheat', score: 85 },
      { crop: 'Maize', score: 78 },
      { crop: 'Cotton', score: 72 },
      { crop: 'Sugarcane', score: 68 }
    ],
    lastUpdated: new Date().toISOString()
  };
  
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
      
      // Fetch field details without authentication
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
    labels: fieldData?.growth?.growthHistory?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Growth Rate',
        data: fieldData?.growth?.growthHistory?.map(item => item.value) || [],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
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
        data: fieldData?.soil ? [
          fieldData.soil.nutrition.nitrogen,
          fieldData.soil.nutrition.phosphorus,
          fieldData.soil.nutrition.potassium
        ] : [0, 0, 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
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
      
      // Check if fieldId is not null before appending
      if (fieldId) {
        formData.append('fieldId', fieldId);
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
  
  // Predict crop based on field data
  const predictCrop = async () => {
    // If mock data mode is enabled, use mock data instead of API
    if (useMockData) {
      setCropPrediction(mockCropPrediction);
      return;
    }
    
    if (!fieldData) {
      console.error('No field data available for prediction');
      return;
    }

    setPredictingCrop(true);
    
    // Format field soil type to match API expectations
    const getSoilTypeForAPI = (soilType: string): string => {
      const soilMap: Record<string, string> = {
        'clay': 'Clay',
        'loamy': 'Loamy',
        'sandy': 'Sandy',
        'silt': 'Alluvial',
        'saline': 'Black',
        'peaty': 'Red'
      };
      return soilMap[soilType.toLowerCase()] || 'Loamy';
    };
    
    // Format season to match API expectations
    const getSeasonForAPI = (season: string): string => {
      const seasonMap: Record<string, string> = {
        'Kharif': 'Rainy',
        'Rabi': 'Winter',
        'Zaid': 'Summer'
      };
      return seasonMap[season] || 'Summer';
    };
    
    // Format location to match API expectations
    const getLocationForAPI = (location: string): string => {
      if (location.includes('North')) return 'North';
      if (location.includes('South')) return 'South';
      if (location.includes('East')) return 'East';
      if (location.includes('West')) return 'West';
      return 'North';
    };
    
    // Prepare the API request payload with exact format
    const payload = {
      water_level: Number(fieldData.field.waterLevel.toFixed(1)),
      soil_type: getSoilTypeForAPI(fieldData.field.soilType),
      land_area: Number(fieldData.field.landArea.toFixed(1)),
      location: getLocationForAPI(fieldData.field.location),
      temperature: Number(fieldData.field.temperature.toFixed(1)),
      season: getSeasonForAPI(fieldData.field.season)
    };
    
    console.log('Sending crop prediction payload:', payload);
    
    try {
      // Try the internal proxy endpoint which will attempt to connect to the external API
      const response = await fetch('/api/crop-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'mysecureapikey123'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Format the API response
      const prediction: CropPrediction = {
        predictedCrop: data.predicted_crop || 'Wheat',
        confidence: data.confidence || 85,
        suitableCrops: Array.isArray(data.suitable_crops) 
          ? data.suitable_crops.map((crop: any) => ({
              crop: crop.name || crop.crop || crop,
              score: crop.score || crop.confidence || 75
            }))
          : [{ crop: data.predicted_crop, score: data.confidence }],
        lastUpdated: new Date().toISOString()
      };
      
      setCropPrediction(prediction);
      
    } catch (error) {
      console.error('Error predicting crop:', error);
      
      // Offer to use mock data
      if (window.confirm('Unable to connect to prediction API. Would you like to use example data instead?')) {
        setUseMockData(true);
        setCropPrediction(mockCropPrediction);
      }
    } finally {
      setPredictingCrop(false);
    }
  };
  
  // Test API connection
  const testApiConnection = async () => {
    // Standard test payload for the API
    const testPayload = {
      water_level: 50.0,
      soil_type: "Alluvial",
      land_area: 10.0,
      location: "North",
      temperature: 25.0,
      season: "Summer"
    };
    
    console.log('Testing API connection with payload:', testPayload);
    
    try {
      // Test direct external API first
      const externalApiUrl = 'http://127.0.0.1:8000/predict';
      console.log(`Testing direct connection to external API at ${externalApiUrl}`);
      
      const startTime = Date.now();
      
      const externalResponse = await fetch(externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'mysecureapikey123'
        },
        body: JSON.stringify(testPayload)
      }).catch(error => {
        console.error('Error connecting to external API:', error);
        return null;
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // If the external API worked, show its response
      if (externalResponse && externalResponse.ok) {
        const data = await externalResponse.json();
        console.log('External API Test Response:', data);
        
        // Display the complete response for debugging
        const responseDisplay = JSON.stringify(data, null, 2);
        alert(`✅ External API test successful!\nEndpoint: ${externalApiUrl}\nResponse time: ${responseTime}ms\n\nResponse:\n${responseDisplay}`);
        return;
      }
      
      // Fall back to proxy endpoint
      console.log('External API not available, testing proxy endpoint');
      const proxyResponse = await fetch('/api/crop-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'mysecureapikey123'
        },
        body: JSON.stringify(testPayload)
      });
      
      if (!proxyResponse.ok) {
        const errorText = await proxyResponse.text();
        throw new Error(`Proxy API returned status ${proxyResponse.status}: ${errorText}`);
      }
      
      const proxyData = await proxyResponse.json();
      console.log('Proxy API Test Response:', proxyData);
      
      // Display the complete response for debugging
      const proxyResponseDisplay = JSON.stringify(proxyData, null, 2);
      alert(`✅ Proxy API test successful!\nEndpoint: /api/crop-prediction\n\nResponse:\n${proxyResponseDisplay}\n\nNote: Using fallback data as external API is unavailable.`);
      
    } catch (error) {
      console.error('API test failed:', error);
      alert('❌ API test failed. Could not connect to any prediction API endpoint. Check the console for details.');
    }
  };
  
  // Run prediction when field data is available
  useEffect(() => {
    if (fieldData) {
      predictCrop();
    }
  }, [fieldData]);
  
  if (loading && !fieldData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
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
            className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // Render crop prediction section
  const renderCropPrediction = () => {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm col-span-1 md:col-span-3 border border-emerald-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-emerald-800">Crop Recommendation</h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <label htmlFor="mock-data-toggle" className="text-sm text-gray-600 mr-2">
                Use Mock Data
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox"
                  id="mock-data-toggle"
                  checked={useMockData}
                  onChange={() => setUseMockData(!useMockData)}
                  className="sr-only"
                />
                <div className={`block h-6 w-10 rounded-full transition-colors ${useMockData ? 'bg-emerald-400' : 'bg-gray-300'}`}></div>
                <div 
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${useMockData ? 'transform translate-x-full' : ''}`}
                ></div>
              </div>
            </div>
            <button
              onClick={testApiConnection}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Test API Connection
            </button>
          </div>
        </div>
        
        {(cropPrediction || useMockData) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-1 flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-lg font-medium text-emerald-800 mb-2">Best Crop Prediction</div>
              <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <FiCheck className="h-16 w-16 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700">{useMockData ? mockCropPrediction.predictedCrop : cropPrediction?.predictedCrop}</div>
              <div className="text-sm text-gray-600 mt-2">Confidence: {useMockData ? mockCropPrediction.confidence : cropPrediction?.confidence}%</div>
              <div className="text-xs text-gray-500 mt-4">
                Last updated: {new Date(useMockData ? mockCropPrediction.lastUpdated : (cropPrediction?.lastUpdated || new Date())).toLocaleString()}
                {useMockData && <span className="ml-1 text-amber-600">(Mock Data)</span>}
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <div className="text-lg font-medium text-emerald-800 mb-3">Other Suitable Crops</div>
              <div className="space-y-4">
                {(useMockData ? mockCropPrediction.suitableCrops : cropPrediction?.suitableCrops || []).map((crop, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{crop.crop}</span>
                        <span className="text-sm text-gray-600">{crop.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-emerald-500 h-2.5 rounded-full" 
                          style={{width: `${crop.score}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-amber-800 font-medium mb-2">Recommendation Details</div>
                <p className="text-sm text-gray-700">
                  Based on your field's soil type ({fieldData?.field.soilType}), water level ({fieldData?.field.waterLevel}mm), 
                  and climate conditions, we recommend {useMockData ? mockCropPrediction.predictedCrop : cropPrediction?.predictedCrop} as the most suitable crop 
                  for the current {fieldData?.field.season} season. The prediction considers factors 
                  like soil nutrient levels, temperature, and historical yield data.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center">
            {predictingCrop ? (
              <>
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
                <span className="text-gray-500">Analyzing field data for crop recommendations...</span>
              </>
            ) : (
              <>
                <FiDatabase className="h-10 w-10 text-gray-400 mb-4" />
                <span className="text-gray-500">No crop prediction data available</span>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={predictCrop}
                    className="py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                  >
                    Get Recommendations
                  </button>
                  <button
                    onClick={() => setUseMockData(true)}
                    className="py-2 px-4 border border-emerald-600 text-emerald-600 rounded hover:bg-emerald-50 transition"
                  >
                    Use Example Data
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full overflow-auto p-6 bg-emerald-50">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-emerald-100 text-emerald-800"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-emerald-800">
          Field Dashboard - {fieldData?.field.location || 'Loading...'}
        </h1>
        
        <button 
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="ml-auto flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
        >
          <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Field Info Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-emerald-100">
          <h2 className="text-xl font-semibold mb-4 text-emerald-800">Field Information</h2>
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
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sky-100">
          <h2 className="text-xl font-semibold mb-4 text-sky-800">Weather</h2>
          
          {fieldData?.weather ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-sky-800">{fieldData.weather.current.temperature} °C</div>
                  <div className="text-sky-600">{fieldData.weather.current.condition}</div>
                  <div className="text-sky-600">{fieldData.weather.current.day}</div>
                </div>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-sky-50">
                  {getWeatherIcon(fieldData.weather.current.condition)}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mt-6">
                {fieldData.weather.forecast.map((day, index) => (
                  <div key={index} className="bg-white p-2 rounded text-center shadow-sm border border-sky-50">
                    <div className="text-xl">{getWeatherIcon(day.condition)}</div>
                    <div className="text-xs font-medium text-sky-700">{day.day}</div>
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
        <div className="bg-white rounded-lg p-6 shadow-sm border border-emerald-100">
          <h2 className="text-xl font-semibold mb-4 text-emerald-800">Growth Status</h2>
          
          {fieldData?.growth ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-gray-600 mb-1">Growth Progress</h3>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-4 text-xs flex rounded bg-emerald-100">
                      <div 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
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
                    <div className="overflow-hidden h-4 text-xs flex rounded bg-amber-100">
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
        <div className="bg-white rounded-lg p-6 shadow-sm col-span-1 md:col-span-2 border border-emerald-100">
          <h2 className="text-xl font-semibold mb-4 text-emerald-800">Growth History</h2>
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
        
        {/* Replace Soil Health with Crop Health */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-emerald-100">
          <h2 className="text-xl font-semibold mb-4 text-emerald-800">Crop Health</h2>
          
          {cropAnalysis ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-600 font-medium">Health Status:</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  cropAnalysis.healthScore > 70 ? 'bg-emerald-100 text-emerald-800' : 
                  cropAnalysis.healthScore > 40 ? 'bg-amber-100 text-amber-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {cropAnalysis.healthScore > 70 ? 'Healthy' : 
                  cropAnalysis.healthScore > 40 ? 'Moderate' : 'Poor'}
                </span>
              </div>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-gray-600">
                      Health Score
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-gray-600">
                      {cropAnalysis.healthScore}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div 
                    style={{ width: `${cropAnalysis.healthScore}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      cropAnalysis.healthScore > 70 ? 'bg-emerald-500' : 
                      cropAnalysis.healthScore > 40 ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`}
                  ></div>
                </div>
              </div>
              
              {cropAnalysis.disease && (
                <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50">
                  <h3 className="font-medium text-red-700 mb-2">Disease Detected: {cropAnalysis.disease.name}</h3>
                  <p className="text-sm text-gray-700 mb-3">{cropAnalysis.disease.description}</p>
                  
                  <h4 className="font-medium text-gray-700 mb-1">Recommended Treatment:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {cropAnalysis.disease.treatments.map((treatment: string, index: number) => (
                      <li key={index}>{treatment}</li>
                    ))}
                  </ul>
                  
                  <h4 className="font-medium text-gray-700 mt-3 mb-1">Recommended Chemicals:</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {cropAnalysis.disease.chemicals.map((chemical: {name: string, dosage: string}, index: number) => (
                      <div key={index} className="bg-white p-2 rounded border border-gray-200 text-sm">
                        <span className="font-medium">{chemical.name}</span>
                        <p className="text-xs text-gray-600 mt-1">{chemical.dosage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="text-gray-600 font-medium mb-2">Previous Analysis:</h3>
                <div className="space-y-2">
                  {cropAnalysis.history.map((item: {date: string, status: string}, index: number) => (
                    <div key={index} className="text-sm flex justify-between border-b pb-1">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span className={`${
                        item.status === 'Healthy' ? 'text-emerald-600' : 
                        item.status === 'Moderate' ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => setShowPhotoUploader(true)}
                className="mt-4 w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
              >
                Upload New Photo
              </button>
            </div>
          ) : showPhotoUploader ? (
            <div className="photo-upload-section">
              <h3 className="text-gray-600 font-medium mb-3">Upload Plant Photo</h3>
              
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center">
                {previewImage ? (
                  <div className="mb-4">
                    <img 
                      src={previewImage} 
                      alt="Plant preview" 
                      className="mx-auto max-h-48 rounded-md" 
                    />
                    <button 
                      onClick={() => setPreviewImage(null)}
                      className="mt-2 text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="mx-auto w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                      <FiCamera className="h-12 w-12 text-emerald-400" />
                    </div>
                    <p className="text-gray-600">Drag & drop your photo here or click to browse</p>
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                  className="hidden" 
                  id="cropPhotoInput" 
                />
                <label 
                  htmlFor="cropPhotoInput"
                  className="inline-block py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer transition"
                >
                  Select Photo
                </label>
              </div>
              
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setShowPhotoUploader(false)}
                  className="py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePhotoUpload}
                  disabled={!previewImage || isUploading}
                  className="py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition disabled:bg-emerald-300"
                >
                  {isUploading ? 'Analyzing...' : 'Analyze Photo'}
                </button>
              </div>
              
              {uploadError && (
                <div className="mt-2 text-red-600 text-sm">
                  {uploadError}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                <FiCamera className="h-12 w-12 text-emerald-600" />
              </div>
              <p className="text-gray-600 mb-4">Upload photos of your plants to check for diseases</p>
              <button
                onClick={() => setShowPhotoUploader(true)}
                className="py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
              >
                Upload Plant Photo
              </button>
            </div>
          )}
        </div>
        
        {/* Add Crop Prediction Section before Recommendations */}
        {renderCropPrediction()}
        
        {/* Recommendations */}
        <div className="bg-white rounded-lg p-6 shadow-sm col-span-1 md:col-span-3 border border-amber-100">
          <h2 className="text-xl font-semibold mb-4 text-amber-800">Recommendations</h2>
          
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

export default FieldDashboard; 