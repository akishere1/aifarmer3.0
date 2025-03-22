import React, { useState } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';

interface NewFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Common location options in India
const LOCATION_OPTIONS = [
  'Bengaluru, Karnataka',
  'Mumbai, Maharashtra',
  'Delhi, Delhi',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan',
  'Lucknow, Uttar Pradesh',
  'Amritsar, Punjab',
  'Kochi, Kerala'
];

const NewFieldModal: React.FC<NewFieldModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    waterLevel: '',
    soilType: '',
    landArea: '',
    location: '',
    temperature: '',
    season: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (error) setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.waterLevel || !formData.soilType || !formData.landArea || 
        !formData.location || !formData.temperature || !formData.season) {
      setError('All fields are required');
      return;
    }
    
    // Convert string values to numbers
    const dataToSubmit = {
      waterLevel: parseFloat(formData.waterLevel),
      soilType: formData.soilType,
      landArea: parseFloat(formData.landArea),
      location: formData.location,
      temperature: parseFloat(formData.temperature),
      season: formData.season
    };
    
    setLoading(true);
    try {
      // Submit data to API
      const response = await axios.post('/api/fields/add', dataToSubmit);
      
      if (response.status === 201) {
        // Reset form
        setFormData({
          waterLevel: '',
          soilType: '',
          landArea: '',
          location: '',
          temperature: '',
          season: ''
        });
        
        // Notify parent component of success
        onSuccess();
        
        // Close modal
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add field');
      console.error('Error adding field:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>
        
        <h2 className="text-xl font-bold mb-6">Add New Field</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Water Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Level (mm)
              </label>
              <input
                type="number"
                name="waterLevel"
                value={formData.waterLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter water level"
                min="0"
              />
            </div>
            
            {/* Soil Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soil Type
              </label>
              <select
                name="soilType"
                value={formData.soilType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select soil type</option>
                <option value="clay">Clay</option>
                <option value="loamy">Loamy</option>
                <option value="sandy">Sandy</option>
                <option value="silt">Silt</option>
                <option value="saline">Saline</option>
                <option value="peaty">Peaty</option>
              </select>
            </div>
            
            {/* Land Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Land Area (hectares)
              </label>
              <input
                type="number"
                name="landArea"
                value={formData.landArea}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter land area"
                min="0.1"
                step="0.1"
              />
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select location</option>
                {LOCATION_OPTIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter temperature"
                min="-10"
                max="50"
              />
            </div>
            
            {/* Season */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Season
              </label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select season</option>
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Zaid">Zaid</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFieldModal; 