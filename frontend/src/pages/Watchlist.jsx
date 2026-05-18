import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWatchlist, removeFromWatchlist } from '../api/watchlist';
import { useLang } from '../context/LangContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Watchlist() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{t.wl_title}</h1>
            {!isLoading && (
              <p className="text-gray-500 text-sm mt-1">{items.length} {t.wl_movies}</p>
            )}
          </div>
          <Link
            to="/"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
          >
            ← {t.nav_home}
          </Link>
        </div>

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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => {
              const poster = item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : null;
              return (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-700 transition-all"
                >
                  <Link
                    to={`/movie/${item.tmdb_id}?type=${item.media_type}`}
                    className="block aspect-[2/3] bg-gray-100 dark:bg-gray-800 relative"
                  >
                    {poster ? (
                      <img
                        src={poster}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-4xl">
                        🎬
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
