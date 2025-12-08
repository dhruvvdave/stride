import api from './api';

export const planRoute = async ({ origin, destination, preferences = {} }) => {
  const response = await api.post('/api/routes/plan', {
    origin,
    destination,
    preferences,
  });
  return response.data;
};

export const saveRoute = async (routeData) => {
  const response = await api.post('/api/routes', routeData);
  return response.data;
};

export const getUserRoutes = async () => {
  const response = await api.get('/api/routes');
  return response.data;
};

export const getRouteById = async (id) => {
  const response = await api.get(`/api/routes/${id}`);
  return response.data;
};

export const deleteRoute = async (id) => {
  const response = await api.delete(`/api/routes/${id}`);
  return response.data;
};

export const geocodeAddress = async (address) => {
  // Using Nominatim for geocoding
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5`
  );
  return response.json();
};

export const reverseGeocode = async (lat, lon) => {
  // Using Nominatim for reverse geocoding
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
  );
  return response.json();
};
