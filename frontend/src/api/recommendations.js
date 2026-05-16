import client from './client';

export const getRecommendations = (prompt) =>
  client.post('/recommendations', { prompt }).then((r) => r.data);

export const getHistory = (limit = 10, offset = 0) =>
  client.get('/recommendations/history', { params: { limit, offset } }).then((r) => r.data);
