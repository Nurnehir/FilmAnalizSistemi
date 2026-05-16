import client from './client';

export const getWatchlist = () =>
  client.get('/watchlist').then((r) => r.data);

export const addToWatchlist = (item) =>
  client.post('/watchlist', item).then((r) => r.data);

export const removeFromWatchlist = (id) =>
  client.delete(`/watchlist/${id}`).then((r) => r.data);
