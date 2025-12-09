import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ReportObstacleModal from '../components/reporting/ReportObstacleModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { setCenter, setUserLocation } from '../store/slices/mapSlice';
import { openReportModal } from '../store/slices/obstacleSlice';
import { geocodeAddress } from '../services/routing';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  BuildingOfficeIcon,
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
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setUserLocation({ lat: latitude, lng: longitude }));
          dispatch(setCenter([latitude, longitude]));
          setFromInput('Current Location');
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a reasonable location if geolocation fails
          dispatch(setCenter([40.7128, -74.0060])); // New York
        }
      );
    }

    // Check if destination was passed from search
    if (location.state?.destination) {
      const dest = location.state.destination;
      setToInput(dest.display_name || 'Selected Location');
      setSelectedDestination({
        lat: parseFloat(dest.lat),
        lng: parseFloat(dest.lon),
        name: dest.display_name,
      });
      dispatch(setCenter([parseFloat(dest.lat), parseFloat(dest.lon)]));
    }
  }, [dispatch, location.state]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setUserLocation({ lat: latitude, lng: longitude }));
          dispatch(setCenter([latitude, longitude]));
          setFromInput('Current Location');
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
    navigate('/route-result');
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
    // TODO: Implement quick actions based on saved favorites
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      // Navigate to saved location
    }
  };

  return (
    <div className="h-screen relative overflow-hidden">
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
            Sign in to save routes, report obstacles, and unlock premium features.
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

      {/* Translucent Header with Backdrop Blur */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/80 backdrop-blur-lg shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Dual Search Input */}
          <div className="space-y-2">
            {/* From Input */}
            <div className="relative">
              <div className="flex items-center bg-white rounded-xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="pl-4">
                  <div className="w-3 h-3 bg-primary-main rounded-full" />
                </div>
                <input
                  type="text"
                  value={fromInput}
                  onClick={() => navigate('/search')}
                  readOnly
                  placeholder="Current location"
                  className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-base font-medium cursor-pointer"
                />
                <button
                  onClick={handleUseCurrentLocation}
                  className="mr-3 text-sm text-primary-main hover:text-primary-dark font-semibold px-3 py-1 rounded-lg hover:bg-primary-lighter transition-colors"
                >
                  Use Current
                </button>
              </div>
            </div>

            {/* To Input */}
            <div className="relative">
              <div className="flex items-center bg-white rounded-xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="pl-4">
                  <div className="w-3 h-3 bg-danger-main rounded-full" />
                </div>
                <input
                  type="text"
                  value={toInput}
                  onClick={() => navigate('/search')}
                  readOnly
                  placeholder="Where to?"
                  className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-base font-medium cursor-pointer"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-4" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            <button
              onClick={() => handleQuickAction('home')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              <HomeIcon className="h-5 w-5 text-primary-main" />
              <span className="text-sm font-semibold">Home</span>
            </button>
            <button
              onClick={() => handleQuickAction('work')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              <BuildingOfficeIcon className="h-5 w-5 text-primary-main" />
              <span className="text-sm font-semibold">Work</span>
            </button>
            <button
              onClick={() => handleQuickAction('favorites')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              <StarIcon className="h-5 w-5 text-warning-main" />
              <span className="text-sm font-semibold">Favorites</span>
            </button>
          </div>

          {/* Guest User Prompt */}
          {!isAuthenticated && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-600">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-primary-main hover:text-primary-dark font-semibold"
                >
                  Sign in to save routes
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Route Preview Panel */}
      {selectedDestination && (
        <div className="absolute top-[240px] left-4 right-4 z-[999] max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-1 text-lg">Route Preview</h3>
            <p className="text-sm text-gray-600 mb-4 truncate">{selectedDestination.name}</p>
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">Distance</p>
                <p className="text-sm font-bold">Calculating...</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">Time</p>
                <p className="text-sm font-bold">Calculating...</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">Smoothness</p>
                <p className="text-sm font-bold">Calculating...</p>
              </div>
            </div>
            <Button fullWidth onClick={handleStartNavigation}>
              View Routes
            </Button>
          </div>
        </div>
      )}

      {/* Floating Action Buttons - Right Side */}
      <div className="absolute bottom-8 right-4 z-[998] flex flex-col gap-3">
        {/* User Location Button */}
        <button
          onClick={handleCenterOnUser}
          className="bg-white/90 backdrop-blur-lg rounded-full p-4 shadow-2xl hover:shadow-xl transition-all border border-gray-100 hover:scale-110"
          title="Center on my location"
        >
          <MapPinIcon className="h-6 w-6 text-primary-main" />
        </button>

        {/* Report Obstacle Button */}
        <button
          onClick={handleReportObstacle}
          className="bg-white/90 backdrop-blur-lg rounded-full p-4 shadow-2xl hover:shadow-xl transition-all border border-gray-100 hover:scale-110"
          title="Report obstacle"
        >
          <ExclamationTriangleIcon className="h-6 w-6 text-warning-main" />
        </button>
      </div>

      {/* User Profile Button - Top Right (for authenticated users) */}
      {isAuthenticated && user && (
        <div className="absolute top-[240px] right-4 z-[998]">
          <Link to="/profile">
            <button className="bg-white/90 backdrop-blur-lg rounded-full p-3 shadow-xl hover:shadow-2xl transition-all border border-gray-100">
              <UserCircleIcon className="h-6 w-6 text-primary-main" />
            </button>
          </Link>
        </div>
      )}

      {/* Sign In Button - Top Right (only for guests) */}
      {!isAuthenticated && (
        <div className="absolute top-[240px] right-4 z-[998]">
          <Link to="/login">
            <button className="bg-primary-main text-white rounded-full px-5 py-3 shadow-xl hover:shadow-2xl transition-all hover:bg-primary-dark flex items-center gap-2">
              <UserCircleIcon className="h-5 w-5" />
              <span className="text-sm font-semibold">Sign In</span>
            </button>
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
  );
};

export default Map;
