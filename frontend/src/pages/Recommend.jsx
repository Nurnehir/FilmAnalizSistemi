import { useState, useEffect } from 'react';
import { getRecommendations, getHistory, getRecommendationById } from '../api/recommendations';
import { getTasteProfile } from '../api/auth';
import { useLang } from '../context/LangContext';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

function EyeIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function formatDate(iso, lang) {
  return new Date(iso).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function Recommend() {
  const { t, lang } = useLang();

  // Form state
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Taste profile state
  const [useTasteProfile, setUseTasteProfile] = useState(false);
  const [tasteProfile, setTasteProfile] = useState(null);
  const [tasteLoading, setTasteLoading] = useState(true);

  useEffect(() => {
    getTasteProfile()
      .then(setTasteProfile)
      .catch(() => setTasteProfile({ rated_count: 0, summary: null, can_use: false }))
      .finally(() => setTasteLoading(false));
  }, []);

  // Sidebar / history state
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadHistory = () => {
    getHistory(10, 0).then((d) => setHistory(d.history || [])).catch(() => {});
  };

  useEffect(() => { loadHistory(); }, []);

  const openDetail = async (id) => {
    if (activeId === id) return;
    setActiveId(id);
    setDetail(null);
    setDetailLoading(true);
    setDetailError(null);
    setSidebarOpen(false);
    try {
      const data = await getRecommendationById(id);
      setDetail(data);
    } catch {
      setDetailError(t.rec_detail_error);
    } finally {
      setDetailLoading(false);
    }
  };

  const goToForm = () => {
    setActiveId(null);
    setDetail(null);
    setResult(null);
    setError(null);
    setPrompt('');
    setSidebarOpen(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await getRecommendations(prompt, useTasteProfile);
      setResult(data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.detail || t.error_generic);
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [t.rec_chip_1, t.rec_chip_2, t.rec_chip_3, t.rec_chip_4];

  const sidebarContent = (
    <>
      {/* New button */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={goToForm}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeId === null
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <PlusIcon />
          {t.rec_new}
        </button>
      </div>

      {/* History title */}
      <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {t.rec_history_title}
      </p>

      {/* History list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {history.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-xs px-3 py-2">{t.rec_history_empty}</p>
        ) : (
          history.map((h) => (
            <button
              key={h.id}
              onClick={() => openDetail(h.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2 group transition-colors ${
                activeId === h.id
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate leading-snug">{h.user_prompt}</p>
                <p className="text-xs opacity-50 mt-0.5">
                  {formatDate(h.created_at, lang)}
                  {h.tmdb_ids?.length > 0 && ` · ${h.tmdb_ids.length} film`}
                </p>
              </div>
              <EyeIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-opacity ${
                activeId === h.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`} />
            </button>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-16 z-30 md:z-auto
          h-[calc(100vh-4rem)] w-64 lg:w-72
          flex flex-col flex-shrink-0
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Main area */}
      <main className="flex-1 min-w-0 overflow-y-auto">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={t.rec_sidebar_toggle}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {activeId === null ? t.rec_new : t.rec_history_title}
          </span>
        </div>

        {activeId === null ? (
          /* ── FORM VIEW ── */
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight text-gray-900 dark:text-white">
                {t.rec_title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
                {t.rec_subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t.rec_placeholder}
                  rows={4}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:border-purple-500 text-gray-900 dark:text-white rounded-xl px-4 py-3 resize-none focus:outline-none transition-colors text-sm placeholder-gray-400 dark:placeholder-gray-600"
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(); }}
                />
                <span className="absolute bottom-3 right-3 text-gray-400 dark:text-gray-600 text-xs">Ctrl+Enter</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-600 px-3 py-1.5 rounded-full transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Taste Profile Toggle */}
              {!tasteLoading && (
                <div className={`rounded-xl border p-3.5 transition-colors ${
                  tasteProfile?.can_use
                    ? 'border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                }`}>
                  {tasteProfile?.can_use ? (
                    <>
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={useTasteProfile}
                          onChange={(e) => setUseTasteProfile(e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {t.rec_taste_toggle}
                        </span>
                      </label>
                      {useTasteProfile && tasteProfile.summary && (
                        <div className="mt-2.5 pl-7">
                          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                            {t.rec_taste_label}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {tasteProfile.summary}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-start gap-2.5">
                      <span className="text-gray-400 dark:text-gray-600 mt-0.5 text-sm">🎬</span>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t.rec_taste_toggle}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {t.rec_taste_need_more_sub}{' '}
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            ({tasteProfile?.rated_count ?? 0}/3)
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {isLoading ? t.rec_loading : t.rec_btn}
              </button>
            </form>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <LoadingSpinner size="lg" />
                <div className="text-center">
                  <p className="text-gray-900 dark:text-white font-medium">{t.rec_loading}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{t.rec_analyzing_sub}</p>
                </div>
              </div>
            )}

            {error && !isLoading && (
              <div className="mt-6 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl p-4 text-sm flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                {error}
              </div>
            )}

            {result && !isLoading && (
              <div className="mt-8 space-y-6">
                {result.analysis && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider mb-2">{t.rec_analysis_title}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{result.analysis}</p>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                    {t.rec_result_title} — {result.movies?.length} film
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {result.movies?.map((movie) => (
                      <MovieCard key={movie.tmdb_id} movie={movie} reason={movie.reason} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── DETAIL VIEW ── */
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            {detailLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <LoadingSpinner size="lg" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">{t.rec_detail_loading}</p>
              </div>
            ) : detailError ? (
              <div className="flex items-center justify-center py-24">
                <p className="text-red-500 dark:text-red-400 text-sm">{detailError}</p>
              </div>
            ) : detail ? (
              <div className="space-y-6">
                {/* Original prompt */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    {t.rec_detail_prompt_label}
                  </p>
                  <p className="text-gray-900 dark:text-white text-base font-medium leading-relaxed">
                    "{detail.user_prompt}"
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                    {formatDate(detail.created_at, lang)}
                  </p>
                </div>

                {/* Analysis */}
                {detail.analysis && (
                  <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                      {t.rec_analysis_title}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{detail.analysis}</p>
                  </div>
                )}

                {/* Movies */}
                {detail.movies?.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                      {t.rec_detail_films} — {detail.movies.length} film
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {detail.movies.map((movie) => (
                        <MovieCard
                          key={movie.tmdb_id}
                          movie={movie}
                          reason={movie.reason}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
