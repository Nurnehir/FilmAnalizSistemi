import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '../api/watchlist';

export default function WatchlistButton({ movie, className = '' }) {
  const { user } = useAuth();
  const [inList, setInList] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getWatchlist().then((data) => {
      const found = data.items?.find(
        (i) => i.tmdb_id === movie.tmdb_id && i.media_type === (movie.media_type || 'movie')
      );
      if (found) {
        setInList(true);
        setItemId(found.id);
      }
    });
  }, [user, movie.tmdb_id]);

  if (!user) return null;

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      if (inList) {
        await removeFromWatchlist(itemId);
        setInList(false);
        setItemId(null);
      } else {
        const res = await addToWatchlist({
          tmdb_id: movie.tmdb_id,
          media_type: movie.media_type || 'movie',
          title: movie.title || movie.name,
          poster_path: movie.poster_path || null,
        });
        setInList(true);
        setItemId(res.id);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
        inList
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
      } ${className}`}
    >
      {inList ? '✓ Listede' : '+ Listeye Ekle'}
    </button>
  );
}
