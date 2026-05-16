import { useState } from 'react';
import { getRecommendations } from '../api/recommendations';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

const EXAMPLE_PROMPTS = [
  'Bugün çok yorgunum, hafif güldüren bir şey istiyorum',
  'Ailemle izleyebileceğimiz bir şey',
  'Gerilim dolu, uykumu kaçıracak',
  '90\'larda geçen nostaljik bir film',
];

export default function Recommend() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await getRecommendations(prompt);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Öneri alınırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const reasons = {};
  result?.movies?.forEach((m) => {
    reasons[m.tmdb_id] = m.reason;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Başlık */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="text-purple-400">✨</span> AI Film Önericisi
          </h1>
          <p className="text-gray-400">
            Ruh halini, istediğin türü veya ne aradığını yaz — sana özel öneriler alayım.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Örn: Bugün çok yorgunum, hafif güldüren bir şey istiyorum..."
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 text-white rounded-xl px-4 py-3 resize-none focus:outline-none transition-colors text-sm placeholder-gray-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
              }}
            />
          </div>

          {/* Örnek chipler */}
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt(p)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-purple-600 px-3 py-1.5 rounded-full transition-all"
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isLoading ? 'AI analiz ediyor...' : 'Öneri Al'}
          </button>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <LoadingSpinner size="lg" />
            <div className="text-center">
              <p className="text-white font-medium">Gemini analiz ediyor...</p>
              <p className="text-gray-500 text-sm mt-1">İsteğinizi anlıyor ve size özel filmler seçiyor</p>
            </div>
          </div>
        )}

        {/* Hata */}
        {error && !isLoading && (
          <div className="mt-6 bg-red-950/50 border border-red-800 text-red-300 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Sonuçlar */}
        {result && !isLoading && (
          <div className="mt-8 space-y-6">
            {/* AI Analiz */}
            {result.analysis && (
              <div className="bg-gray-900 border border-purple-800/50 rounded-xl p-4">
                <p className="text-xs text-purple-400 font-medium uppercase tracking-wider mb-2">AI Analiz</p>
                <p className="text-gray-300 text-sm leading-relaxed">{result.analysis}</p>
              </div>
            )}

            {/* Önerilen Filmler */}
            <div>
              <h2 className="text-lg font-bold mb-4">
                Size Özel {result.movies?.length} Film
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {result.movies?.map((movie) => (
                  <MovieCard key={movie.tmdb_id} movie={movie} reason={movie.reason} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
