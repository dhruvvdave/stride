import api from './api';

export const getObstacles = async ({ bounds, types } = {}) => {
  const params = new URLSearchParams();
  
  if (bounds) {
    params.append('bounds', JSON.stringify(bounds));
  }
  if (types && types.length > 0) {
    params.append('types', types.join(','));
  }

  const response = await api.get(`/api/obstacles?${params.toString()}`);
  return response.data;
};

export const getObstacleById = async (id) => {
  const response = await api.get(`/api/obstacles/${id}`);
  return response.data;
};

export const createObstacle = async (obstacleData) => {
  const response = await api.post('/api/obstacles', obstacleData);
  return response.data;
};

export const updateObstacle = async (id, obstacleData) => {
  const response = await api.put(`/api/obstacles/${id}`, obstacleData);
  return response.data;
};

export const deleteObstacle = async (id) => {
  const response = await api.delete(`/api/obstacles/${id}`);
  return response.data;
};

export const reportObstacle = async (id, reportData) => {
  const response = await api.post(`/api/obstacles/${id}/report`, reportData);
  return response.data;
};

export const voteObstacle = async (id, voteType) => {
  const response = await api.post(`/api/obstacles/${id}/vote`, { type: voteType });
  return response.data;
};

export const uploadObstaclePhoto = async (id, photoFile) => {
  const formData = new FormData();
  formData.append('photo', photoFile);

  const response = await api.post(`/api/obstacles/${id}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
