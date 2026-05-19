import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWatchlist, removeFromWatchlist, markWatched } from '../api/watchlist';
import { useLang } from '../context/LangContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Watchlist() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getWatchlist();
        setItems(data.items || []);
      } catch {
        setError(t.wl_load_error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleRemove = async (id) => {
    setRemoving(id);
    try {
      await removeFromWatchlist(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
    } finally {
      setRemoving(null);
    }
  };

  const handleToggleWatched = async (item) => {
    setToggling(item.id);
    try {
      const updated = await markWatched(item.id, !item.watched);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, watched: updated.watched } : i)));
    } catch {
    } finally {
      setToggling(null);
    }
  };

  const TABS = [
    { key: 'all',       label: t.wl_tab_all },
    { key: 'unwatched', label: t.wl_tab_unwatched },
    { key: 'watched',   label: t.wl_tab_watched },
  ];

  const filtered = items.filter((i) => {
    if (tab === 'watched')   return i.watched;
    if (tab === 'unwatched') return !i.watched;
    return true;
  });

  const watchedCount   = items.filter((i) => i.watched).length;
  const unwatchedCount = items.filter((i) => !i.watched).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t.wl_title}</h1>
            {!isLoading && (
              <p className="text-gray-500 text-sm mt-1">
                {items.length} {t.wl_movies}
                {watchedCount > 0 && (
                  <span className="ml-2 text-green-600 dark:text-green-400">
                    · {watchedCount} {t.wl_tab_watched.toLowerCase()}
                  </span>
                )}
              </p>
            )}
          </div>
          <Link
            to="/"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
          >
            ← {t.nav_home}
          </Link>
        </div>

        {/* Tabs */}
        {!isLoading && !error && items.length > 0 && (
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit mb-6">
            {TABS.map(({ key, label }) => {
              const count = key === 'all' ? items.length : key === 'watched' ? watchedCount : unwatchedCount;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    tab === key
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === key
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner text={t.wl_loading} />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 dark:text-red-400">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-xl font-semibold mb-2">{t.wl_empty}</h2>
            <p className="text-gray-500 mb-6">{t.wl_empty_sub}</p>
            <Link
              to="/"
              className="inline-flex bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              {t.nav_home}
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            {tab === 'watched' ? '✓ ' : '🎬 '}
            {tab === 'watched' ? t.wl_tab_watched : t.wl_tab_unwatched}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((item) => {
              const poster = item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : null;
              return (
                <div
                  key={item.id}
                  className={`group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border transition-all ${
                    item.watched
                      ? 'border-green-300 dark:border-green-800/60'
                      : 'border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-700'
                  }`}
                >
                  <Link
                    to={`/movie/${item.tmdb_id}?type=${item.media_type}`}
                    className="block aspect-[2/3] bg-gray-100 dark:bg-gray-800 relative"
                  >
                    {poster ? (
                      <img
                        src={poster}
                        alt={item.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${item.watched ? 'brightness-75' : ''}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-4xl">
                        🎬
                      </div>
                    )}
                    {item.watched && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        ✓
                      </div>
                    )}
                  </Link>
                  <div className="p-3 space-y-2">
                    <Link
                      to={`/movie/${item.tmdb_id}?type=${item.media_type}`}
                      className="text-gray-900 dark:text-white text-sm font-medium hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-2 leading-tight block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-gray-400 dark:text-gray-600 text-xs">
                      {new Date(item.added_at).toLocaleDateString('tr-TR')}
                    </p>
                    {/* Watched toggle */}
                    <button
                      onClick={() => handleToggleWatched(item)}
                      disabled={toggling === item.id}
                      className={`w-full text-xs py-1.5 rounded-lg transition-colors disabled:opacity-40 font-medium ${
                        item.watched
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                          : 'border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-green-400 dark:hover:border-green-600 hover:text-green-600 dark:hover:text-green-400'
                      }`}
                    >
                      {toggling === item.id
                        ? '...'
                        : item.watched
                        ? t.wl_watched_badge
                        : t.wl_mark_watched}
                    </button>
                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removing === item.id}
                      className="w-full text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-red-200 dark:border-red-900/50 hover:border-red-400 dark:hover:border-red-700 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                    >
                      {removing === item.id ? t.loading : t.wl_remove}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
