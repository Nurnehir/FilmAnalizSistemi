import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWatchlistContext } from '../context/WatchlistContext';

export default function WatchlistButton({ movie, className = '' }) {
  const { user } = useAuth();
  const { isInList, getItem, add, remove } = useWatchlistContext();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const mediaType = movie.media_type || 'movie';
  const tmdbId = movie.tmdb_id || movie.id;
  const inList = isInList(tmdbId, mediaType);
  const item = getItem(tmdbId, mediaType);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      if (inList && item) {
        await remove(item.id);
      } else {
        await add(movie);
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
