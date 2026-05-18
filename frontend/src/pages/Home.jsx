import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTrending } from '../api/movies';
import { getHistory } from '../api/recommendations';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [trendData, histData] = await Promise.all([
          getTrending('movie', 1),
          user ? getHistory(3, 0) : Promise.resolve({ history: [] }),
        ]);
        setMovies(trendData.results || []);
        setHistory(histData.history || []);
      } catch {
        setError('İçerikler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-gray-900 via-purple-950/20 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Ruh haline göre{' '}
              <span className="text-purple-400">film önerileri</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Ne izlemek istediğini yaz, yapay zeka ruh haline göre sana özel öneriler hazırlasın.
            </p>
            {user ? (
              <Link
                to="/recommend"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <span>✦</span> Öneri Al
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Ücretsiz Başla
                </Link>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  Giriş Yap →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Son Öneri Geçmişi */}
        {user && history.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Son Önerilerim</h2>
              <Link to="/recommend" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                Yeni Öneri Al →
              </Link>
            </div>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-gray-300 text-sm font-medium">"{h.user_prompt}"</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(h.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {h.tmdb_ids?.length > 0 && ` · ${h.tmdb_ids.length} film önerildi`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trend Filmler */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Bu Hafta Trend</h2>
            <span className="text-gray-500 text-xs">TMDB · Canlı veri</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner text="Filmler yükleniyor..." />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : (
            <MovieGrid movies={movies} />
          )}
        </section>
      </div>
    </div>
  );
}
