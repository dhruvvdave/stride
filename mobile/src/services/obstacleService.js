import api from '../config/api';

export const getObstacles = async (bounds) => {
  const params = bounds ? {
    minLat: bounds.southWest.latitude,
    maxLat: bounds.northEast.latitude,
    minLng: bounds.southWest.longitude,
    maxLng: bounds.northEast.longitude,
  } : {};
  
  const response = await api.get('/obstacles', { params });
  return response.data;
};

export const getObstacleById = async (id) => {
  const response = await api.get(`/obstacles/${id}`);
  return response.data;
};

export const reportObstacle = async (obstacleData) => {
  const response = await api.post('/obstacles', obstacleData);
  return response.data;
};

export const updateObstacle = async (id, obstacleData) => {
  const response = await api.put(`/obstacles/${id}`, obstacleData);
  return response.data;
};

export const deleteObstacle = async (id) => {
  const response = await api.delete(`/obstacles/${id}`);
  return response.data;
};

export const voteObstacle = async (id, voteType) => {
  const response = await api.post(`/obstacles/${id}/vote`, { voteType });
  return response.data;
};
