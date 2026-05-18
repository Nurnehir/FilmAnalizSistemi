import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getMovieDetail, getSimilar, getMovieVideos } from '../api/movies';
import { useLang } from '../context/LangContext';
import WatchlistButton from '../components/WatchlistButton';
import LoadingSpinner from '../components/LoadingSpinner';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';

export default function MovieDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useLang();
  const mediaType = searchParams.get('type') || 'movie';

  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [detail, sim, videos] = await Promise.all([
          getMovieDetail(id, mediaType),
          getSimilar(id, mediaType),
          getMovieVideos(id, mediaType),
        ]);
        setMovie(detail);
        setSimilar(sim.results?.slice(0, 10) || []);
        setTrailer(videos[0] || null);
      } catch {
        setError('Film bilgileri yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, mediaType]);

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

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold mb-4">{t.detail_similar}</h2>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {similar.map((m) => (
                <div key={m.tmdb_id || m.id} className="flex-shrink-0 w-36">
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
