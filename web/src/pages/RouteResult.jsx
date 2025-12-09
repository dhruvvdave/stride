import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { 
  ClockIcon, 
  MapIcon, 
  ExclamationTriangleIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

const RouteResult = () => {
  const navigate = useNavigate();
  const { routes, selectedRoute } = useSelector((state) => state.route);
  const [hoveredRoute, setHoveredRoute] = useState(null);
  const [activeRoute, setActiveRoute] = useState(selectedRoute?.id || null);

  // Mock data for demonstration (in real app, this comes from API)
  const mockRoutes = routes.length > 0 ? routes : [
    {
      id: 1,
      type: 'smooth',
      name: 'Smooth Route',
      description: 'Optimized for comfort',
      distance: '12.4 km',
      duration: '25 min',
      eta: '3:45 PM',
      smoothness_score: 95,
      obstacles_count: 2,
      timeDiff: '+2 min',
      isPremium: true,
      color: '#00C853',
      path: [[40.7128, -74.0060], [40.7228, -74.0160], [40.7328, -74.0260]],
    },
    {
      id: 2,
      type: 'standard',
      name: 'Standard Route',
      description: 'Balanced route',
      distance: '11.8 km',
      duration: '23 min',
      eta: '3:43 PM',
      smoothness_score: 78,
      obstacles_count: 5,
      timeDiff: 'Fastest',
      isPremium: false,
      color: '#0066FF',
      path: [[40.7128, -74.0060], [40.7228, -74.0140], [40.7328, -74.0260]],
    },
    {
      id: 3,
      type: 'fastest',
      name: 'Fastest Route',
      description: 'Quickest arrival',
      distance: '10.2 km',
      duration: '20 min',
      eta: '3:40 PM',
      smoothness_score: 65,
      obstacles_count: 8,
      timeDiff: '-3 min',
      isPremium: false,
      color: '#9E9E9E',
      path: [[40.7128, -74.0060], [40.7228, -74.0120], [40.7328, -74.0260]],
    },
  ];

  const handleStartNavigation = (route) => {
    setActiveRoute(route.id);
    // TODO: Dispatch route selection to Redux
    navigate('/navigate');
  };

  const handleRouteHover = (routeId) => {
    setHoveredRoute(routeId);
  };

  const getRouteCardColor = (type) => {
    switch (type) {
      case 'smooth':
        return 'border-success-main bg-success-lighter/20';
      case 'standard':
        return 'border-primary-main bg-primary-lighter/20';
      case 'fastest':
        return 'border-gray-400 bg-gray-100/50';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Route Options</h1>
              <p className="text-sm text-gray-600">Choose your preferred route</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Back to Map
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Map View - Left Side */}
        <div className="flex-1 relative">
          <MapContainer
            center={[40.7228, -74.0160]}
            zoom={13}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render all route paths */}
            {mockRoutes.map((route) => (
              <Polyline
                key={route.id}
                positions={route.path}
                pathOptions={{
                  color: route.color,
                  weight: hoveredRoute === route.id || activeRoute === route.id ? 6 : 4,
                  opacity: hoveredRoute === route.id || activeRoute === route.id ? 1 : 0.6,
                }}
              />
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-lg rounded-xl shadow-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Routes</p>
            {mockRoutes.map((route) => (
              <div key={route.id} className="flex items-center gap-2 mb-1">
                <div
                  className="w-4 h-1 rounded"
                  style={{ backgroundColor: route.color }}
                />
                <span className="text-xs text-gray-600">{route.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Route Cards - Right Side */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-4 space-y-3">
          {mockRoutes.map((route) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: route.id * 0.1 }}
              onMouseEnter={() => handleRouteHover(route.id)}
              onMouseLeave={() => handleRouteHover(null)}
              className={`
                relative border-2 rounded-2xl p-4 cursor-pointer transition-all
                ${getRouteCardColor(route.type)}
                ${activeRoute === route.id ? 'ring-2 ring-offset-2 ring-primary-main' : ''}
                hover:shadow-xl
              `}
              onClick={() => setActiveRoute(route.id)}
            >
              {/* Premium Badge */}
              {route.isPremium && (
                <div className="absolute top-3 right-3">
                  <div className="bg-premium-main text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <SparklesIcon className="h-3 w-3" />
                    AI Premium
                  </div>
                </div>
              )}

              {/* Route Type Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: route.color }}
                />
                <h3 className="text-lg font-bold text-gray-900">{route.name}</h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">{route.description}</p>

              {/* ETA Display */}
              <div className="bg-white rounded-xl p-3 mb-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {route.duration}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      route.timeDiff.includes('+')
                        ? 'text-warning-main'
                        : route.timeDiff === 'Fastest'
                        ? 'text-success-main'
                        : 'text-success-main'
                    }`}
                  >
                    {route.timeDiff}
                  </span>
                </div>
                <p className="text-sm text-gray-500">ETA: {route.eta}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                  <MapIcon className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="text-sm font-bold text-gray-900">{route.distance}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                  <CheckCircleIcon className="h-4 w-4 text-success-main mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Smooth</p>
                  <p className="text-sm font-bold text-gray-900">{route.smoothness_score}/100</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                  <ExclamationTriangleIcon className="h-4 w-4 text-warning-main mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Obstacles</p>
                  <p className="text-sm font-bold text-gray-900">{route.obstacles_count}</p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                fullWidth
                variant={activeRoute === route.id ? 'primary' : 'secondary'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartNavigation(route);
                }}
              >
                {activeRoute === route.id ? 'Start Navigation' : 'Select Route'}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteResult;
