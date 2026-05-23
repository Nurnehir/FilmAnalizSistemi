import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getMovieDetail, getSimilar, getMovieVideos, getWatchProviders } from '../api/movies';
import { getReviews, createReview, updateReview, deleteReview } from '../api/reviews';
import { trackEvent } from '../api/behavior';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
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
  const mediaType = searchParams.get('type') || 'movie';

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
      {movie.backdrop_url && (
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <img
            src={movie.backdrop_url}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-950 via-gray-50/60 dark:via-gray-950/60 to-transparent" />
        </div>
      )}

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
              <div className="w-40 sm:w-52 aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-5xl">
                🎬
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
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

            {movie.overview && (
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{movie.overview}</p>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <WatchlistButton
                  movie={{ ...movie, tmdb_id: movie.tmdb_id, media_type: mediaType }}
                  className="px-5 py-2"
                />
                {trailer && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
                  >
                    ▶ {t.detail_trailer}
                  </button>
                )}
              </div>
              <WatchProviders providers={watchProviders} />
            </div>
          </div>
        </div>

        {/* Cast */}
        {movie.cast?.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold mb-4">{t.detail_cast}</h2>
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
          </section>
        )}

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
