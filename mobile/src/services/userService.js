import api from '../config/api';

export const getStats = async () => {
  const response = await api.get('/users/stats');
  return response.data;
};

export const getAchievements = async () => {
  const response = await api.get('/gamification/achievements');
  return response.data;
};

export const getVehicles = async () => {
  const response = await api.get('/vehicles');
  return response.data;
};

export const createVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};

export const getLeaderboard = async (period = 'all') => {
  const response = await api.get('/gamification/leaderboard', {
    params: { period },
  });
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};

export const addFavorite = async (favoriteData) => {
  const response = await api.post('/favorites', favoriteData);
  return response.data;
};

export const removeFavorite = async (id) => {
  const response = await api.delete(`/favorites/${id}`);
  return response.data;
};
