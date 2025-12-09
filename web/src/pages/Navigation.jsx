import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import Button from '../components/common/Button';
import { stopNavigation, nextStep, previousStep } from '../store/slices/routeSlice';
import {
  XMarkIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import 'leaflet/dist/leaflet.css';

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedRoute, currentStep, isNavigating } = useSelector((state) => state.route);
  const [isDarkMode, setIsDarkMode] = useState(true); // Always dark during navigation
  const [nextObstacle, setNextObstacle] = useState(null);

  useEffect(() => {
    // Force dark mode during navigation
    setIsDarkMode(true);
    
    // Mock: Set next obstacle warning
    setNextObstacle({
      type: 'Speed Bump',
      distance: '300m ahead',
    });

    // TODO: Implement voice guidance using Web Speech API
    // const utterance = new SpeechSynthesisUtterance('Navigation started');
    // window.speechSynthesis.speak(utterance);
  }, []);

  const handleStopNavigation = () => {
    dispatch(stopNavigation());
    navigate('/');
  };

  if (!selectedRoute || !isNavigating) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">No active navigation</p>
          <Button onClick={() => navigate('/')}>
            Back to Map
          </Button>
        </div>
      </div>
    );
  }

  // Mock current instruction
  const currentInstruction = selectedRoute.steps?.[currentStep] || {
    icon: '↑',
    instruction: 'Continue straight',
    distance: '500 m',
    streetName: 'Main Street',
  };

  const nextInstruction = selectedRoute.steps?.[currentStep + 1] || {
    icon: '→',
    instruction: 'Turn right',
    streetName: 'Oak Avenue',
  };

  // Mock route data
  const eta = '3:45 PM';
  const remainingTime = '12 min';
  const remainingDistance = '5.2 km';

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Top Bar - Minimal */}
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleStopNavigation}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
            >
              <XMarkIcon className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedRoute.destination_name || 'Destination'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {remainingDistance} • {remainingTime}
            </p>
          </div>
        </div>
      </div>

      {/* Huge ETA Display */}
      <div className={`${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-gradient-to-b from-white to-gray-50'} py-8 text-center`}>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
          Estimated Arrival
        </p>
        <p className={`text-eta font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {eta}
        </p>
        <p className={`text-distance font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
          {remainingTime}
        </p>
        <p className={`text-lg ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          {remainingDistance} remaining
        </p>
      </div>

      {/* Current Turn Card */}
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} mx-4 mb-4 rounded-2xl shadow-2xl p-6`}>
        <div className="flex items-center gap-6">
          {/* Large Arrow */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl p-6 flex-shrink-0`}>
            <ArrowUpIcon className={`h-16 w-16 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
          </div>
          
          {/* Instruction */}
          <div className="flex-1">
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              {currentInstruction.instruction}
            </p>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentInstruction.streetName}
            </p>
            <p className={`text-lg font-semibold ${isDarkMode ? 'text-primary-light' : 'text-primary-main'} mt-2`}>
              {currentInstruction.distance}
            </p>
          </div>
        </div>
      </div>

      {/* Obstacle Warning */}
      {nextObstacle && (
        <div className="mx-4 mb-4 bg-warning-main/90 backdrop-blur-lg rounded-2xl p-4 flex items-center gap-3 shadow-xl">
          <ExclamationTriangleIcon className="h-8 w-8 text-white flex-shrink-0" />
          <div>
            <p className="text-white font-bold text-lg">{nextObstacle.type}</p>
            <p className="text-white text-sm">{nextObstacle.distance}</p>
          </div>
        </div>
      )}

      {/* Next Turn Preview */}
      {nextInstruction && (
        <div className={`mx-4 mb-4 ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-lg rounded-xl p-4 flex items-center gap-3 shadow-lg`}>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-3`}>
            <ArrowRightIcon className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wide`}>
              Then
            </p>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {nextInstruction.instruction}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {nextInstruction.streetName}
            </p>
          </div>
        </div>
      )}

      {/* Map - Compact View */}
      <div className="flex-1 relative mx-4 mb-4 rounded-2xl overflow-hidden shadow-2xl">
        <MapContainer
          center={[40.7228, -74.0160]}
          zoom={16}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url={isDarkMode 
              ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />
          
          {/* Mock route path */}
          <Polyline
            positions={[[40.7128, -74.0060], [40.7228, -74.0160], [40.7328, -74.0260]]}
            pathOptions={{
              color: '#0066FF',
              weight: 6,
              opacity: 0.8,
            }}
          />

          {/* User location marker */}
          <Marker position={[40.7228, -74.0160]} />
        </MapContainer>

        {/* Map Overlay Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={() => dispatch(previousStep())}
            disabled={currentStep === 0}
            className={`px-4 py-2 ${isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-lg rounded-full shadow-lg disabled:opacity-50`}
          >
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Previous
            </span>
          </button>
          <button
            onClick={() => dispatch(nextStep())}
            disabled={currentStep >= (selectedRoute.steps?.length || 0) - 1}
            className={`px-4 py-2 ${isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-lg rounded-full shadow-lg disabled:opacity-50`}
          >
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Next
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
