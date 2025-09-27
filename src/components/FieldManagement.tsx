'use client';

import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiMapPin, 
  FiTrendingUp,
  FiCalendar,
  FiActivity,
  FiTarget,
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import { GiPlantSeed, GiWheat } from 'react-icons/gi';

interface Field {
  _id: string;
  name: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  size: number;
  soilProfile: {
    type: string;
    ph: number;
  };
  currentStatus: 'active' | 'fallow' | 'preparation' | 'harvested';
  createdAt: string;
}

interface CropPlan {
  _id: string;
  fieldId: string;
  recommendedCrops: Array<{
    crop: string;
    variety: string;
    confidence: number;
    predictedYield: number;
  }>;
  status: 'pending' | 'accepted' | 'rejected';
  expectedRevenue: {
    profit: number;
    profitMargin: number;
  };
  createdAt: string;
}

const FieldManagement = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [cropPlans, setCropPlans] = useState<CropPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  useEffect(() => {
    fetchFields();
    fetchCropPlans();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await fetch('/api/fields');
      const data = await response.json();
      if (data.success) {
        setFields(data.data.fields || []);
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCropPlans = async () => {
    try {
      const response = await fetch('/api/predictions');
      const data = await response.json();
      if (data.success) {
        setCropPlans(data.data.cropPlans || []);
      }
    } catch (error) {
      console.error('Error fetching crop plans:', error);
    }
  };

  const generatePrediction = async (fieldId: string) => {
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fieldId }),
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchCropPlans(); // Refresh crop plans
        // Show success notification
        console.log('Prediction generated successfully');
      }
    } catch (error) {
      console.error('Error generating prediction:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'fallow': return 'bg-yellow-100 text-yellow-800';
      case 'preparation': return 'bg-blue-100 text-blue-800';
      case 'harvested': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Field Management</h1>
          <p className="text-gray-600 mt-2">Manage your fields and get AI-powered crop recommendations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add New Field</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <FiMapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{fields.length}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Total Fields</h3>
          <p className="text-sm text-gray-500 mt-1">
            {fields.filter(f => f.currentStatus === 'active').length} active
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <FiActivity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {fields.reduce((sum, field) => sum + field.size, 0).toFixed(1)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-700">Total Area</h3>
          <p className="text-sm text-gray-500 mt-1">hectares</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <FiTarget className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {cropPlans.filter(p => p.status === 'pending').length}
            </span>
          </div>
          <h3 className="font-semibold text-gray-700">Pending Plans</h3>
          <p className="text-sm text-gray-500 mt-1">awaiting decision</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              ₹{cropPlans.filter(p => p.status === 'accepted')
                .reduce((sum, plan) => sum + (plan.expectedRevenue?.profit || 0), 0)
                .toLocaleString()
              }
            </span>
          </div>
          <h3 className="font-semibold text-gray-700">Expected Profit</h3>
          <p className="text-sm text-gray-500 mt-1">from accepted plans</p>
        </div>
      </div>

      {/* Fields Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Fields</h2>
        
        {fields.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
            <GiPlantSeed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No fields yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first field to receive AI-powered crop recommendations</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Your First Field
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fields.map((field) => {
              const fieldPlans = cropPlans.filter(p => p.fieldId === field._id);
              const latestPlan = fieldPlans[0];
              
              return (
                <div key={field._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Field Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                          <GiWheat className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{field.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <FiMapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{field.location.address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(field.currentStatus)}`}>
                          {field.currentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Field Details */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Size</p>
                        <p className="font-semibold text-gray-900">{field.size} hectares</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Soil Type</p>
                        <p className="font-semibold text-gray-900 capitalize">{field.soilProfile.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">pH Level</p>
                        <p className="font-semibold text-gray-900">{field.soilProfile.ph}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(field.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Latest Crop Plan */}
                    {latestPlan && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">Latest AI Recommendation</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPlanStatusColor(latestPlan.status)}`}>
                            {latestPlan.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Top Crop:</span>
                            <span className="font-semibold text-gray-900 capitalize">
                              {latestPlan.recommendedCrops[0]?.crop} ({latestPlan.recommendedCrops[0]?.confidence}% confidence)
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Expected Yield:</span>
                            <span className="font-semibold text-gray-900">
                              {latestPlan.recommendedCrops[0]?.predictedYield} quintals
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Profit Margin:</span>
                            <span className="font-semibold text-green-600">
                              {latestPlan.expectedRevenue?.profitMargin}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => generatePrediction(field._id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                      >
                        <FiTrendingUp className="w-4 h-4" />
                        <span>Get AI Prediction</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Field Modal would go here */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Field</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Field creation form will be implemented in the next phase.
              </p>
              <p className="text-sm text-gray-500">
                This will include map integration, soil testing, and crop history input.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldManagement; 