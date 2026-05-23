import client from './client';

export const getReviews = (tmdb_id, media_type = 'movie', page = 1) =>
  client.get(`/movies/${tmdb_id}/reviews`, { params: { media_type, page } }).then(r => r.data);

export const createReview = (tmdb_id, data) =>
  client.post(`/movies/${tmdb_id}/reviews`, data).then(r => r.data);

export const updateReview = (review_id, data) =>
  client.put(`/movies/reviews/${review_id}`, data).then(r => r.data);

export const deleteReview = (review_id) =>
  client.delete(`/movies/reviews/${review_id}`).then(r => r.data);
