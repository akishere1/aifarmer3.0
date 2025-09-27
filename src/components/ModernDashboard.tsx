'use client';

import React, { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiTrendingUp, 
  FiUsers, 
  FiSettings,
  FiPlus,
  FiBell,
  FiSearch,
  FiShoppingBag,
  FiTarget,
  FiSun,
  FiDroplet,
  FiHeart,
  FiZap,
  FiAward,
  FiPackage,
  FiCreditCard,
  FiPhone,
  FiMail,
  FiGlobe,
  FiStar,
  FiCamera,
  FiMessageSquare,
  FiMapPin,
  FiActivity,
  FiDollarSign,
  FiBarChart,
  FiPieChart,
  FiRefreshCw,
  FiChevronRight,
  FiArrowUpRight,
  FiTruck,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiThumbsUp,
  FiFilter,
  FiMoreVertical,
  FiEye,
  FiEdit3
} from 'react-icons/fi';
import { GiPlantSeed, GiWheat } from 'react-icons/gi';
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiThunderstorm
} from 'react-icons/wi';

interface Field {
  _id: string;
  name: string;
  location: string;
  landArea: number;
  soilType: string;
  crop: string;
  status: 'active' | 'harvested' | 'pending';
  healthScore: number;
  growthStage: string;
  expectedHarvest: string;
  lastUpdate: string;
}

interface DashboardStats {
  totalFields: number;
  activeFields: number;
  harvestedFields: number;
  totalRevenue: number;
  avgHealthScore: number;
  pendingTasks: number;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  location: string;
}

const ModernDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [fields, setFields] = useState<Field[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalFields: 0,
    activeFields: 0,
    harvestedFields: 0,
    totalRevenue: 0,
    avgHealthScore: 0,
    pendingTasks: 0
  });
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 24,
    condition: 'sunny',
    humidity: 65,
    location: 'Your Location'
  });
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFields([
        {
          _id: '1',
          name: 'North Field',
          location: 'Punjab, India',
          landArea: 2.5,
          soilType: 'Loamy',
          crop: 'Wheat',
          status: 'active',
          healthScore: 92,
          growthStage: 'Flowering',
          expectedHarvest: '2024-04-15',
          lastUpdate: '2 hours ago'
        },
        {
          _id: '2',
          name: 'South Valley',
          location: 'Haryana, India',
          landArea: 3.2,
          soilType: 'Clay',
          crop: 'Rice',
          status: 'active',
          healthScore: 87,
          growthStage: 'Vegetative',
          expectedHarvest: '2024-05-20',
          lastUpdate: '5 hours ago'
        },
        {
          _id: '3',
          name: 'East Plot',
          location: 'UP, India',
          landArea: 1.8,
          soilType: 'Sandy',
          crop: 'Corn',
          status: 'harvested',
          healthScore: 95,
          growthStage: 'Harvested',
          expectedHarvest: '2024-03-10',
          lastUpdate: '1 day ago'
        }
      ]);

      setStats({
        totalFields: 12,
        activeFields: 8,
        harvestedFields: 4,
        totalRevenue: 145000,
        avgHealthScore: 88,
        pendingTasks: 3
      });

      setLoading(false);
    }, 1000);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <WiDaySunny className="text-3xl text-yellow-500" />;
      case 'cloudy':
        return <WiCloudy className="text-3xl text-gray-500" />;
      case 'rainy':
        return <WiRain className="text-3xl text-blue-500" />;
      case 'thunderstorm':
        return <WiThunderstorm className="text-3xl text-purple-500" />;
      default:
        return <WiDaySunny className="text-3xl text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'harvested':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Modern Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <GiPlantSeed className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">AI Farm Commerce</h1>
                <p className="text-sm text-gray-600">Smart Agricultural Platform</p>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, buyers..."
                  className="pl-10 pr-4 py-3 w-80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 transition-all"
                />
              </div>
              
              <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all relative">
                <FiBell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">FM</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">Farmer John</p>
                  <p className="text-xs text-gray-500">Premium Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiHome className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('fields')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'fields'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiMapPin className="w-5 h-5" />
              <span className="font-medium">My Fields</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiTrendingUp className="w-5 h-5" />
              <span className="font-medium">Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('marketplace')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'marketplace'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiUsers className="w-5 h-5" />
              <span className="font-medium">Marketplace</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiSettings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Welcome back, Farmer John! 👨‍🌾</h2>
                      <p className="text-green-100 text-lg mb-6">Your agricultural empire is thriving. Here's what's happening today.</p>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <FiCheckCircle className="w-5 h-5" />
                          <span>8 Active Fields</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiTruck className="w-5 h-5" />
                          <span>2 Ready for Harvest</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiShoppingBag className="w-5 h-5" />
                          <span>12 Buyers Interested</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                        <GiPlantSeed className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                      <FiMapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                      <FiArrowUpRight className="w-4 h-4" />
                      <span>+12%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Total Fields</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalFields}</p>
                    <p className="text-xs text-gray-500">Growth from last month</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                      <FiActivity className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 text-blue-600 text-sm font-medium">
                      <FiArrowUpRight className="w-4 h-4" />
                      <span>+8%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Active Productions</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stats.activeFields}</p>
                    <p className="text-xs text-gray-500">Producing crops right now</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                      <FiDollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-600 text-sm font-medium">
                      <FiArrowUpRight className="w-4 h-4" />
                      <span>+23%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">₹{stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Best month this year!</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                      <FiHeart className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600 text-sm font-medium">
                      <FiArrowUpRight className="w-4 h-4" />
                      <span>+5%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Crop Health Score</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stats.avgHealthScore}%</p>
                    <p className="text-xs text-gray-500">Excellent condition!</p>
                  </div>
                </div>
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weather Insights */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Weather Insights</h3>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiSun className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mb-4">
                    {getWeatherIcon(weather.condition)}
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{weather.temperature}°C</p>
                      <p className="text-sm text-gray-600 capitalize">{weather.condition}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Humidity</span>
                      <span className="font-medium">{weather.humidity}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{weather.location}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-xs text-blue-800">Perfect weather for irrigation today! 💧</p>
                  </div>
                </div>

                {/* Smart Actions */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Smart Actions</h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <FiZap className="w-4 h-4" />
                      <span>AI Powered</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="group flex items-center space-x-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all border border-green-200">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiPlus className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="block font-semibold text-green-700">Add New Field</span>
                        <span className="block text-xs text-green-600">Start new production</span>
                      </div>
                    </button>
                    
                    <button className="group flex items-center space-x-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all border border-blue-200">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiCamera className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="block font-semibold text-blue-700">Crop Analysis</span>
                        <span className="block text-xs text-blue-600">AI health check</span>
                      </div>
                    </button>
                    
                    <button className="group flex items-center space-x-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all border border-yellow-200">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiBarChart className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="block font-semibold text-yellow-700">Analytics</span>
                        <span className="block text-xs text-yellow-600">Performance insights</span>
                      </div>
                    </button>
                    
                    <button className="group flex items-center space-x-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all border border-purple-200">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="block font-semibold text-purple-700">Marketplace</span>
                        <span className="block text-xs text-purple-600">Connect buyers</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Commercial Activity Feed */}
              <div className="bg-white rounded-2xl shadow-lg">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Commercial Activity</h3>
                      <p className="text-gray-500 text-sm">Recent field and market activities</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-green-600 text-sm font-medium hover:text-green-700 flex items-center space-x-1">
                        <span>View All</span>
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-50">
                  {fields.slice(0, 3).map((field, index) => (
                    <div key={field._id} className="p-6 hover:bg-gray-50/50 transition-all duration-200 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                            index === 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                            index === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                            'bg-gradient-to-br from-yellow-500 to-orange-600'
                          }`}>
                            <GiWheat className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{field.name}</h4>
                            <div className="flex items-center space-x-3 mt-1">
                              <p className="text-sm text-gray-500 flex items-center space-x-1">
                                <FiMapPin className="w-3 h-3" />
                                <span>{field.location}</span>
                              </p>
                              <p className="text-sm text-gray-500 flex items-center space-x-1">
                                <GiPlantSeed className="w-3 h-3" />
                                <span>{field.crop}</span>
                              </p>
                              <p className="text-sm text-gray-500 flex items-center space-x-1">
                                <FiClock className="w-3 h-3" />
                                <span>{field.lastUpdate}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              field.status === 'active' ? 'bg-green-100 text-green-800' :
                              field.status === 'harvested' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {field.status}
                            </span>
                            <p className={`text-sm font-bold mt-1 ${getHealthScoreColor(field.healthScore)}`}>
                              {field.healthScore}% Health
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <FiThumbsUp className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <FiMessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fields' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Fields</h2>
                  <p className="text-gray-600">Manage and monitor all your agricultural fields</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <FiFilter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <FiPlus className="w-4 h-4" />
                    <span>Add Field</span>
                  </button>
                </div>
              </div>

              {/* Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fields.map((field) => (
                  <div key={field._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Field Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{field.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{field.location}</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <FiMoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="mt-4 flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(field.status)}`}>
                          {field.status}
                        </span>
                        <span className="text-sm text-gray-500">{field.landArea} hectares</span>
                      </div>
                    </div>

                    {/* Field Details */}
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Health Score</span>
                        <span className={`font-semibold ${getHealthScoreColor(field.healthScore)}`}>
                          {field.healthScore}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Crop Type</span>
                        <span className="font-medium text-gray-900">{field.crop}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Growth Stage</span>
                        <span className="font-medium text-gray-900">{field.growthStage}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Expected Harvest</span>
                        <span className="font-medium text-gray-900">{field.expectedHarvest}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Updated {field.lastUpdate}</span>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <p className="text-gray-600">Detailed insights and performance metrics</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <FiBarChart className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Distribution</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <FiPieChart className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Marketplace</h2>
                <p className="text-gray-600">Connect with buyers and explore market opportunities</p>
              </div>
              
              <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
                <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Marketplace Coming Soon</h3>
                <p className="text-gray-600">Connect directly with buyers and sell your produce at the best prices.</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600">Manage your account and preferences</p>
              </div>
              
              <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
                <FiSettings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings Panel</h3>
                <p className="text-gray-600">Configure your dashboard preferences and account settings.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ModernDashboard;
