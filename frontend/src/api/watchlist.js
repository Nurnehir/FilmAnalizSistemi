import client from './client';

export const getWatchlist = () =>
  client.get('/watchlist').then((r) => r.data);

export const addToWatchlist = (item) =>
  client.post('/watchlist', item).then((r) => r.data);

export const removeFromWatchlist = (id) =>
  client.delete(`/watchlist/${id}`).then((r) => r.data);

export const markWatched = (id, watched) =>
  client.patch(`/watchlist/${id}/watched`, { watched }).then((r) => r.data);

export const rateMovie = (id, rating) =>
  client.patch(`/watchlist/${id}/rating`, { rating }).then((r) => r.data);
