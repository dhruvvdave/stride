import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { geocodeAddress } from '../services/routing';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';

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

    // Load favorites if authenticated
    if (isAuthenticated) {
      // TODO: Fetch from API
      setFavorites([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 2) {
        setIsLoading(true);
        try {
          const results = await geocodeAddress(searchQuery);
          if (Array.isArray(results)) {
            setSuggestions(results.slice(0, 8));
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectLocation = (location) => {
    // Add to recent searches
    const newRecent = [
      location,
      ...recentSearches.filter((r) => r.display_name !== location.display_name),
    ].slice(0, 10);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));

    // Navigate back to map with selected location
    navigate('/', { state: { destination: location } });
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate('/', {
            state: {
              destination: {
                lat: latitude.toString(),
                lon: longitude.toString(),
                display_name: 'Current Location',
              },
            },
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
            </button>
            
            <div className="flex-1 relative">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a place..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-base"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Current Location Option */}
        <button
          onClick={handleUseCurrentLocation}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors mb-4 shadow-sm"
        >
          <div className="p-2 bg-primary-lighter rounded-full">
            <MapPinIcon className="h-6 w-6 text-primary-main" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Use Current Location</p>
            <p className="text-sm text-gray-500">Enable location services</p>
          </div>
        </button>

        {/* Search Results */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              Search Results
            </h3>
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectLocation(suggestion)}
                  className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {suggestion.display_name.split(',')[0]}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {suggestion.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              Recent Searches
            </h3>
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectLocation(search)}
                  className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {search.display_name.split(',')[0]}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {search.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Favorites (for authenticated users) */}
        {!searchQuery && isAuthenticated && favorites.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              Favorites
            </h3>
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
              {favorites.map((favorite, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectLocation(favorite)}
                  className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <StarIcon className="h-5 w-5 text-warning-main mt-0.5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900">{favorite.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {favorite.address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && recentSearches.length === 0 && favorites.length === 0 && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Search for a destination to get started</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
