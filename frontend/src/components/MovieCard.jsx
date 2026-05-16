import { Link } from 'react-router-dom';
import WatchlistButton from './WatchlistButton';

export default function MovieCard({ movie, reason }) {
  const title = movie.title || movie.name || 'Bilinmiyor';
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const poster = movie.poster_url || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null);

  return (
    <div className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-700 transition-all duration-200 flex flex-col">
      <Link to={`/movie/${movie.tmdb_id || movie.id}?type=${movie.media_type || 'movie'}`} className="block relative">
        <div className="aspect-[2/3] bg-gray-800 overflow-hidden">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">
              🎬
            </div>
          )}
        </div>
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg">
            ★ {movie.vote_average?.toFixed(1)}
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-1 gap-2">
        <div>
          <Link
            to={`/movie/${movie.tmdb_id || movie.id}?type=${movie.media_type || 'movie'}`}
            className="text-white font-semibold text-sm leading-tight hover:text-purple-400 transition-colors line-clamp-2"
          >
            {title}
          </Link>
          {year && <p className="text-gray-500 text-xs mt-0.5">{year}</p>}
        </div>

        {reason && (
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 bg-gray-800/50 rounded-lg p-2 italic">
            "{reason}"
          </p>
        )}

        <div className="mt-auto pt-1">
          <WatchlistButton movie={movie} className="w-full justify-center" />
        </div>
      </div>
    </div>
  );
}
