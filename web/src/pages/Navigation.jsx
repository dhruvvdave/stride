import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Layout from '../components/layout/Layout';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import { stopNavigation, nextStep, previousStep } from '../store/slices/routeSlice';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import 'leaflet/dist/leaflet.css';

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedRoute, currentStep, isNavigating } = useSelector((state) => state.route);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Get route from location state if available
  const routeData = location.state?.route || selectedRoute;

  // Auto dark mode during navigation
  useEffect(() => {
    setIsDarkMode(true); // Always dark during navigation
  }, []);

  // Mock navigation data
  const mockNavigation = {
    eta: '3:45 PM',
    timeRemaining: '15 min',
    distanceRemaining: '7.2 km',
    nextTurn: {
      instruction: 'Turn right onto Main Street',
      distance: '300 m',
      icon: '→',
    },
    upcomingObstacle: {
      type: 'Speed Bump',
      distance: '300 m ahead',
      severity: 'medium',
    },
  };

  const handleStopNavigation = () => {
    dispatch(stopNavigation());
    navigate('/');
  };

  if (!routeData && !isNavigating) {
    return (
      <Layout requireAuth={false}>
        <div className="p-6 max-w-7xl mx-auto">
          <GlassCard className="p-8">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No active navigation</p>
              <Button onClick={() => navigate('/')}>
                Back to Map
              </Button>
            </div>
          </GlassCard>
        </div>
      </Layout>
    );
  }

  return (
    <div className={`h-screen ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Minimal UI - Safety First */}
      
      {/* Huge ETA Display */}
      <div className={`absolute top-0 left-0 right-0 z-[1000] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <GlassCard dark={isDarkMode} className="m-4 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <div className="text-eta font-bold mb-1">{mockNavigation.timeRemaining}</div>
              <div className="text-sm opacity-75">Arrives at {mockNavigation.eta}</div>
            </div>
            <button
              onClick={handleStopNavigation}
              className="p-3 bg-danger-main rounded-full hover:bg-danger-dark transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="text-body opacity-75">{mockNavigation.distanceRemaining} remaining</div>
        </GlassCard>
      </div>

      {/* Next Turn Card */}
      <div className={`absolute top-48 left-0 right-0 z-[999] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard dark={isDarkMode} className="mx-4 p-6">
            <div className="flex items-center gap-6">
              {/* Large Arrow */}
              <div className="text-6xl">{mockNavigation.nextTurn.icon}</div>
              
              <div className="flex-1">
                <div className="text-distance font-semibold mb-1">
                  {mockNavigation.nextTurn.distance}
                </div>
                <div className="text-body">
                  {mockNavigation.nextTurn.instruction}
                </div>
              </div>

              <ChevronRightIcon className="h-8 w-8 opacity-50" />
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Obstacle Warning */}
      {mockNavigation.upcomingObstacle && (
        <div className="absolute top-96 left-0 right-0 z-[998]">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard dark={isDarkMode} className="mx-4 p-4 bg-warning-main/80">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-white flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-white font-semibold">
                    {mockNavigation.upcomingObstacle.type}
                  </div>
                  <div className="text-white/90 text-sm">
                    {mockNavigation.upcomingObstacle.distance}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Map (fills the screen) */}
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={16}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            isDarkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
      </MapContainer>
    </div>
  );
};

export default Navigation;
