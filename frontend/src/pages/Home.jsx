import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { getTrending, discoverMovies } from '../api/movies';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import GenreSidebar from '../components/GenreSidebar';

export default function Home() {
  const { user } = useAuth();
  const { t, lang } = useLang();

  const [mediaType, setMediaType] = useState('movie');
  const [movies, setMovies] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setSelectedGenres([]);
  }, [mediaType]);

  useEffect(() => {
    setTrendLoading(true);
    setTrendError(null);
    const fetch = selectedGenres.length > 0
      ? discoverMovies(selectedGenres, 'popularity.desc', mediaType)
      : getTrending(mediaType, 1);
    fetch
      .then((data) => setMovies(data.results || []))
      .catch(() => setTrendError(t.home_error))
      .finally(() => setTrendLoading(false));
  }, [mediaType, selectedGenres]);

  const sectionTitle = selectedGenres.length > 0 ? t.genre_filter_results : t.home_trending;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-gray-100 via-purple-50 to-gray-100 dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 sm:pt-14 sm:pb-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 leading-tight text-gray-900 dark:text-white">
              {t.home_hero_title}{' '}
              <span className="text-purple-600 dark:text-purple-400">{t.home_hero_highlight}</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
              {t.home_hero_sub}
            </p>
            {user ? (
              <Link
                to="/recommend"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <span>✦</span> {t.nav_recommend}
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  {t.home_free_start}
                </Link>
                <Link to="/login" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t.home_login_cta}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section>
          {/* Header row */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold">{sectionTitle}</h2>
              {selectedGenres.length > 0 && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full">
                  {selectedGenres.length} {t.genre_filter_active}
                </span>
              )}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                {[
                  { key: 'movie', label: t.home_movies },
                  { key: 'tv', label: t.home_series },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setMediaType(key)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      mediaType === key
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile drawer toggle */}
              <button
                className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                onClick={() => setDrawerOpen(true)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h14M3 12h10" />
                </svg>
                {t.genre_filter_btn}
                {selectedGenres.length > 0 && (
                  <span className="bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {selectedGenres.length}
                  </span>
                )}
              </button>
              <span className="text-gray-400 dark:text-gray-500 text-xs">{t.home_tmdb_live}</span>
            </div>
          </div>

          {/* Two-column layout: sidebar + grid */}
          <div className="flex gap-6">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-48 shrink-0">
              <div className="sticky top-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <GenreSidebar
                  mediaType={mediaType}
                  selected={selectedGenres}
                  onChange={setSelectedGenres}
                  t={t}
                  lang={lang}
                />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {trendLoading ? (
                <div className="flex justify-center py-16">
                  <LoadingSpinner text={t.home_loading} />
                </div>
              ) : trendError ? (
                <div className="text-center py-12 text-red-500 dark:text-red-400">{trendError}</div>
              ) : (
                <MovieGrid movies={movies.map((m) => ({ ...m, media_type: mediaType }))} />
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 overflow-y-auto lg:hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <span className="font-semibold text-gray-900 dark:text-white">{t.genre_filter_title}</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <GenreSidebar
                mediaType={mediaType}
                selected={selectedGenres}
                onChange={(ids) => { setSelectedGenres(ids); setDrawerOpen(false); }}
                t={t}
                lang={lang}
              />
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
