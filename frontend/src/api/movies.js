import client from './client';

export const getTrending = (mediaType = 'movie', page = 1) =>
  client.get('/movies/trending', { params: { media_type: mediaType, page } }).then((r) => r.data);

export const searchMovies = (query, mediaType = 'movie', page = 1) =>
  client.get('/movies/search', { params: { q: query, media_type: mediaType, page } }).then((r) => r.data);

export const getMovieDetail = (tmdbId, mediaType = 'movie') =>
  client.get(`/movies/${tmdbId}`, { params: { media_type: mediaType } }).then((r) => r.data);

export const getSimilar = (tmdbId, mediaType = 'movie') =>
  client.get(`/movies/${tmdbId}/similar`, { params: { media_type: mediaType } }).then((r) => r.data);

export const getMovieVideos = (tmdbId, mediaType = 'movie') =>
  client.get(`/movies/${tmdbId}/videos`, { params: { media_type: mediaType } }).then((r) => r.data);
