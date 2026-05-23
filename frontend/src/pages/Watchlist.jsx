import { useState, useEffect, useRef } from 'react';
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
  const { t } = useLang();
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

  // Collection editing state
  const [editingColId, setEditingColId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [creatingList, setCreatingList] = useState(false);
  const editInputRef = useRef(null);

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

  useEffect(() => {
    if (editingColId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingColId]);

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
      setShowNewList(false);
      refreshContext();
    } catch {} finally { setCreatingList(false); }
  };

  const handleRenameStart = (col) => {
    setEditingColId(col.id);
    setEditName(col.name);
  };

  const handleRenameConfirm = async (colId) => {
    const name = editName.trim();
    if (!name) { setEditingColId(null); return; }
    try {
      const updated = await updateCollection(colId, name);
      setCollections((prev) => prev.map((c) => (c.id === colId ? { ...c, name: updated.name } : c)));
    } catch {} finally { setEditingColId(null); }
  };

  const handleDeleteList = async (colId) => {
    try {
      await deleteCollection(colId);
      setCollections((prev) => prev.filter((c) => c.id !== colId));
      // Items in this collection become unassigned
      setItems((prev) => prev.map((i) => (i.collection_id === colId ? { ...i, collection_id: null } : i)));
      if (activeColId === colId) setActiveColId(null);
      refreshContext();
    } catch {}
  };

  // ── Filtering ───────────────────────────────────────────────────────────────

  const visibleItems = items.filter((i) => {
    if (activeColId !== null && i.collection_id !== activeColId) return false;
    if (tab === 'watched') return i.watched;
    if (tab === 'unwatched') return !i.watched;
    return true;
  });

  const colItems = (colId) =>
    colId === null ? items : items.filter((i) => i.collection_id === colId);

  const watchedCount   = colItems(activeColId).filter((i) => i.watched).length;
  const unwatchedCount = colItems(activeColId).filter((i) => !i.watched).length;
  const totalInView    = colItems(activeColId).length;

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
          onClick={() => { setActiveColId(null); setSidebarOpen(false); }}
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
          <div key={col.id} className="group relative">
            {editingColId === col.id ? (
              <div className="flex items-center gap-1 px-3 py-2">
                <input
                  ref={editInputRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameConfirm(col.id);
                    if (e.key === 'Escape') setEditingColId(null);
                  }}
                  onBlur={() => handleRenameConfirm(col.id)}
                  className="flex-1 text-sm bg-white dark:bg-gray-700 border border-purple-400 rounded px-2 py-0.5 outline-none text-gray-900 dark:text-white"
                />
              </div>
            ) : (
              <button
                onClick={() => { setActiveColId(col.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  activeColId === col.id
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="truncate">🎬 {col.name}</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full shrink-0">
                  {col.item_count}
                </span>
              </button>
            )}
            {/* Edit / Delete icons */}
            {editingColId !== col.id && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); handleRenameStart(col); }}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  title={t.wl_rename}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteList(col.id); }}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title={t.wl_delete_list}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New list */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        {showNewList ? (
          <div className="flex gap-1">
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateList(); if (e.key === 'Escape') setShowNewList(false); }}
              placeholder={t.wl_new_list_placeholder}
              className="flex-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 outline-none focus:border-purple-400 text-gray-900 dark:text-white"
              autoFocus
            />
            <button
              onClick={handleCreateList}
              disabled={creatingList || !newListName.trim()}
              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              {creatingList ? '...' : t.save}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewList(true)}
            className="w-full text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            + {t.wl_new_list}
          </button>
        )}
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
            <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden self-start sticky top-4">
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
                        onClick={() => setTab(key)}
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
              ) : visibleItems.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-600">
                  {tab === 'watched' ? '✓ ' : '🎬 '}
                  {tab === 'watched' ? t.wl_tab_watched : tab === 'unwatched' ? t.wl_tab_unwatched : t.wl_empty_collection}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
