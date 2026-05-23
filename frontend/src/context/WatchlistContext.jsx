import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWatchlist, addToWatchlist, removeFromWatchlist, getCollections } from '../api/watchlist';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [collections, setCollections] = useState([]);

  const fetchList = useCallback(async () => {
    if (!user) { setItems([]); setCollections([]); return; }
    try {
      const [listData, colData] = await Promise.all([getWatchlist(), getCollections()]);
      setItems(listData.items || []);
      setCollections(colData || []);
    } catch {}
  }, [user]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const add = async (movie, collectionId = null) => {
    const res = await addToWatchlist({
      tmdb_id: movie.tmdb_id || movie.id,
      media_type: movie.media_type || 'movie',
      title: movie.title || movie.name,
      poster_path: movie.poster_path || null,
      collection_id: collectionId,
    });
    setItems((prev) => [...prev, res]);
    if (collectionId !== null) {
      setCollections((prev) =>
        prev.map((c) => c.id === collectionId ? { ...c, item_count: c.item_count + 1 } : c)
      );
    }
    return res;
  };

  const remove = async (id) => {
    const item = items.find((i) => i.id === id);
    await removeFromWatchlist(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (item?.collection_id !== null && item?.collection_id !== undefined) {
      setCollections((prev) =>
        prev.map((c) => c.id === item.collection_id ? { ...c, item_count: Math.max(0, c.item_count - 1) } : c)
      );
    }
  };

  const isInList = (tmdbId, mediaType = 'movie') =>
    items.some((i) => i.tmdb_id === tmdbId && i.media_type === mediaType);

  const getItem = (tmdbId, mediaType = 'movie') =>
    items.find((i) => i.tmdb_id === tmdbId && i.media_type === mediaType);

  return (
    <WatchlistContext.Provider value={{ items, collections, add, remove, isInList, getItem, refresh: fetchList }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlistContext() {
  return useContext(WatchlistContext);
}
