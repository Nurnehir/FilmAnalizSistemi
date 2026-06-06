import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getMovieDetail, getSimilar, getMovieVideos, getWatchProviders } from '../api/movies';
import { getReviews, createReview, updateReview, deleteReview } from '../api/reviews';
import { trackEvent } from '../api/behavior';
import { summarizeMovie, updateNote } from '../api/watchlist';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { useWatchlistContext } from '../context/WatchlistContext';
import WatchlistButton from '../components/WatchlistButton';
import LoadingSpinner from '../components/LoadingSpinner';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import WatchProviders from '../components/WatchProviders';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';

export default function MovieDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useLang();
  const { user, openLoginModal } = useAuth();
  const { getItem, refresh: refreshWatchlist } = useWatchlistContext();
  const mediaType = searchParams.get('type') || 'movie';

  const [wlItem, setWlItem] = useState(null);
  const [summarizingDetail, setSummarizingDetail] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [noteState, setNoteState] = useState(null); // null = view, {draft, saving} = edit

  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [watchProviders, setWatchProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSort, setReviewSort] = useState('newest');
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const REVIEWS_PER_PAGE = 10;
  const totalReviewPages = Math.ceil(reviewsTotal / REVIEWS_PER_PAGE);

  const loadReviews = useCallback(async (page = 1, sort = 'newest') => {
    setReviewsLoading(true);
    try {
      const data = await getReviews(id, mediaType, page, sort);
      setReviews(data.reviews);
      setReviewsTotal(data.total);
      setAvgRating(data.avg_rating);
    } catch {
      // silent
    } finally {
      setReviewsLoading(false);
    }
  }, [id, mediaType]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [detail, sim, videos, prov] = await Promise.all([
          getMovieDetail(id, mediaType),
          getSimilar(id, mediaType),
          getMovieVideos(id, mediaType),
          getWatchProviders(id, mediaType),
        ]);
        setMovie(detail);
        setSimilar(sim.results?.slice(0, 10) || []);
        setTrailer(videos[0] || null);
        setWatchProviders(prov || []);
        trackEvent('view', {
          tmdb_id: detail.tmdb_id,
          media_type: mediaType,
          title: detail.title || detail.name,
          genre_ids: detail.genres?.map((g) => g.id) || [],
        });
      } catch {
        setError(t.detail_load_error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    loadReviews(1, 'newest');
  }, [id, mediaType]);

  // Sync watchlist item from context
  useEffect(() => {
    if (user) setWlItem(getItem(parseInt(id), mediaType) || null);
    else setWlItem(null);
  }, [user, id, mediaType, getItem]);

  const handleDetailSummarize = async () => {
    if (!wlItem) return;
    setSummarizingDetail(true);
    try {
      const updated = await summarizeMovie(wlItem.id);
      setWlItem((prev) => ({ ...prev, ai_summary: updated.ai_summary }));
      setSummaryVisible(true);
    } catch {} finally {
      setSummarizingDetail(false);
    }
  };

  const toggleDetailSummary = () => setSummaryVisible((v) => !v);

  const startDetailNote = () => setNoteState({ draft: wlItem?.personal_note || '', saving: false });
  const cancelDetailNote = () => setNoteState(null);
  const changeDetailDraft = (val) => setNoteState((prev) => ({ ...prev, draft: val }));
  const saveDetailNote = async () => {
    if (!noteState || noteState.draft.length > 500) return;
    setNoteState((prev) => ({ ...prev, saving: true }));
    try {
      const updated = await updateNote(wlItem.id, noteState.draft);
      setWlItem((prev) => (prev ? { ...prev, personal_note: updated.personal_note } : prev));
      setNoteState(null);
    } catch {
      setNoteState((prev) => ({ ...prev, saving: false }));
    }
  };
  const deleteDetailNote = async () => {
    setNoteState((prev) => ({ ...(prev || { draft: '' }), saving: true }));
    try {
      const updated = await updateNote(wlItem.id, '');
      setWlItem((prev) => (prev ? { ...prev, personal_note: updated.personal_note } : prev));
      setNoteState(null);
    } catch {
      setNoteState((prev) => ({ ...(prev || { draft: '' }), saving: false }));
    }
  };

  const handleReviewSubmit = async (formData) => {
    setReviewSubmitting(true);
    setReviewError('');
    try {
      if (editingReview) {
        await updateReview(editingReview.id, formData);
      } else {
        await createReview(id, { ...formData, tmdb_id: parseInt(id), media_type: mediaType });
      }
      setShowReviewForm(false);
      setEditingReview(null);
      setReviewPage(1);
      await loadReviews(1, reviewSort);
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Bir hata oluştu');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteReview(deleteTarget.id);
      setDeleteTarget(null);
      setReviewPage(1);
      await loadReviews(1, reviewSort);
    } catch {
      // silent
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReviewPageChange = async (newPage) => {
    setReviewPage(newPage);
    await loadReviews(newPage, reviewSort);
    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSortChange = async (newSort) => {
    setReviewSort(newSort);
    setReviewPage(1);
    await loadReviews(1, newSort);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text={t.detail_loading} />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">{error || t.detail_not_found}</p>
          <Link to="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">← {t.nav_home}</Link>
        </div>
      </div>
    );
  }

  const title = movie.title || movie.name;
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}s ${movie.runtime % 60}dk` : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      {showTrailer && trailer && (
        <TrailerModal trailer={trailer} onClose={() => setShowTrailer(false)} />
      )}

      {/* Backdrop */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {movie.backdrop_url ? (
          <>
            <img
              src={movie.backdrop_url}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-950 via-gray-50/60 dark:via-gray-950/60 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-purple-950 flex items-end p-8">
            <h2 className="text-white/30 text-4xl sm:text-6xl font-black uppercase tracking-widest line-clamp-2 select-none">
              {title}
            </h2>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={title}
                className="w-40 sm:w-52 rounded-xl shadow-2xl -mt-20 sm:-mt-32 relative z-10"
              />
            ) : (
              <div className="w-40 sm:w-52 aspect-[2/3] bg-gradient-to-b from-gray-700 to-gray-900 rounded-xl flex flex-col items-center justify-center gap-3 -mt-20 sm:-mt-32 relative z-10 shadow-2xl p-3">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <p className="text-gray-400 text-xs text-center leading-tight font-medium px-1">
                  {title}
                </p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
              {(year || runtime || movie.vote_average > 0) && (
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {year && <span>{year}</span>}
                  {runtime && <span>· {runtime}</span>}
                  {movie.vote_average > 0 && (
                    <span className="text-yellow-500 dark:text-yellow-400 font-semibold">
                      ★ {movie.vote_average?.toFixed(1)}
                      {movie.vote_count && (
                        <span className="text-gray-400 dark:text-gray-500 font-normal">
                          {' '}({movie.vote_count?.toLocaleString('tr-TR')} oy)
                        </span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>

            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span key={g.id} className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {movie.overview ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{movie.overview}</p>
            ) : (
              <p className="text-gray-400 dark:text-gray-600 text-sm italic">{t.detail_no_overview}</p>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <WatchlistButton
                  movie={{ ...movie, tmdb_id: movie.tmdb_id, media_type: mediaType }}
                  className="px-5 py-2"
                />
                {trailer ? (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
                  >
                    ▶ {t.detail_trailer}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-600 italic">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    {t.detail_no_trailer}
                  </span>
                )}
              </div>
              <WatchProviders providers={watchProviders} />
            </div>
          </div>
        </div>

        {/* Note + Summary (only if in watchlist & logged in) */}
        {user && wlItem && (
          <section className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-3">
            {/* Summary row */}
            <div className="flex items-center gap-2">
              {wlItem.ai_summary && (
                <button
                  onClick={toggleDetailSummary}
                  className="flex-1 text-sm py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                >
                  {summaryVisible ? `▲ ${t.note_summary_hide}` : `▼ ${t.note_summary_show}`}
                </button>
              )}
              <button
                onClick={handleDetailSummarize}
                disabled={summarizingDetail}
                className={`text-sm py-2 rounded-xl border border-purple-200 dark:border-purple-900/50 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 ${wlItem.ai_summary ? 'px-4' : 'flex-1'}`}
              >
                {summarizingDetail ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    {t.note_summarizing}
                  </>
                ) : wlItem.ai_summary ? `↻ ${t.note_refresh_summary}` : `✨ ${t.note_create_summary}`}
              </button>
            </div>

            {/* Summary text */}
            {wlItem.ai_summary && summaryVisible && (
              <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">✨ {t.note_ai_summary}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{wlItem.ai_summary}</p>
              </div>
            )}

            {/* Personal note */}
            {noteState ? (
              /* Edit mode */
              <div className="space-y-2">
                <textarea
                  value={noteState.draft}
                  onChange={(e) => changeDetailDraft(e.target.value)}
                  placeholder={t.note_placeholder}
                  rows={3}
                  maxLength={500}
                  autoFocus
                  className={`w-full text-sm rounded-xl px-3 py-2 resize-none border focus:outline-none focus:ring-2 transition-colors bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${
                    noteState.draft.length > 500
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
                  }`}
                />
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs tabular-nums ${noteState.draft.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                    {noteState.draft.length} {t.note_char_limit}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={cancelDetailNote}
                      disabled={noteState.saving}
                      className="text-sm px-4 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={saveDetailNote}
                      disabled={noteState.saving || noteState.draft.length > 500}
                      className="text-sm px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-40"
                    >
                      {noteState.saving ? '...' : t.save}
                    </button>
                  </div>
                </div>
              </div>
            ) : wlItem.personal_note ? (
              /* View mode — note exists */
              <div className="space-y-2">
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">📝 {wlItem.personal_note}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={startDetailNote}
                    className="flex-1 text-sm py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {t.wl_edit}
                  </button>
                  <button
                    onClick={deleteDetailNote}
                    className="flex-1 text-sm py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    {t.note_delete}
                  </button>
                </div>
              </div>
            ) : (
              /* View mode — no note */
              <button
                onClick={startDetailNote}
                className="w-full text-sm py-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
              >
                + {t.note_add}
              </button>
            )}
          </section>
        )}

        {/* Cast */}
        <section className="mt-10">
          <h2 className="text-lg font-bold mb-4">{t.detail_cast}</h2>
          {movie.cast?.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {movie.cast.map((actor, i) => (
                <div key={i} className="flex-shrink-0 w-20 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 mb-2">
                    {actor.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                    )}
                  </div>
                  <p className="text-xs font-medium leading-tight text-gray-900 dark:text-white">{actor.name}</p>
                  <p className="text-xs text-gray-500 leading-tight mt-0.5">{actor.character}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-600 text-sm italic">{t.detail_no_cast}</p>
          )}
        </section>

        {/* Reviews */}
        <section className="mt-10" id="reviews-section">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold">{t.review_title}</h2>
              {avgRating !== null && (
                <span className="text-yellow-500 font-semibold text-sm">★ {avgRating}</span>
              )}
              {reviewsTotal > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  · {reviewsTotal} {t.review_count_label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Sort selector */}
              {reviewsTotal > 0 && (
                <select
                  value={reviewSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="newest">{t.review_sort_newest}</option>
                  <option value="oldest">{t.review_sort_oldest}</option>
                </select>
              )}
              {user && !showReviewForm && (
                <button
                  onClick={() => { setEditingReview(null); setShowReviewForm(true); setReviewError(''); }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {t.review_write}
                </button>
              )}
            </div>
          </div>

          {/* Delete confirm modal */}
          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {t.review_delete_confirm}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                  {t.review_delete_confirm_sub}
                </p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    disabled={deleteLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    {deleteLoading ? '...' : t.review_delete}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Review form */}
          {user && showReviewForm && (
            <div className="mb-6">
              {reviewError && (
                <p className="mb-3 text-sm text-red-500">{reviewError}</p>
              )}
              <ReviewForm
                initialData={editingReview}
                onSubmit={handleReviewSubmit}
                onCancel={() => { setShowReviewForm(false); setEditingReview(null); setReviewError(''); }}
                isLoading={reviewSubmitting}
              />
            </div>
          )}

          {!user && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <button onClick={openLoginModal} className="text-purple-500 hover:underline">{t.review_login_prompt}</button>
            </p>
          )}

          {/* Review list */}
          {reviews.length === 0 && !reviewsLoading && (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              {t.review_empty}
            </p>
          )}

          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleEditReview}
                onDelete={(r) => setDeleteTarget(r)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalReviewPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => handleReviewPageChange(reviewPage - 1)}
                disabled={reviewPage <= 1 || reviewsLoading}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[80px] text-center">
                {reviewPage} / {totalReviewPages}
              </span>
              <button
                onClick={() => handleReviewPageChange(reviewPage + 1)}
                disabled={reviewPage >= totalReviewPages || reviewsLoading}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          )}
        </section>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold mb-4">{t.detail_similar}</h2>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide items-stretch">
              {similar.map((m) => (
                <div key={m.tmdb_id || m.id} className="flex-shrink-0 w-40 flex flex-col">
                  <MovieCard movie={{ ...m, media_type: mediaType }} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
