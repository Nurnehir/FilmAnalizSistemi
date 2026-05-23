import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getWatchlist, removeFromWatchlist, markWatched, rateMovie, moveToCollection,
  getCollections, createCollection, updateCollection, deleteCollection,
} from '../api/watchlist';
import { useLang } from '../context/LangContext';
import { useWatchlistContext } from '../context/WatchlistContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';

export default function Watchlist() {
  const { t, lang } = useLang();
  const { refresh: refreshContext } = useWatchlistContext();

  const [items, setItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [rating, setRating] = useState(null);
  const [moving, setMoving] = useState(null);
  const [tab, setTab] = useState('all');
  const [activeColId, setActiveColId] = useState(null); // null = show all
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Collection modals
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // {id, name}
  const [editName, setEditName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // {id, name}

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [listData, colData] = await Promise.all([getWatchlist(), getCollections()]);
        setItems(listData.items || []);
        setCollections(colData || []);
      } catch {
        setError(t.wl_load_error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Item actions ────────────────────────────────────────────────────────────

  const handleRemove = async (id) => {
    setRemoving(id);
    try {
      await removeFromWatchlist(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      refreshContext();
    } catch {} finally { setRemoving(null); }
  };

  const handleRate = async (item, newRating) => {
    setRating(item.id);
    try {
      const updated = await rateMovie(item.id, newRating);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, user_rating: updated.user_rating } : i)));
    } catch {} finally { setRating(null); }
  };

  const handleToggleWatched = async (item) => {
    setToggling(item.id);
    try {
      const updated = await markWatched(item.id, !item.watched);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, watched: updated.watched } : i)));
    } catch {} finally { setToggling(null); }
  };

  const handleMove = async (itemId, colId) => {
    setMoving(itemId);
    try {
      const updated = await moveToCollection(itemId, colId);
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, collection_id: updated.collection_id } : i)));
      // Refresh collection counts
      const colData = await getCollections();
      setCollections(colData || []);
      refreshContext();
    } catch {} finally { setMoving(null); }
  };

  // ── Collection actions ──────────────────────────────────────────────────────

  const handleCreateList = async () => {
    const name = newListName.trim();
    if (!name) return;
    setCreatingList(true);
    try {
      const col = await createCollection(name);
      setCollections((prev) => [...prev, col]);
      setNewListName('');
      setShowNewListModal(false);
      refreshContext();
    } catch {} finally { setCreatingList(false); }
  };

  const handleEditOpen = (col) => {
    setEditTarget(col);
    setEditName(col.name);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    const name = editName.trim();
    if (!name || !editTarget) return;
    setSavingEdit(true);
    try {
      const updated = await updateCollection(editTarget.id, name);
      setCollections((prev) => prev.map((c) => (c.id === editTarget.id ? { ...c, name: updated.name } : c)));
      setShowEditModal(false);
    } catch {} finally { setSavingEdit(false); }
  };

  const handleDeleteOpen = (col) => {
    setDeleteTarget(col);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCollection(deleteTarget.id);
      setCollections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setItems((prev) => prev.map((i) => (i.collection_id === deleteTarget.id ? { ...i, collection_id: null } : i)));
      if (activeColId === deleteTarget.id) setActiveColId(null);
      setShowDeleteModal(false);
      refreshContext();
    } catch {}
  };

  // ── Filtering & pagination ───────────────────────────────────────────────────

  const GENRE_NAMES = {
    28: { tr: 'Aksiyon', en: 'Action' }, 12: { tr: 'Macera', en: 'Adventure' },
    16: { tr: 'Animasyon', en: 'Animation' }, 35: { tr: 'Komedi', en: 'Comedy' },
    80: { tr: 'Suç', en: 'Crime' }, 99: { tr: 'Belgesel', en: 'Documentary' },
    18: { tr: 'Drama', en: 'Drama' }, 10751: { tr: 'Aile', en: 'Family' },
    14: { tr: 'Fantezi', en: 'Fantasy' }, 27: { tr: 'Korku', en: 'Horror' },
    9648: { tr: 'Gizem', en: 'Mystery' }, 10749: { tr: 'Romantik', en: 'Romance' },
    878: { tr: 'Bilim Kurgu', en: 'Sci-Fi' }, 53: { tr: 'Gerilim', en: 'Thriller' },
    37: { tr: 'Western', en: 'Western' }, 10759: { tr: 'Aksiyon & Macera', en: 'Action & Adventure' },
    10762: { tr: 'Çocuk', en: 'Kids' }, 10765: { tr: 'Bilim Kurgu & Fantezi', en: 'Sci-Fi & Fantasy' },
  };

  const colItems = (colId) =>
    colId === null ? items : items.filter((i) => i.collection_id === colId);

  // Tab + collection filtered (for counts)
  const tabFiltered = colItems(activeColId).filter((i) => {
    if (tab === 'watched') return i.watched;
    if (tab === 'unwatched') return !i.watched;
    return true;
  });

  // Available genres in current tab+collection view
  const availableGenres = [...new Set(tabFiltered.flatMap((i) => i.genre_ids || []))]
    .filter((gid) => GENRE_NAMES[gid])
    .sort((a, b) => (GENRE_NAMES[a]?.tr || '').localeCompare(GENRE_NAMES[b]?.tr || ''));

  // Full filter: tab + collection + genres + search
  const fullyFiltered = tabFiltered.filter((i) => {
    if (selectedGenres.length > 0) {
      const hasGenre = selectedGenres.every((gid) => (i.genre_ids || []).includes(gid));
      if (!hasGenre) return false;
    }
    if (searchQuery.trim()) {
      if (!i.title.toLowerCase().includes(searchQuery.trim().toLowerCase())) return false;
    }
    return true;
  });

  const totalPages   = Math.max(1, Math.ceil(fullyFiltered.length / ITEMS_PER_PAGE));
  const safePage     = Math.min(page, totalPages);
  const visibleItems = fullyFiltered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const watchedCount   = colItems(activeColId).filter((i) => i.watched).length;
  const unwatchedCount = colItems(activeColId).filter((i) => !i.watched).length;
  const totalInView    = colItems(activeColId).length;

  // Reset page when any filter changes
  const resetPage = () => setPage(1);

  const activeColName = activeColId === null
    ? t.wl_tab_all
    : collections.find((c) => c.id === activeColId)?.name || t.wl_tab_all;

  const TABS = [
    { key: 'all',       label: t.wl_tab_all,       count: totalInView },
    { key: 'unwatched', label: t.wl_tab_unwatched,  count: unwatchedCount },
    { key: 'watched',   label: t.wl_tab_watched,    count: watchedCount },
  ];

  // ── Sidebar ─────────────────────────────────────────────────────────────────

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {t.wl_my_lists}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {/* All items */}
        <button
          onClick={() => { setActiveColId(null); setSidebarOpen(false); resetPage(); setSelectedGenres([]); setSearchQuery(''); }}
          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
            activeColId === null
              ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span>📋 {t.wl_tab_all}</span>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </button>

        {/* Collections */}
        {collections.map((col) => (
          <div
            key={col.id}
            className={`flex items-center gap-1 px-2 py-1 mx-1 my-0.5 rounded-lg transition-colors ${
              activeColId === col.id
                ? 'bg-purple-50 dark:bg-purple-900/20'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {/* Name button */}
            <button
              onClick={() => { setActiveColId(col.id); setSidebarOpen(false); resetPage(); setSelectedGenres([]); setSearchQuery(''); }}
              className={`flex-1 flex items-center gap-2 text-sm text-left min-w-0 py-1.5 px-1 ${
                activeColId === col.id
                  ? 'text-purple-700 dark:text-purple-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-base shrink-0">🎬</span>
              <span className="truncate">{col.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ml-auto ${
                activeColId === col.id
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              }`}>
                {col.item_count}
              </span>
            </button>

            {/* Edit icon */}
            <button
              onClick={(e) => { e.stopPropagation(); handleEditOpen(col); }}
              title={t.wl_rename}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-blue-400 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {/* Delete icon */}
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteOpen(col); }}
              title={t.wl_delete_list}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-red-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* New list */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => { setNewListName(''); setShowNewListModal(true); }}
          className="w-full text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> {t.wl_new_list}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t.wl_title}</h1>
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              {t.wl_my_lists}
            </button>
            <Link
              to="/"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
            >
              ← {t.nav_home}
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner text={t.wl_loading} />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 dark:text-red-400">{error}</div>
        ) : (
          <div className="flex gap-6">

            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden self-start sticky top-4">
              <Sidebar />
            </aside>

            {/* ── Mobile sidebar overlay ── */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <span className="font-semibold text-sm">{t.wl_my_lists}</span>
                    <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <Sidebar />
                  </div>
                </div>
              </div>
            )}

            {/* ── Main content ── */}
            <div className="flex-1 min-w-0">

              {/* Collection title + tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-semibold">{activeColName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalInView} {t.wl_movies}
                    {watchedCount > 0 && (
                      <span className="ml-2 text-green-600 dark:text-green-400">
                        · {watchedCount} {t.wl_tab_watched.toLowerCase()}
                      </span>
                    )}
                  </p>
                </div>
                {totalInView > 0 && (
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
                    {TABS.map(({ key, label, count }) => (
                      <button
                        key={key}
                        onClick={() => { setTab(key); resetPage(); setSelectedGenres([]); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
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
                    ))}
                  </div>
                )}
              </div>

              {/* ── Search + Genre filter ── */}
              {items.length > 0 && (
                <div className="space-y-3 mb-5">
                  {/* Search */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
                      placeholder={t.wl_search_placeholder}
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-purple-400 dark:focus:border-purple-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => { setSearchQuery(''); resetPage(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >✕</button>
                    )}
                  </div>

                  {/* Genre chips */}
                  {availableGenres.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{t.wl_filter_genre}:</span>
                      <button
                        onClick={() => { setSelectedGenres([]); resetPage(); }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedGenres.length === 0
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {t.wl_filter_all}
                      </button>
                      {availableGenres.map((gid) => {
                        const active = selectedGenres.includes(gid);
                        const name = GENRE_NAMES[gid];
                        return (
                          <button
                            key={gid}
                            onClick={() => {
                              setSelectedGenres((prev) =>
                                prev.includes(gid) ? prev.filter((g) => g !== gid) : [...prev, gid]
                              );
                              resetPage();
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              active
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {name ? (lang === 'tr' ? name.tr : name.en) : gid}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Empty states */}
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🎬</div>
                  <h2 className="text-xl font-semibold mb-2">{t.wl_empty}</h2>
                  <p className="text-gray-500 mb-6">{t.wl_empty_sub}</p>
                  <Link to="/" className="inline-flex bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
                    {t.nav_home}
                  </Link>
                </div>
              ) : fullyFiltered.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-600">
                  <div className="text-4xl mb-3">🔍</div>
                  <p>{t.wl_no_results}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                  {visibleItems.map((item) => {
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
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-4xl">🎬</div>
                          )}
                          {item.watched && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">✓</div>
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

                          {/* Star rating */}
                          <div className="flex items-center justify-center py-0.5">
                            <StarRating
                              value={item.user_rating}
                              onChange={(val) => handleRate(item, val)}
                              disabled={rating === item.id}
                            />
                          </div>

                          {/* Move to list */}
                          {collections.length > 1 && (
                            <select
                              value={item.collection_id ?? ''}
                              onChange={(e) => handleMove(item.id, e.target.value ? Number(e.target.value) : null)}
                              disabled={moving === item.id}
                              className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-purple-400 disabled:opacity-40"
                            >
                              <option value="">{t.wl_no_list}</option>
                              {collections.map((col) => (
                                <option key={col.id} value={col.id}>{col.name}</option>
                              ))}
                            </select>
                          )}

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
                            {toggling === item.id ? '...' : item.watched ? t.wl_watched_badge : t.wl_mark_watched}
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

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    {t.wl_prev}
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          p === safePage
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t.wl_next}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Edit List Modal ── */}
      {showEditModal && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t.wl_rename}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.wl_rename_subtitle}</p>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setShowEditModal(false); }}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
              autoFocus
              maxLength={100}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleEditSave}
                disabled={savingEdit || !editName.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
              >
                {savingEdit ? '...' : t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.wl_delete_list}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t.wl_delete_confirm.replace('{name}', deleteTarget.name)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">{t.wl_delete_confirm_sub}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                {t.wl_delete_list}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New List Modal ── */}
      {showNewListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewListModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t.wl_new_list}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.wl_new_list_subtitle}</p>
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateList(); if (e.key === 'Escape') setShowNewListModal(false); }}
              placeholder={t.wl_new_list_placeholder}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
              autoFocus
              maxLength={100}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowNewListModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCreateList}
                disabled={creatingList || !newListName.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
              >
                {creatingList ? '...' : t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
