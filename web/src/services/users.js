import api from './api';

export const getUserStats = async () => {
  const response = await api.get('/api/users/stats');
  return response.data;
};

export const getVehicles = async () => {
  const response = await api.get('/api/vehicles');
  return response.data;
};

export const createVehicle = async (vehicleData) => {
  const response = await api.post('/api/vehicles', vehicleData);
  return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/api/vehicles/${id}`, vehicleData);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/api/vehicles/${id}`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get('/api/favorites');
  return response.data;
};

export const addFavorite = async (favoriteData) => {
  const response = await api.post('/api/favorites', favoriteData);
  return response.data;
};

export const deleteFavorite = async (id) => {
  const response = await api.delete(`/api/favorites/${id}`);
  return response.data;
};

export const getAchievements = async () => {
  const response = await api.get('/api/gamification/achievements');
  return response.data;
};

export const getLeaderboard = async (period = 'weekly') => {
  const response = await api.get(`/api/gamification/leaderboard?period=${period}`);
  return response.data;
};

export const getClubs = async () => {
  const response = await api.get('/api/clubs');
  return response.data;
};

export const getClubById = async (id) => {
  const response = await api.get(`/api/clubs/${id}`);
  return response.data;
};

export const joinClub = async (id) => {
  const response = await api.post(`/api/clubs/${id}/join`);
  return response.data;
};

export const leaveClub = async (id) => {
  const response = await api.post(`/api/clubs/${id}/leave`);
  return response.data;
};
