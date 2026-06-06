import client from './client';

// ── Collections ───────────────────────────────────────────────────────────────

export const getCollections = () =>
  client.get('/watchlist/collections').then((r) => r.data);

export const createCollection = (name, isPublic = true) =>
  client.post('/watchlist/collections', { name, is_public: isPublic }).then((r) => r.data);

export const updateCollection = (id, name, isPublic = null) =>
  client.put(`/watchlist/collections/${id}`, {
    name,
    ...(isPublic !== null ? { is_public: isPublic } : {}),
  }).then((r) => r.data);

export const deleteCollection = (id) =>
  client.delete(`/watchlist/collections/${id}`).then((r) => r.data);

// ── Items ─────────────────────────────────────────────────────────────────────

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

export const moveToCollection = (itemId, collectionId) =>
  client.patch(`/watchlist/${itemId}/move`, { collection_id: collectionId }).then((r) => r.data);

export const summarizeMovie = (id) =>
  client.post(`/watchlist/${id}/summarize`).then((r) => r.data);

export const updateNote = (id, note) =>
  client.patch(`/watchlist/${id}/note`, { personal_note: note }).then((r) => r.data);
