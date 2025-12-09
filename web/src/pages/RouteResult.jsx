import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import Layout from '../components/layout/Layout';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import { 
  ClockIcon, 
  MapPinIcon,
  ExclamationTriangleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import 'leaflet/dist/leaflet.css';

const RouteResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { routes, selectedRoute } = useSelector((state) => state.route);
  const [selectedRouteIndex, setSelectedRouteIndex] = React.useState(0);

  // Mock routes data (in real app, this would come from API)
  const mockRoutes = [
    {
      id: 1,
      type: 'smooth',
      name: 'Smooth Route',
      distance: '8.2 km',
      duration: '18 min',
      eta: '3:45 PM',
      obstacleCount: 2,
      timeDifference: '+3 min',
      smoothnessScore: 95,
      color: '#00C853',
      coordinates: [],
      premium: false,
    },
    {
      id: 2,
      type: 'standard',
      name: 'Standard Route',
      distance: '7.8 km',
      duration: '16 min',
      eta: '3:43 PM',
      obstacleCount: 5,
      timeDifference: '+1 min',
      smoothnessScore: 75,
      color: '#0066FF',
      coordinates: [],
      premium: false,
    },
    {
      id: 3,
      type: 'fastest',
      name: 'Fastest Route',
      distance: '7.5 km',
      duration: '15 min',
      eta: '3:42 PM',
      obstacleCount: 8,
      timeDifference: 'Fastest',
      smoothnessScore: 60,
      color: '#9E9E9E',
      coordinates: [],
      premium: true,
    },
  ];

  const handleSelectRoute = (index) => {
    setSelectedRouteIndex(index);
  };

  const handleStartNavigation = () => {
    navigate('/navigate', { state: { route: mockRoutes[selectedRouteIndex] } });
  };

  return (
    <Layout requireAuth={false}>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Map showing all routes */}
        <div className="flex-1 relative">
          <MapContainer
            center={[40.7128, -74.006]}
            zoom={13}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Route polylines would be rendered here */}
          </MapContainer>

          {/* Translucent header */}
          <div className="absolute top-4 left-4 right-4 z-[1000]">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Choose Your Route</h2>
                  <p className="text-sm text-gray-600">Select the best route for your journey</p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-primary-main hover:text-primary-dark font-semibold"
                >
                  Back
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Route Cards - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-6xl mx-auto">
              {mockRoutes.map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleSelectRoute(index)}
                  className="cursor-pointer"
                >
                  <GlassCard
                    className={`p-4 transition-all ${
                      selectedRouteIndex === index
                        ? 'ring-4 ring-offset-2'
                        : ''
                    }`}
                    style={{
                      ringColor: selectedRouteIndex === index ? route.color : 'transparent',
                    }}
                  >
                    {/* Route Type Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: route.color }}
                      >
                        {route.name}
                      </div>
                      {route.premium && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                          <StarIcon className="h-4 w-4 text-yellow-600" />
                          <span className="text-xs font-semibold text-yellow-600">AI</span>
                        </div>
                      )}
                    </div>

                    {/* ETA - Large Display */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-distance font-bold text-gray-900">{route.duration}</span>
                        <span className="text-sm text-gray-500">{route.timeDifference}</span>
                      </div>
                      <p className="text-sm text-gray-600">Arrives at {route.eta}</p>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPinIcon className="h-4 w-4" />
                          <span>Distance</span>
                        </div>
                        <span className="font-semibold text-gray-900">{route.distance}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          <span>Obstacles</span>
                        </div>
                        <span className="font-semibold text-gray-900">{route.obstacleCount}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>Smoothness</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full"
                              style={{ 
                                width: `${route.smoothnessScore}%`,
                                backgroundColor: route.color,
                              }}
                            />
                          </div>
                          <span className="font-semibold text-gray-900">{route.smoothnessScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Select Button */}
                    {selectedRouteIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Button 
                          fullWidth
                          onClick={handleStartNavigation}
                          className="mt-2"
                        >
                          Start Navigation
                        </Button>
                      </motion.div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RouteResult;
