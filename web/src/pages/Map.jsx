import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
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
  Bars3Icon,
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
  const { center, zoom, obstacles, userLocation } = useSelector((state) => state.map);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [mapReady, setMapReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentLocationInput, setCurrentLocationInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionField, setActiveSuggestionField] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setUserLocation({ lat: latitude, lng: longitude }));
          dispatch(setCenter([latitude, longitude]));
          setCurrentLocationInput('Current Location');
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a reasonable location if geolocation fails
          dispatch(setCenter([40.7128, -74.0060])); // New York
        }
      );
    }
  }, [dispatch]);

  const handleSearchInput = useCallback(async (value, field) => {
    if (field === 'current') {
      setCurrentLocationInput(value);
    } else {
      setDestinationInput(value);
    }
    
    setActiveSuggestionField(field);
    
    if (value.length > 2) {
      try {
        const results = await geocodeAddress(value);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleSelectSuggestion = (suggestion) => {
    if (activeSuggestionField === 'current') {
      setCurrentLocationInput(suggestion.display_name);
      dispatch(setCenter([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]));
    } else {
      setDestinationInput(suggestion.display_name);
      setSelectedDestination({
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon),
        name: suggestion.display_name,
      });
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setUserLocation({ lat: latitude, lng: longitude }));
          dispatch(setCenter([latitude, longitude]));
          setCurrentLocationInput('Current Location');
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
        {/* Top Search Bar */}
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-white shadow-md">
          <div className="max-w-4xl mx-auto p-4">
            <div className="space-y-3">
              {/* Current Location Input */}
              <div className="relative">
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 focus-within:border-primary-main focus-within:ring-2 focus-within:ring-primary-lighter">
                  <MapPinIcon className="h-5 w-5 text-primary-main ml-3" />
                  <input
                    type="text"
                    value={currentLocationInput}
                    onChange={(e) => handleSearchInput(e.target.value, 'current')}
                    placeholder="Current location"
                    className="w-full px-3 py-3 bg-transparent border-none focus:outline-none text-sm"
                  />
                  <button
                    onClick={handleUseCurrentLocation}
                    className="mr-2 text-xs text-primary-main hover:text-primary-dark font-medium"
                  >
                    Use Current
                  </button>
                </div>
              </div>

              {/* Destination Input */}
              <div className="relative">
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 focus-within:border-primary-main focus-within:ring-2 focus-within:ring-primary-lighter">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-3" />
                  <input
                    type="text"
                    value={destinationInput}
                    onChange={(e) => handleSearchInput(e.target.value, 'destination')}
                    placeholder="Where to?"
                    className="w-full px-3 py-3 bg-transparent border-none focus:outline-none text-sm"
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto z-50">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {suggestion.display_name.split(',')[0]}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {suggestion.display_name}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Guest User Prompt */}
            {!isAuthenticated && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-primary-main hover:text-primary-dark font-medium"
                  >
                    Sign in
                  </button>
                  {' '}to save routes and unlock premium features
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Route Preview Panel */}
        {selectedDestination && (
          <div className="absolute top-[180px] left-4 right-4 z-[999] max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Route Preview</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{selectedDestination.name}</p>
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="text-sm font-semibold">-- km</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-sm font-semibold">-- min</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Smoothness</p>
                  <p className="text-sm font-semibold">--/100</p>
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
            className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            title="Center on my location"
          >
            <MapPinIcon className="h-6 w-6 text-primary-main" />
          </button>

          {/* Report Obstacle Button */}
          <button
            onClick={handleReportObstacle}
            className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            title="Report obstacle"
          >
            <ExclamationTriangleIcon className="h-6 w-6 text-warning-main" />
          </button>
        </div>

        {/* Sign In Button - Top Right (only for guests) */}
        {!isAuthenticated && (
          <div className="absolute top-[180px] right-4 z-[998]">
            <Link to="/login">
              <Button size="sm">
                <UserCircleIcon className="h-5 w-5 mr-2" />
                Sign In
              </Button>
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
