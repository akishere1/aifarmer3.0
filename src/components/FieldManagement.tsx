import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// Type definitions
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

interface FormData {
  waterLevel: number | '';
  soilType: 'clay' | 'loamy' | 'sandy' | 'silt' | 'saline' | 'peaty' | '';
  landArea: number | '';
  location: string;
  temperature: number | '';
  season: 'Kharif' | 'Rabi' | 'Zaid' | '';
}

const FieldManagement = () => {
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    waterLevel: '',
    soilType: '',
    landArea: '',
    location: '',
    temperature: '',
    season: '',
  });

  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // State for fields data
  const [fields, setFields] = useState<Field[]>([]);
  
  // Loading and view states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewFields, setViewFields] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    // Check required fields
    if (formData.waterLevel === '') newErrors.waterLevel = 'Water level is required';
    if (formData.soilType === '') newErrors.soilType = 'Soil type is required';
    if (formData.landArea === '') newErrors.landArea = 'Land area is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (formData.temperature === '') newErrors.temperature = 'Temperature is required';
    if (formData.season === '') newErrors.season = 'Season is required';
    
    // Range validations
    if (typeof formData.waterLevel === 'number' && formData.waterLevel < 0) {
      newErrors.waterLevel = 'Water level cannot be negative';
    }
    
    if (typeof formData.landArea === 'number' && formData.landArea <= 0) {
      newErrors.landArea = 'Land area must be greater than zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/fields/add', formData);
      
      if (response.status === 201) {
        toast.success('Field added successfully!');
        // Optionally reset the form
        setFormData({
          waterLevel: '',
          soilType: '',
          landArea: '',
          location: '',
          temperature: '',
          season: '',
        });
        
        // If viewing fields, refresh the list
        if (viewFields) {
          fetchFields();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add field');
      console.error('Error adding field:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch all fields
  const fetchFields = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.get('/api/fields');
      setFields(response.data.data);
      setViewFields(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch fields');
      console.error('Error fetching fields:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle view fields
  const toggleViewFields = () => {
    if (!viewFields) {
      fetchFields();
    } else {
      setViewFields(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Toaster position="top-right" />
      
      <h1 className="text-2xl font-bold mb-6">Field Management</h1>
      
      {/* Add Field Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Field</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Water Level */}
            <div className="mb-4">
              <label htmlFor="waterLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Water Level (mm)
              </label>
              <input
                type="number"
                id="waterLevel"
                name="waterLevel"
                value={formData.waterLevel}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.waterLevel ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.waterLevel && (
                <p className="text-red-500 text-xs mt-1">{errors.waterLevel}</p>
              )}
            </div>
            
            {/* Soil Type */}
            <div className="mb-4">
              <label htmlFor="soilType" className="block text-sm font-medium text-gray-700 mb-1">
                Soil Type
              </label>
              <select
                id="soilType"
                name="soilType"
                value={formData.soilType}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.soilType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Soil Type</option>
                <option value="clay">Clay</option>
                <option value="loamy">Loamy</option>
                <option value="sandy">Sandy</option>
                <option value="silt">Silt</option>
                <option value="saline">Saline</option>
                <option value="peaty">Peaty</option>
              </select>
              {errors.soilType && (
                <p className="text-red-500 text-xs mt-1">{errors.soilType}</p>
              )}
            </div>
            
            {/* Land Area */}
            <div className="mb-4">
              <label htmlFor="landArea" className="block text-sm font-medium text-gray-700 mb-1">
                Land Area (hectares)
              </label>
              <input
                type="number"
                id="landArea"
                name="landArea"
                value={formData.landArea}
                onChange={handleChange}
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.landArea ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.landArea && (
                <p className="text-red-500 text-xs mt-1">{errors.landArea}</p>
              )}
            </div>
            
            {/* Location */}
            <div className="mb-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>
            
            {/* Temperature */}
            <div className="mb-4">
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                id="temperature"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.temperature ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.temperature && (
                <p className="text-red-500 text-xs mt-1">{errors.temperature}</p>
              )}
            </div>
            
            {/* Season */}
            <div className="mb-4">
              <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
                Season
              </label>
              <select
                id="season"
                name="season"
                value={formData.season}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.season ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Season</option>
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Zaid">Zaid</option>
              </select>
              {errors.season && (
                <p className="text-red-500 text-xs mt-1">{errors.season}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300"
            >
              {isSubmitting ? 'Adding...' : 'Add Field'}
            </button>
          </div>
        </form>
      </div>
      
      {/* View Fields Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Fields</h2>
          <button
            onClick={toggleViewFields}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {viewFields ? 'Hide Fields' : 'View All Fields'}
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">
            <p>Loading fields...</p>
          </div>
        ) : viewFields && (
          <>
            {fields.length === 0 ? (
              <div className="text-center py-4">
                <p>No fields added yet. Add your first field above!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Location</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Soil Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Water Level</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Land Area</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Season</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Temperature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fields.map((field) => (
                      <tr key={field._id}>
                        <td className="px-4 py-3 text-sm">{field.location}</td>
                        <td className="px-4 py-3 text-sm capitalize">{field.soilType}</td>
                        <td className="px-4 py-3 text-sm">{field.waterLevel} mm</td>
                        <td className="px-4 py-3 text-sm">{field.landArea} ha</td>
                        <td className="px-4 py-3 text-sm">{field.season}</td>
                        <td className="px-4 py-3 text-sm">{field.temperature} °C</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FieldManagement; 