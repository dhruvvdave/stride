import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { geocodeAddress } from '../services/routing';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  XMarkIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';

const SearchScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }

    // Load favorites for authenticated users
    if (isAuthenticated) {
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const searchLocations = async () => {
      if (searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await geocodeAddress(searchQuery);
        if (Array.isArray(results)) {
          setSuggestions(results.slice(0, 8));
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectLocation = (location) => {
    // Save to recent searches
    const newRecent = [
      location,
      ...recentSearches.filter(r => r.place_id !== location.place_id).slice(0, 9)
    ];
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));

    // Navigate back with selected location
    navigate('/', { 
      state: { 
        selectedLocation: {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon),
          name: location.display_name,
        }
      } 
    });
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate('/', { 
            state: { 
              selectedLocation: {
                lat: latitude,
                lng: longitude,
                name: 'Current Location',
              }
            } 
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where to?"
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary-main text-body"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Current Location */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUseCurrentLocation}
          className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-primary-main rounded-full flex items-center justify-center">
            <MapPinIcon className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Current Location</p>
            <p className="text-sm text-gray-500">Use my current location</p>
          </div>
        </motion.button>

        {/* Search Results */}
        {searchQuery.length >= 3 && (
          <div className="bg-white">
            {isLoading ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Searching...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.place_id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectLocation(suggestion)}
                  className="w-full border-b border-gray-100 px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                >
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {suggestion.display_name.split(',')[0]}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {suggestion.display_name}
                    </p>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No results found
              </div>
            )}
          </div>
        )}

        {/* Recent Searches */}
        {searchQuery.length < 3 && recentSearches.length > 0 && (
          <div className="mt-6">
            <div className="px-6 py-2 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Searches</h2>
              <button
                onClick={handleClearRecent}
                className="text-sm text-primary-main hover:text-primary-dark"
              >
                Clear
              </button>
            </div>
            <div className="bg-white">
              {recentSearches.map((item, index) => (
                <motion.button
                  key={item.place_id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => handleSelectLocation(item)}
                  className="w-full border-b border-gray-100 px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                >
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {item.display_name.split(',')[0]}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {item.display_name}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Favorites (for authenticated users) */}
        {searchQuery.length < 3 && isAuthenticated && favorites.length > 0 && (
          <div className="mt-6">
            <div className="px-6 py-2">
              <h2 className="font-semibold text-gray-900">Favorites</h2>
            </div>
            <div className="bg-white">
              {favorites.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => handleSelectLocation(item)}
                  className="w-full border-b border-gray-100 px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                >
                  <StarIcon className="h-5 w-5 text-warning-main mt-1 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {item.name || item.display_name?.split(',')[0]}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {item.address || item.display_name}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
