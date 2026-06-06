import client from './client';

export const compareMovies = (tmdbIdA, tmdbIdB, mediaType = 'movie') =>
  client.post('/compare', { tmdb_id_a: tmdbIdA, tmdb_id_b: tmdbIdB, media_type: mediaType }).then((r) => r.data);

export const getCompareHistory = (limit = 10, offset = 0) =>
  client.get('/compare/history', { params: { limit, offset } }).then((r) => r.data);

export const getComparisonById = (id) =>
  client.get(`/compare/${id}`).then((r) => r.data);
