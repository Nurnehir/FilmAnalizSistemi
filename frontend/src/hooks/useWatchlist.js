import { useState, useEffect } from 'react';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../api/watchlist';
import { useAuth } from '../context/AuthContext';

export default function useWatchlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getWatchlist();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [user]);

  const add = async (movie) => {
    const res = await addToWatchlist({
      tmdb_id: movie.tmdb_id || movie.id,
      media_type: movie.media_type || 'movie',
      title: movie.title || movie.name,
      poster_path: movie.poster_path || null,
    });
    setItems((prev) => [...prev, res]);
    return res;
  };

  const remove = async (id) => {
    await removeFromWatchlist(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const isInList = (tmdbId, mediaType = 'movie') =>
    items.some((i) => i.tmdb_id === tmdbId && i.media_type === mediaType);

  const getItem = (tmdbId, mediaType = 'movie') =>
    items.find((i) => i.tmdb_id === tmdbId && i.media_type === mediaType);

  return { items, loading, add, remove, isInList, getItem, refresh: fetchList };
}
