import MovieCard from './MovieCard';

export default function MovieGrid({ movies = [], reasons = {} }) {
  if (!movies.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MovieCard
          key={`${movie.tmdb_id || movie.id}-${movie.media_type}`}
          movie={movie}
          reason={reasons[movie.tmdb_id || movie.id]}
        />
      ))}
    </div>
  );
}
