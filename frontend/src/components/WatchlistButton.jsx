import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWatchlistContext } from '../context/WatchlistContext';
import { useLang } from '../context/LangContext';

export default function WatchlistButton({ movie, className = '' }) {
  const { user } = useAuth();
  const { isInList, getItem, add, remove, collections } = useWatchlistContext();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!showDrop) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDrop]);

  if (!user) return null;

  const mediaType = movie.media_type || 'movie';
  const tmdbId = movie.tmdb_id || movie.id;
  const inList = isInList(tmdbId, mediaType);
  const item = getItem(tmdbId, mediaType);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (inList && item) {
      setLoading(true);
      try { await remove(item.id); } catch {} finally { setLoading(false); }
      return;
    }

    // Not in list — if multiple collections, show picker; otherwise add directly
    if (collections.length > 1) {
      setShowDrop((prev) => !prev);
      return;
    }

    setLoading(true);
    try {
      const colId = collections.length === 1 ? collections[0].id : null;
      await add(movie, colId);
    } catch {} finally { setLoading(false); }
  };

  const handleAddToCollection = async (e, colId) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDrop(false);
    setLoading(true);
    try { await add(movie, colId); } catch {} finally { setLoading(false); }
  };

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
          inList
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
        } ${className}`}
      >
        {inList ? `✓ ${t.wl_added}` : `+ ${t.wl_add}`}
        {!inList && collections.length > 1 && (
          <span className="ml-0.5 opacity-60">▾</span>
        )}
      </button>

      {showDrop && collections.length > 1 && (
        <div className="absolute bottom-full left-0 mb-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-30 overflow-hidden">
          <p className="text-xs text-gray-400 dark:text-gray-500 px-3 pt-2 pb-1">{t.wl_add_to_list}</p>
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={(e) => handleAddToCollection(e, col.id)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
            >
              <span className="truncate">{col.name}</span>
              <span className="text-xs text-gray-400 ml-2 shrink-0">{col.item_count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
