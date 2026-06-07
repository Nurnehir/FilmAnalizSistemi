import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSharedListDetail, inviteToList, leaveList, addSharedItem, removeSharedItem } from '../api/shared';
import { searchUsers } from '../api/social';
import { searchMovies } from '../api/movies';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SharedList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const { user } = useAuth();

  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add film modal
  const [showAddFilm, setShowAddFilm] = useState(false);
  const [filmQuery, setFilmQuery] = useState('');
  const [filmResults, setFilmResults] = useState([]);
  const [filmSearching, setFilmSearching] = useState(false);
  const filmDebounceRef = useRef(null);

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteResults, setInviteResults] = useState([]);
  const [inviteSearching, setInviteSearching] = useState(false);
  const [inviting, setInviting] = useState(false);
  const inviteDebounceRef = useRef(null);

  // Leave confirm
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSharedListDetail(parseInt(id));
      setList(data);
    } catch (e) {
      setError(e?.response?.data?.detail || t.error_generic);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const isOwner = user && list && list.owner_id === user.id;

  // Film search debounce
  const handleFilmSearch = (val) => {
    setFilmQuery(val);
    clearTimeout(filmDebounceRef.current);
    if (val.trim().length < 2) { setFilmResults([]); return; }
    setFilmSearching(true);
    filmDebounceRef.current = setTimeout(async () => {
      try {
        const res = await searchMovies(val.trim(), 'movie');
        setFilmResults((res.results || []).slice(0, 8));
      } catch { setFilmResults([]); }
      setFilmSearching(false);
    }, 400);
  };

  const handleAddFilm = async (movie) => {
    try {
      await addSharedItem(parseInt(id), {
        tmdb_id: movie.tmdb_id || movie.id,
        media_type: movie.media_type || 'movie',
        title: movie.title || movie.name,
        poster_path: movie.poster_path || null,
      });
      await load();
      setShowAddFilm(false);
      setFilmQuery('');
      setFilmResults([]);
    } catch (e) {
      alert(e?.response?.data?.detail || t.error_generic);
    }
  };

  const handleRemoveFilm = async (itemId) => {
    if (!window.confirm(t.shared_remove_confirm)) return;
    try {
      await removeSharedItem(parseInt(id), itemId);
      setList(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemId), item_count: prev.item_count - 1 }));
    } catch (e) {
      alert(e?.response?.data?.detail || t.error_generic);
    }
  };

  // Invite search debounce
  const handleInviteSearch = (val) => {
    setInviteQuery(val);
    clearTimeout(inviteDebounceRef.current);
    if (val.trim().length < 2) { setInviteResults([]); return; }
    setInviteSearching(true);
    inviteDebounceRef.current = setTimeout(async () => {
      try {
        const results = await searchUsers(val.trim());
        const memberIds = new Set(list?.members?.map(m => m.user_id) || []);
        setInviteResults(results.filter(u => !memberIds.has(u.id)));
      } catch { setInviteResults([]); }
      setInviteSearching(false);
    }, 400);
  };

  const handleInvite = async (targetUser) => {
    setInviting(true);
    try {
      await inviteToList(parseInt(id), targetUser.id);
      await load();
      setInviteResults(prev => prev.filter(u => u.id !== targetUser.id));
    } catch (e) {
      alert(e?.response?.data?.detail || t.error_generic);
    }
    setInviting(false);
  };

  const handleLeave = async () => {
    try {
      await leaveList(parseInt(id));
      navigate('/social');
    } catch (e) {
      alert(e?.response?.data?.detail || t.error_generic);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <LoadingSpinner />
    </div>
  );

  if (error || !list) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button onClick={() => navigate('/social')} className="text-purple-600 hover:underline text-sm">
          ← {t.social_title}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">👥</span>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{list.name}</h1>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {t.social_owner_badge}: @{list.owner_username} · {list.item_count} film
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isOwner && (
                <button
                  onClick={() => { setShowInvite(true); setInviteQuery(''); setInviteResults([]); }}
                  className="text-sm px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                >
                  + {t.social_invite}
                </button>
              )}
              <button
                onClick={() => { setShowAddFilm(true); setFilmQuery(''); setFilmResults([]); }}
                className="text-sm px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
              >
                + {t.social_add_film}
              </button>
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="text-sm px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 font-medium transition-colors"
              >
                {t.social_leave}
              </button>
            </div>
          </div>

          {/* Members */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">{t.social_members}</p>
            <div className="flex gap-2 flex-wrap">
              {list.members.map(m => (
                <Link
                  key={m.user_id}
                  to={`/user/${m.username}`}
                  className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl px-2.5 py-1.5 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                    {m.avatar_url
                      ? <img src={m.avatar_url} alt={m.username} className="w-full h-full object-cover" />
                      : m.username[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">@{m.username}</span>
                  {m.user_id === list.owner_id && (
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">👑</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Film grid */}
        {list.items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎬</p>
            <p className="text-gray-400 dark:text-gray-600 text-sm">{t.social_shared_empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.items.map(item => {
              const canRemove = user && (item.added_by_id === user.id || isOwner);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex gap-3 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  <Link to={`/movie/${item.tmdb_id}?type=${item.media_type}`} className="flex-shrink-0">
                    <div className="w-14 aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w154${item.poster_path.startsWith('/') ? item.poster_path : '/' + item.poster_path}`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600 text-xl">🎬</div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/movie/${item.tmdb_id}?type=${item.media_type}`}>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{item.title}</p>
                    </Link>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {t.social_added_by} <Link to={`/user/${item.added_by_username}`} className="text-purple-600 dark:text-purple-400 hover:underline">@{item.added_by_username}</Link>
                    </p>
                    {canRemove && (
                      <button
                        onClick={() => handleRemoveFilm(item.id)}
                        className="mt-2 text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        × Kaldır
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Film Modal ── */}
      {showAddFilm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddFilm(false)} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-md p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t.social_add_film}</h3>
            <div className="relative mb-3">
              <input
                type="text"
                value={filmQuery}
                onChange={e => handleFilmSearch(e.target.value)}
                placeholder={t.social_add_film_placeholder}
                className="w-full px-4 py-2.5 pr-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                autoFocus
              />
              {filmSearching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1.5">
              {filmResults.map(movie => (
                <button
                  key={movie.id || movie.tmdb_id}
                  onClick={() => handleAddFilm(movie)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    {movie.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">🎬</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{movie.title || movie.name}</p>
                    <p className="text-xs text-gray-400">{(movie.release_date || movie.first_air_date || '').slice(0, 4)}</p>
                  </div>
                </button>
              ))}
              {filmQuery.length >= 2 && !filmSearching && filmResults.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">{t.search_no_results}</p>
              )}
            </div>
            <button onClick={() => setShowAddFilm(false)} className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* ── Invite Modal ── */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowInvite(false)} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-md p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t.social_invite}</h3>
            <div className="relative mb-3">
              <input
                type="text"
                value={inviteQuery}
                onChange={e => handleInviteSearch(e.target.value)}
                placeholder={t.social_invite_placeholder}
                className="w-full px-4 py-2.5 pr-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                autoFocus
              />
              {inviteSearching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {inviteResults.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                    {u.avatar_url
                      ? <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                      : u.username[0].toUpperCase()}
                  </div>
                  <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">@{u.username}</p>
                  <button
                    onClick={() => handleInvite(u)}
                    disabled={inviting}
                    className="text-xs px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    {t.social_invite_btn}
                  </button>
                </div>
              ))}
              {inviteQuery.length >= 2 && !inviteSearching && inviteResults.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">{t.social_user_not_found}</p>
              )}
            </div>
            <button onClick={() => setShowInvite(false)} className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* ── Leave Confirm Modal ── */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLeaveConfirm(false)} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.social_leave}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t.social_leave_confirm.replace('{name}', list.name)}
            </p>
            {isOwner && (
              <p className="text-xs text-red-500 dark:text-red-400 mb-4">{t.social_leave_confirm_owner}</p>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                {t.cancel}
              </button>
              <button onClick={handleLeave} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors">
                {t.social_leave}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
