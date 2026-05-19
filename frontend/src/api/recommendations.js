import client from './client';

export const getRecommendations = (prompt, useTasteProfile = false) =>
  client.post('/recommendations', { prompt, use_taste_profile: useTasteProfile }).then((r) => r.data);

export const getHistory = (limit = 10, offset = 0) =>
  client.get('/recommendations/history', { params: { limit, offset } }).then((r) => r.data);

export const getRecommendationById = (id) =>
  client.get(`/recommendations/${id}`).then((r) => r.data);
