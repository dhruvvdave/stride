import api from '../config/api';

export const planRoute = async (origin, destination) => {
  const response = await api.post('/routes/plan', {
    origin,
    destination,
  });
  return response.data;
};

export const geocode = async (query) => {
  const response = await api.get('/routes/geocode', {
    params: { q: query },
  });
  return response.data;
};

export const reverseGeocode = async (latitude, longitude) => {
  const response = await api.get('/routes/reverse-geocode', {
    params: { lat: latitude, lng: longitude },
  });
  return response.data;
};
