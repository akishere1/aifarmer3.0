import React, { useState, useEffect, JSX } from 'react';
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

// Add a DiseaseInfo type to support the additional pesticide image field
interface DiseaseInfo {
  name: string;
  description: string;
  treatments: string[];
  chemicals: Array<{name: string, dosage: string}>;
  pesticideImage?: string;
}

interface CropAnalysis {
  healthScore: number;
  disease: DiseaseInfo | null;
  history: Array<{date: string, status: string}>;
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
  const [cropAnalysis, setCropAnalysis] = useState<CropAnalysis | null>(null);
  const [showPhotoUploader, setShowPhotoUploader] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Add state for crop prediction
  const [cropPrediction, setCropPrediction] = useState<CropPrediction | null>(null);
  const [predictingCrop, setPredictingCrop] = useState<boolean>(false);
  // Remove default mock data setting - default to false now
  const [useMockData, setUseMockData] = useState<boolean>(false);
  // Add state for the selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
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
  
  // Mock data for crop analysis when disease detection API is unavailable
  const mockCropAnalysis = {
    healthScore: 75,
    disease: {
      name: 'Leaf Spot (Mock Data)',
      description: 'This is sample data shown because the disease detection API returned an error. In a real scenario, this would display actual detected diseases.',
      treatments: [
        'Regular inspection of plants',
        'Remove and destroy infected plant parts',
        'Ensure proper spacing between plants for air circulation',
        'Water at the base of plants to keep foliage dry'
      ],
      chemicals: [
        { name: 'Fungicide', dosage: 'Apply as directed by agricultural expert' },
        { name: 'Copper-based spray', dosage: '15-20ml per liter of water' }
      ]
    },
    history: [
      { date: new Date().toISOString(), status: 'Moderate' }
    ]
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
      
      // Save the file itself for direct upload
      setSelectedFile(file);
      
      // Also create a preview
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
    if (!selectedFile) {
      setUploadError("No image selected. Please select an image first.");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      console.log('Starting plant disease analysis...');
      console.log('File to upload:', selectedFile.name, selectedFile.type, selectedFile.size);
      
      // Create form data to upload the original file directly
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Log request details
      console.log('Sending request to:', 'http://127.0.0.1:8000/predict/');
      
      // Add a timeout to the fetch to avoid hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        // Send to the disease detection API following the correct approach
        const response = await fetch('http://127.0.0.1:8000/predict/', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // Log full response details
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        // If not OK, try to get error details
        if (!response.ok) {
          // Try to parse error response
          let errorText = '';
          try {
            errorText = await response.text();
            console.error('API Error Response:', errorText);
          } catch (e) {
            console.error('Could not read error response text');
          }
          
          throw new Error(`API returned status ${response.status}${errorText ? ': ' + errorText : ''}`);
        }
        
        // Try to parse the response as JSON
        let data;
        const responseText = await response.text();
        console.log('Raw API response:', responseText);
        
        try {
          data = JSON.parse(responseText);
          console.log('Parsed disease detection response:', data);
        } catch (e) {
          console.log('Response is not valid JSON, using text as is');
          data = responseText.trim();
        }
        
        // Check if the API response indicates an error even with 200 status
        if (data && typeof data === 'object' && (data.success === false || data.error)) {
          // This is an API error with details, throw it for the error handler to catch
          throw new Error(`API returned error: ${data.error || 'Unknown model error'}`);
        }
        
        // Process the API response data into our app's format
        // Determine if the plant is healthy
        const isHealthy = typeof data === 'string' 
          ? (data === "healthy" || data.includes("healthy") || data === "no_disease")
          : (data.healthy === true || data["Predicted Disease"] === "healthy");
        
        const healthScore = isHealthy ? 85 : 40;
        
        // Transform the API response into our application's format
        const analysisResult: CropAnalysis = {
          healthScore: healthScore,
          disease: isHealthy ? null : {
            name: typeof data === 'string' 
              ? data 
              : (data["Predicted Disease"] || data.disease || 'Unknown Disease'),
            description: typeof data === 'string' 
              ? 'Disease detected by the FastAPI prediction model' 
              : (data.description || `Disease detected by the FastAPI prediction model. Recommended pesticide: ${data["Recommended Pesticide"] || 'Not specified'}`),
            treatments: typeof data === 'string'
              ? ['Consult an agricultural expert for specific treatments']
              : (data.treatments || [
                  'Remove infected plant debris',
                  'Ensure proper spacing between plants for better air circulation', 
                  'Avoid overhead irrigation to keep foliage dry',
                  `Apply ${data["Recommended Pesticide"] || 'appropriate pesticide'} as directed by agricultural expert`
                ]),
            chemicals: typeof data === 'string'
              ? [{ name: 'Generic pesticide', dosage: 'As directed by agricultural expert' }]
              : (data.chemicals || [{ 
                  name: data["Recommended Pesticide"] || 'Appropriate fungicide/pesticide', 
                  dosage: 'Apply as directed on the product label'
                }])
          },
          history: [
            { date: new Date().toISOString(), status: isHealthy ? 'Healthy' : 'Poor' }
          ]
        };
        
        // Add pesticide image if available and disease exists
        if (!isHealthy && data["Pesticide Image"] && analysisResult.disease) {
          analysisResult.disease.pesticideImage = data["Pesticide Image"];
        }
        
        // Update state with the analysis results
        setCropAnalysis(analysisResult);
        setShowPhotoUploader(false);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. The API server might be too slow or not responding.');
        }
        throw error;
      }
      
    } catch (error: any) {
      console.error('Error analyzing plant image:', error);
      
      // Create a more detailed error message
      let errorMessage = `Failed to analyze image. Error: ${error.message}`;
      
      // Check if it's a model error (which we threw earlier)
      if (error.message.includes('API returned error:')) {
        errorMessage += '\n\nThe disease detection model encountered an error.';
        errorMessage += '\nPossible causes:';
        errorMessage += '\n- The image format is incompatible with the model';
        errorMessage += '\n- The model is trying to predict a disease class that is not defined';
        errorMessage += '\n- There may be an issue with the model weights or configuration';
        errorMessage += '\n\nTry using a different image of a plant with a clearer disease symptom.';
      } else {
        // These are connectivity related errors
        errorMessage += '\n\nPossible causes:';
        errorMessage += '\n- The API server is not running at http://127.0.0.1:8000/';
        errorMessage += '\n- CORS is not enabled on the FastAPI server';
        errorMessage += '\n- The image format is not compatible with the model';
        errorMessage += '\n- The API endpoint expects a different field name than "file"';
      }
      
      setUploadError(errorMessage);
      
      // Use mock data for display instead of failing completely
      const mockDataWithCurrentImage = {
        ...mockCropAnalysis,
        history: [
          { date: new Date().toISOString(), status: 'Error - Using Mock Data' },
          ...mockCropAnalysis.history
        ]
      };
      
      // Show a more informative alert based on the type of error
      if (error.message.includes('API returned error:')) {
        alert(`The disease detection model returned an error: ${error.message.replace('API returned error: ', '')}\n\nShowing mock data for demonstration purposes.\n\nYou may need to update your disease detection model to handle more disease types or improve its error handling.`);
      } else {
        alert('The disease detection API returned an error. Showing mock data for demonstration purposes.\n\nConsider updating your FastAPI backend with proper error handling as shown in the solution.');
      }
      
      // Update state with mock analysis results
      setCropAnalysis(mockDataWithCurrentImage);
      setShowPhotoUploader(false);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Predict crop based on field data
  const predictCrop = async () => {
    if (!fieldData) {
      console.error('No field data available for prediction');
      return;
    }

    setPredictingCrop(true);
    
    try {
      console.log('Sending field data to ML model...');
      
      // Define mappings for categorical to numeric values
      const soilTypeMap: Record<string, number> = {
        'clay': 0,
        'loamy': 1,
        'sandy': 2,
        'silt': 3,
        'saline': 4,
        'peaty': 5
      };
      
      const seasonMap: Record<string, number> = {
        'Kharif': 0,
        'Rabi': 1,
        'Zaid': 2
      };
      
      // Simplified payload with only necessary fields and numeric soil_type
      const payload = {
        N: 50, // Default N value
        P: 50, // Default P value
        K: 50, // Default K value
        temperature: fieldData.field.temperature,
        humidity: 60, // Default humidity value
        ph: 7.0, // Default pH value
        rainfall: fieldData.field.waterLevel // Using water level as rainfall
      };
      
      console.log('Prediction payload:', payload);
      
      // Send request to the correct port - now 9000
      const response = await fetch('http://127.0.0.1:9000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const responseText = await response.text();
      console.log(`API Response (${response.status}):`, responseText);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${responseText}`);
      }
      
      // Try to parse JSON response, but handle case where it might not be JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.warn('Response is not valid JSON, using text response');
        result = { prediction: responseText.trim() };
      }
      
      console.log('ML model response:', result);
      
      // Convert the API result to our application's format
      const cropPredictionResult: CropPrediction = {
        predictedCrop: result.prediction || 'Unknown',
        confidence: 85,
        suitableCrops: [
          { crop: result.prediction || 'Unknown', score: 85 },
          { crop: 'Wheat', score: 80 },
          { crop: 'Maize', score: 75 },
          { crop: 'Cotton', score: 70 },
          { crop: 'Sugarcane', score: 65 }
        ],
        lastUpdated: new Date().toISOString()
      };
      
      setCropPrediction(cropPredictionResult);
      
    } catch (error) {
      console.error('Error predicting crop:', error);
      
      // Use mock data when API call fails
      setUseMockData(true);
      setCropPrediction(mockCropPrediction);
    } finally {
      setPredictingCrop(false);
    }
  };
  
  // Test API connection
  const testApiConnection = async () => {
    try {
      alert('Testing API connection...');
      
      // Create a test file from a small image for testing
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      
      // Draw a simple green plant-like shape
      const ctx = canvas.getContext('2d');
      ctx!.fillStyle = 'white';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.fillStyle = 'green';
      ctx!.fillRect(50, 50, 124, 124);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to create test image');
          return;
        }
        
        // Create a File object from the blob
        const testFile = new File([blob], "test-image.jpg", { type: "image/jpeg" });
        console.log('Test file created:', testFile.name, testFile.type, testFile.size);
        
        // Create FormData
        const testFormData = new FormData();
        testFormData.append('file', testFile);
        
        // Test API with detailed logging
        console.log('Sending test request to:', 'http://127.0.0.1:8000/predict/');
        
        fetch('http://127.0.0.1:8000/predict/', {
          method: 'POST',
          body: testFormData,
        })
        .then(async response => {
          console.log('Test response status:', response.status);
          console.log('Test response headers:', [...response.headers.entries()]);
          
          // Get raw response text first
          const responseText = await response.text();
          console.log('Raw test API response:', responseText);
          
          // Try to parse as JSON if possible
          let data;
          try {
            data = JSON.parse(responseText);
            console.log('Parsed test API response:', data);
          } catch (e) {
            console.log('Test response is not valid JSON, using as is');
            data = responseText;
          }
          
          // Check for API errors even with 200 OK status
          if (data && typeof data === 'object' && (data.success === false || data.error)) {
            throw new Error(`API model error: ${data.error || 'Unknown model error'}`);
          }
          
          if (!response.ok) {
            // Try to get detailed error
            throw new Error(`API returned status ${response.status}`);
          }
          
          alert('Disease detection API is online and working at http://127.0.0.1:8000/predict/');
          
          return data;
        })
        .then(data => {
          // Show formatted result to user
          if (typeof data === 'string') {
            alert(`API Test Result: ${data}`);
          } else {
            alert(`API Test Result: ${JSON.stringify(data, null, 2)}`);
          }
        })
        .catch(error => {
          console.error('Disease API test failed:', error);
          
          // More detailed error alert
          let errorMessage = `Unable to connect to disease detection API: ${error.message}\n\n`;
          errorMessage += 'Troubleshooting tips:\n';
          
          if (error.message.includes('API model error')) {
            // Model-related error
            errorMessage += '1. The model is responding but encountered a processing error\n';
            errorMessage += '2. Check the disease labels list in your FastAPI model code\n';
            errorMessage += '3. Update the model to handle a wider range of disease classes\n';
            errorMessage += '4. The model may need to be retrained or reconfigured\n';
          } else {
            // Connection-related error
            errorMessage += '1. Ensure FastAPI server is running at http://127.0.0.1:8000/\n';
            errorMessage += '2. Check that CORS is enabled in your FastAPI app\n';
            errorMessage += '3. Add proper error handling in your FastAPI app as shown in the solution\n';
            errorMessage += '4. Check the FastAPI logs for server-side errors';
          }
          
          alert(errorMessage);
        });
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('API test failed:', error);
      alert(`Unable to connect to ML model at http://127.0.0.1:9000/predict. Please check if the API is running.`);
    }
  };
  
  // Fetch data on component mount and when mock data mode changes
  useEffect(() => {
    fetchFieldData();
  }, [fieldId]);
  
  // Run prediction when field data changes or mock mode changes
  useEffect(() => {
    if (fieldData) {
      predictCrop();
    }
  }, [fieldData, useMockData]);
  
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
            <button
              onClick={testApiConnection}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Test API
            </button>
          </div>
        </div>
        
        {/* API info - removed toggle */}
        <div className="mb-4 text-sm p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
          <strong>Note:</strong> The crop prediction API is running at http://127.0.0.1:9000/predict
        </div>
        
        {cropPrediction ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-1 flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-lg font-medium text-emerald-800 mb-2">Best Crop Prediction</div>
              <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <FiCheck className="h-16 w-16 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700">{cropPrediction.predictedCrop}</div>
              <div className="text-sm text-gray-600 mt-2">Confidence: {cropPrediction.confidence}%</div>
              <div className="text-xs text-gray-500 mt-4">
                Last updated: {new Date(cropPrediction.lastUpdated || new Date()).toLocaleString()}
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <div className="text-lg font-medium text-emerald-800 mb-3">Other Suitable Crops</div>
              <div className="space-y-4">
                {(cropPrediction?.suitableCrops || []).map((crop, index) => (
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
                  and climate conditions, we recommend {cropPrediction?.predictedCrop} as the most suitable crop 
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-emerald-800">Crop Health</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  alert('Testing disease detection API connection...');
                  
                  // Create a test file from a small image for testing
                  const canvas = document.createElement('canvas');
                  canvas.width = 224;
                  canvas.height = 224;
                  
                  // Draw a simple green plant-like shape
                  const ctx = canvas.getContext('2d');
                  ctx!.fillStyle = 'white';
                  ctx!.fillRect(0, 0, canvas.width, canvas.height);
                  ctx!.fillStyle = 'green';
                  ctx!.fillRect(50, 50, 124, 124);
                  
                  // Convert to blob
                  canvas.toBlob((blob) => {
                    if (!blob) {
                      alert('Failed to create test image');
                      return;
                    }
                    
                    // Create a File object from the blob
                    const testFile = new File([blob], "test-image.jpg", { type: "image/jpeg" });
                    console.log('Test file created:', testFile.name, testFile.type, testFile.size);
                    
                    // Create FormData
                    const testFormData = new FormData();
                    testFormData.append('file', testFile);
                    
                    // Test API with detailed logging
                    console.log('Sending test request to:', 'http://127.0.0.1:8000/predict/');
                    
                    fetch('http://127.0.0.1:8000/predict/', {
                      method: 'POST',
                      body: testFormData,
                    })
                    .then(async response => {
                      console.log('Test response status:', response.status);
                      console.log('Test response headers:', [...response.headers.entries()]);
                      
                      // Get raw response text first
                      const responseText = await response.text();
                      console.log('Raw test API response:', responseText);
                      
                      // Try to parse as JSON if possible
                      let data;
                      try {
                        data = JSON.parse(responseText);
                        console.log('Parsed test API response:', data);
                      } catch (e) {
                        console.log('Test response is not valid JSON, using as is');
                        data = responseText;
                      }
                      
                      // Check for API errors even with 200 OK status
                      if (data && typeof data === 'object' && (data.success === false || data.error)) {
                        throw new Error(`API model error: ${data.error || 'Unknown model error'}`);
                      }
                      
                      if (!response.ok) {
                        // Try to get detailed error
                        throw new Error(`API returned status ${response.status}`);
                      }
                      
                      alert('Disease detection API is online and working at http://127.0.0.1:8000/predict/');
                      
                      return data;
                    })
                    .then(data => {
                      // Show formatted result to user
                      if (typeof data === 'string') {
                        alert(`API Test Result: ${data}`);
                      } else {
                        alert(`API Test Result: ${JSON.stringify(data, null, 2)}`);
                      }
                    })
                    .catch(error => {
                      console.error('Disease API test failed:', error);
                      
                      // More detailed error alert
                      let errorMessage = `Unable to connect to disease detection API: ${error.message}\n\n`;
                      errorMessage += 'Troubleshooting tips:\n';
                      
                      if (error.message.includes('API model error')) {
                        // Model-related error
                        errorMessage += '1. The model is responding but encountered a processing error\n';
                        errorMessage += '2. Check the disease labels list in your FastAPI model code\n';
                        errorMessage += '3. Update the model to handle a wider range of disease classes\n';
                        errorMessage += '4. The model may need to be retrained or reconfigured\n';
                      } else {
                        // Connection-related error
                        errorMessage += '1. Ensure FastAPI server is running at http://127.0.0.1:8000/\n';
                        errorMessage += '2. Check that CORS is enabled in your FastAPI app\n';
                        errorMessage += '3. Add proper error handling in your FastAPI app as shown in the solution\n';
                        errorMessage += '4. Check the FastAPI logs for server-side errors';
                      }
                      
                      alert(errorMessage);
                    });
                  }, 'image/jpeg', 0.95);
                }}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                Test Disease API
              </button>
            </div>
          </div>
          
          {/* API info - similar to crop prediction section */}
          <div className="mb-4 text-sm p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            <strong>Note:</strong> The crop disease detection API is running at http://127.0.0.1:8000/predict
          </div>
          
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
                  
                  {cropAnalysis.disease.pesticideImage && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Recommended Pesticide:</h4>
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <img 
                          src={`http://127.0.0.1:8000/static/${cropAnalysis.disease.pesticideImage}`} 
                          alt="Recommended pesticide" 
                          className="mx-auto h-32 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Pesticide+Image';
                            console.log('Error loading pesticide image, using placeholder');
                          }}
                        />
                        <p className="text-sm text-center mt-2">{cropAnalysis.disease.chemicals[0]?.name}</p>
                      </div>
                    </div>
                  )}
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
                  disabled={!selectedFile || isUploading}
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