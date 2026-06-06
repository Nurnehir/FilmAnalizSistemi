import { useState, useRef, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { searchMovies } from '../api/movies';
import { compareMovies, getCompareHistory, getComparisonById } from '../api/compare';

/* ── İkonlar ────────────────────────────────────────────────────── */
function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
function EyeIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function formatDate(iso, lang) {
  return new Date(iso).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

/* ── Film arama + seçim bileşeni ─────────────────────────────────── */
function FilmPicker({ label, selected, onSelect, otherSelected, t }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen]       = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchMovies(val.trim());
        setResults((data.results || []).slice(0, 6));
        setOpen(true);
      } catch { /* silent */ } finally { setSearching(false); }
    }, 400);
  };

  const pick = (movie) => {
    onSelect({ ...movie, tmdb_id: movie.tmdb_id || movie.id });
    setQuery(''); setResults([]); setOpen(false);
  };
  const clear = () => { onSelect(null); setQuery(''); setResults([]); setOpen(false); };

  return (
    <div className="flex-1 min-w-0" ref={wrapperRef}>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{label}</p>

      {selected ? (
        <div className="relative flex items-center gap-3 bg-white dark:bg-gray-800 border-2 border-purple-500 rounded-xl p-3">
          {selected.poster_url
            ? <img src={selected.poster_url} alt={selected.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
            : <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl flex-shrink-0">🎬</div>
          }
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">{selected.title || selected.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{(selected.release_date || '').slice(0, 4)}</p>
            {selected.vote_average > 0 && <p className="text-xs text-yellow-500 mt-0.5">★ {Number(selected.vote_average).toFixed(1)}</p>}
          </div>
          <button
            onClick={clear}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
          >✕</button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder={t.compare_search_placeholder}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            />
            {searching && <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
          </div>
          {open && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-20 overflow-hidden">
              {results.map((m) => {
                const isOther = otherSelected?.tmdb_id === (m.tmdb_id || m.id);
                return (
                  <button
                    key={m.tmdb_id || m.id}
                    onClick={() => !isOther && pick(m)}
                    disabled={isOther}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isOther ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {m.poster_url
                      ? <img src={m.poster_url} alt={m.title} className="w-8 h-12 object-cover rounded flex-shrink-0" />
                      : <div className="w-8 h-12 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.title || m.name}</p>
                      <p className="text-xs text-gray-400">{(m.release_date || '').slice(0, 4)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Karşılaştırma sonucu görünümü ──────────────────────────────── */
function CompareResult({ data }) {
  const { t } = useLang();
  const winnerIsA = data.winner_id === data.tmdb_id_a;

  return (
    <div className="space-y-6">
      {/* İki poster */}
      <div className="flex items-start justify-center gap-6">
        {['a', 'b'].map((side) => {
          const isWinner = side === 'a' ? winnerIsA : !winnerIsA;
          const poster   = data[`poster_${side}`];
          const title    = data[`title_${side}`];
          return (
            <div key={side} className={`flex flex-col items-center gap-2 transition-opacity ${isWinner ? 'opacity-100' : 'opacity-55'}`}>
              {poster
                ? <img src={poster} alt={title} className={`w-28 sm:w-32 rounded-xl shadow-lg ${isWinner ? 'ring-4 ring-purple-500' : ''}`} />
                : <div className={`w-28 sm:w-32 aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-3xl ${isWinner ? 'ring-4 ring-purple-500' : ''}`}>🎬</div>
              }
              <p className="text-xs font-semibold text-center text-gray-700 dark:text-gray-300 max-w-[128px] leading-tight">{title}</p>
              {isWinner && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
                  ✓ {t.compare_winner}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* AI metin */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t.compare_analysis}</h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{data.comparison}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1">{t.compare_verdict}</h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{data.verdict}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Ana sayfa ───────────────────────────────────────────────────── */
export default function Compare() {
  const { t, lang } = useLang();

  /* Sidebar / geçmiş */
  const [history, setHistory]   = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detail, setDetail]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError]     = useState(null);
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  /* Yeni karşılaştırma formu */
  const [filmA, setFilmA]   = useState(null);
  const [filmB, setFilmB]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const loadHistory = () => {
    getCompareHistory(20, 0).then(setHistory).catch(() => {});
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
      const data = await getComparisonById(id);
      // ai_result JSON içeriği varsa parse et; bazı alanlar zaten üst düzeyde de gelebilir
      let parsed = {};
      if (data.ai_result) {
        try { parsed = JSON.parse(data.ai_result); } catch { /* */ }
      }
      setDetail({ ...data, ...parsed });
    } catch {
      setDetailError(t.compare_detail_error);
    } finally {
      setDetailLoading(false);
    }
  };

  const goToNew = () => {
    setActiveId(null);
    setDetail(null);
    setError('');
    setFilmA(null);
    setFilmB(null);
    setSidebarOpen(false);
  };

  const handleCompare = async () => {
    if (!filmA || !filmB || filmA.tmdb_id === filmB.tmdb_id) return;
    setLoading(true);
    setError('');
    try {
      const data = await compareMovies(filmA.tmdb_id, filmB.tmdb_id, 'movie');
      // yeni sonucu detay olarak göster
      setDetail({
        ...data,
        tmdb_id_a: filmA.tmdb_id,
        tmdb_id_b: filmB.tmdb_id,
        poster_a: data.poster_a || filmA.poster_url,
        poster_b: data.poster_b || filmB.poster_url,
        title_a: data.title_a || filmA.title || filmA.name,
        title_b: data.title_b || filmB.title || filmB.name,
      });
      setActiveId(data.id);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.detail || t.error_generic);
    } finally {
      setLoading(false);
    }
  };

  const canCompare = filmA && filmB && filmA.tmdb_id !== filmB.tmdb_id && !loading;

  /* ── Sidebar içeriği ── */
  const sidebarContent = (
    <>
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={goToNew}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeId === null
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <PlusIcon />
          {t.compare_new}
        </button>
      </div>

      <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {t.compare_history_title}
      </p>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {history.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-xs px-3 py-2">{t.compare_no_history}</p>
        ) : (
          history.map((h) => {
            let titleA = `Film #${h.tmdb_id_a}`;
            let titleB = `Film #${h.tmdb_id_b}`;
            try {
              const parsed = JSON.parse(h.ai_result);
              titleA = parsed.title_a || titleA;
              titleB = parsed.title_b || titleB;
            } catch { /* */ }
            const isActive = activeId === h.id;
            return (
              <button
                key={h.id}
                onClick={() => openDetail(h.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2 group transition-colors ${
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate leading-snug font-medium">
                    <span>{titleA}</span>
                    <span className="opacity-40 mx-1">{t.compare_vs}</span>
                    <span>{titleB}</span>
                  </p>
                  <p className="text-xs opacity-50 mt-0.5">{formatDate(h.created_at, lang)}</p>
                </div>
                <EyeIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              </button>
            );
          })
        )}
      </div>
    </>
  );

  /* ── Ana alan içeriği ── */
  const mainContent = () => {
    // Geçmiş detayı görüntüleme
    if (activeId !== null) {
      if (detailLoading) {
        return (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">{t.compare_detail_loading}</p>
            </div>
          </div>
        );
      }
      if (detailError) {
        return <p className="text-red-500 text-sm py-12 text-center">{detailError}</p>;
      }
      if (detail) {
        return (
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
              {formatDate(detail.created_at, lang)}
            </p>
            <CompareResult data={detail} />
          </div>
        );
      }
      return null;
    }

    // Yeni karşılaştırma formu — ve varsa anlık sonuç
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.compare_title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base mt-2">{t.compare_subtitle}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-7">
          <div className="flex items-start gap-6">
            <FilmPicker label={t.compare_search_a} selected={filmA} onSelect={setFilmA} otherSelected={filmB} t={t} />
            <div className="flex-shrink-0 mt-8 text-xl font-black text-gray-200 dark:text-gray-700 select-none">{t.compare_vs}</div>
            <FilmPicker label={t.compare_search_b} selected={filmB} onSelect={setFilmB} otherSelected={filmA} t={t} />
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <div className="mt-5">
            <button
              onClick={handleCompare}
              disabled={!canCompare}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.compare_loading}</>
              ) : (
                <><span>⚡</span>{t.compare_btn}</>
              )}
            </button>
          </div>
        </div>

        {/* Anlık karşılaştırma sonucu (yeni karşılaştırma yapılınca) */}
        {detail && activeId === null && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
            <CompareResult data={detail} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>

      {/* Mobil backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
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

      {/* Ana alan */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobil üst bar */}
        <div className="md:hidden sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {t.compare_sidebar_toggle}
          </button>
        </div>

        <div className="max-w-4xl px-8 sm:px-12 lg:px-16 py-10">
          {mainContent()}
        </div>
      </main>
    </div>
  );
}
