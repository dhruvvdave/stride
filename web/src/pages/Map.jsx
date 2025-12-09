import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import ReportObstacleModal from '../components/reporting/ReportObstacleModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';
import { setCenter, setUserLocation } from '../store/slices/mapSlice';
import { openReportModal } from '../store/slices/obstacleSlice';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  BriefcaseIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to update map center
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

const Map = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { center, zoom, obstacles, userLocation } = useSelector((state) => state.map);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [mapReady, setMapReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Handle location from SearchScreen
  useEffect(() => {
    if (location.state?.selectedLocation) {
      const loc = location.state.selectedLocation;
      setSelectedDestination(loc);
      setToLocation(loc.name);
      dispatch(setCenter([loc.lat, loc.lng]));
    }
  }, [location.state, dispatch]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setUserLocation({ lat: latitude, lng: longitude }));
          dispatch(setCenter([latitude, longitude]));
          setFromLocation('Current Location');
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a reasonable location if geolocation fails
          dispatch(setCenter([40.7128, -74.0060])); // New York
        }
      );
    }
  }, [dispatch]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setUserLocation({ lat: latitude, lng: longitude }));
          dispatch(setCenter([latitude, longitude]));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleStartNavigation = () => {
    if (!selectedDestination) {
      return;
    }
    // Navigate to route result page
    navigate('/route-result', { state: { destination: selectedDestination } });
  };

  const handleReportObstacle = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      dispatch(openReportModal({}));
    }
  };

  const handleCenterOnUser = () => {
    if (userLocation) {
      dispatch(setCenter([userLocation.lat, userLocation.lng]));
    } else {
      handleUseCurrentLocation();
    }
  };

  const handleQuickAction = (type) => {
    // Quick actions for Home, Work, etc.
    // This would typically load saved locations from user profile
    console.log('Quick action:', type);
  };

  return (
    <Layout requireAuth={false}>
      <ReportObstacleModal />
      
      {/* Auth Modal for guest users */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In Required"
        size="sm"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Sign in to report obstacles and unlock premium features like saving routes and advanced analytics.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="w-full">
              <Button fullWidth>Sign In</Button>
            </Link>
            <Link to="/register" className="w-full">
              <Button variant="secondary" fullWidth>Create Account</Button>
            </Link>
          </div>
        </div>
      </Modal>

      <div className="h-[calc(100vh-64px)] relative">
        {/* Translucent Header with Backdrop Blur */}
        <div className="absolute top-0 left-0 right-0 z-[1000]">
          <GlassCard className="m-4 p-4">
            <div className="space-y-3">
              {/* From → To Dual Search */}
              <div className="relative">
                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3">
                  <MapPinIcon className="h-5 w-5 text-primary-main mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={fromLocation}
                    readOnly
                    placeholder="From"
                    className="flex-1 bg-transparent border-none focus:outline-none text-body font-medium"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 cursor-pointer"
                     onClick={() => navigate('/search')}>
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={toLocation}
                    placeholder="Where to?"
                    readOnly
                    className="flex-1 bg-transparent border-none focus:outline-none text-body cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAction('home')}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <HomeIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Home</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAction('work')}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <BriefcaseIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Work</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAction('favorites')}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <StarIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Favorites</span>
                </motion.button>
              </div>
            </div>

            {/* Guest User Prompt */}
            {!isAuthenticated && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-600">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-primary-main hover:text-primary-dark font-semibold"
                  >
                    Sign in
                  </button>
                  {' '}to save routes
                </p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Floating Action Buttons - Right Side */}
        <div className="absolute bottom-8 right-4 z-[998] flex flex-col gap-3">
          {/* Recenter Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCenterOnUser}
            className="bg-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-shadow"
            title="Center on my location"
          >
            <MapPinIcon className="h-6 w-6 text-primary-main" />
          </motion.button>

          {/* Report Obstacle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReportObstacle}
            className="bg-warning-main rounded-full p-4 shadow-xl hover:shadow-2xl transition-shadow"
            title="Report obstacle"
          >
            <ExclamationTriangleIcon className="h-6 w-6 text-white" />
          </motion.button>
        </div>

        {/* Sign In Button - Top Right (only for guests) */}
        {!isAuthenticated && (
          <div className="absolute top-4 right-20 z-[998]">
            <Link to="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm">
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  Sign In
                </Button>
              </motion.div>
            </Link>
          </div>
        )}

        {/* Map */}
        <MapContainer
          center={center}
          zoom={zoom}
          className="h-full w-full"
          zoomControl={true}
          whenReady={() => setMapReady(true)}
        >
          <MapUpdater center={center} zoom={zoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Destination Marker */}
          {selectedDestination && (
            <Marker position={[selectedDestination.lat, selectedDestination.lng]}>
              <Popup>{selectedDestination.name}</Popup>
            </Marker>
          )}

          {/* Obstacle Markers */}
          {obstacles.map((obstacle) => (
            <Marker
              key={obstacle.id}
              position={[obstacle.latitude, obstacle.longitude]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-lg mb-1">{obstacle.type}</h3>
                  <p className="text-sm text-gray-600 mb-2">{obstacle.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`
                      px-2 py-1 rounded text-xs font-semibold
                      ${obstacle.severity === 'high' ? 'bg-danger-lighter text-danger-dark' : ''}
                      ${obstacle.severity === 'medium' ? 'bg-warning-lighter text-warning-dark' : ''}
                      ${obstacle.severity === 'low' ? 'bg-success-lighter text-success-dark' : ''}
                    `}>
                      {obstacle.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {obstacle.votes || 0} votes
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Layout>
  );
};

export default Map;
