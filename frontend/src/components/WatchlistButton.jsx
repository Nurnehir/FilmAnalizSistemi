import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWatchlistContext } from '../context/WatchlistContext';
import { useLang } from '../context/LangContext';

export default function WatchlistButton({ movie, className = '' }) {
  const { user, openLoginModal } = useAuth();
  const { isInList, getItem, add, remove, addCollection, collections } = useWatchlistContext();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const inputRef = useRef(null);

  // Guest: show button but open login modal on click
  if (!user) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openLoginModal(); }}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 ${className}`}
      >
        + {t.wl_add}
      </button>
    );
  }

  const mediaType = movie.media_type || 'movie';
  const tmdbId = movie.tmdb_id || movie.id;
  const inList = isInList(tmdbId, mediaType);
  const item = getItem(tmdbId, mediaType);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Already in list → remove directly
    if (inList && item) {
      setLoading(true);
      try { await remove(item.id); } catch {} finally { setLoading(false); }
      return;
    }

    // Not in list → always show modal to pick a list
    setCreatingNew(false);
    setNewListName('');
    setShowModal(true);
  };

  const handleOpenCreateForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCreatingNew(true);
    setNewListName('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const name = newListName.trim();
    if (!name) return;
    setCreateLoading(true);
    try {
      const col = await addCollection(name);
      await add(movie, col.id);
      setShowModal(false);
      setCreatingNew(false);
      setNewListName('');
    } catch {} finally {
      setCreateLoading(false);
    }
  };

  const handleAddToCollection = async (e, colId) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(false);
    setLoading(true);
    try { await add(movie, colId); } catch {} finally { setLoading(false); }
  };

  const title = movie.title || movie.name || '';

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
          inList
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
        } ${className}`}
      >
        {loading ? '...' : inList ? `✓ ${t.wl_added}` : `+ ${t.wl_add}`}
      </button>

      {/* ── Collection picker modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
          />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t.wl_select_list}
                </h3>
                {title && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[240px]">
                    {title}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 -mt-1 -mr-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t.wl_select_list_subtitle}
            </p>

            {/* Collection list or create-new form */}
            {creatingNew ? (
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateAndAdd(e); }}
                  placeholder={t.wl_new_list_placeholder}
                  maxLength={60}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setCreatingNew(false); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleCreateAndAdd}
                    disabled={!newListName.trim() || createLoading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-colors"
                  >
                    {createLoading ? '...' : t.wl_create_and_add}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {collections.length === 0 && (
                    <p className="text-sm text-center text-gray-400 dark:text-gray-500 py-3">
                      {t.wl_no_collections_yet}
                    </p>
                  )}
                  {collections.map((col) => (
                    <button
                      key={col.id}
                      onClick={(e) => handleAddToCollection(e, col.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group text-left"
                    >
                      <span className="text-xl shrink-0">🎬</span>
                      <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 truncate">
                        {col.name}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        {col.item_count} {t.wl_movies}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Create new list button */}
                <button
                  onClick={handleOpenCreateForm}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 border-dashed border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {t.wl_create_new_list}
                </button>

                {/* Cancel */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                  className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {t.cancel}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
