import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchMovies } from '../api/movies';
import { useLang } from '../context/LangContext';
import MovieGrid from '../components/MovieGrid';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const q = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(q);
  const [mediaType, setMediaType] = useState('movie');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    searchMovies(q, mediaType)
      .then((data) => setResults(data.results || []))
      .catch(() => setError(t.search_error))
      .finally(() => setLoading(false));
  }, [q, mediaType]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      navigate('/search', { replace: true });
      return;
    }
    debounceRef.current = setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(val.trim())}`, { replace: true });
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      clearTimeout(debounceRef.current);
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`, { replace: true });
    }
  };

  const tabs = [
    { key: 'movie', label: t.search_type_movie },
    { key: 'tv', label: t.search_type_tv },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Search input */}
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t.search_placeholder}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-base placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
          />
          {inputValue && (
            <button
              onClick={() => { setInputValue(''); navigate('/search', { replace: true }); inputRef.current?.focus(); }}
              className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tabs — only show when there's a query */}
        {q.trim() && (
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMediaType(key)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  mediaType === key
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Content area */}
        {!q.trim() ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <svg className="w-14 h-14 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-400 dark:text-gray-500 text-base">{t.search_empty_query}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <span className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-purple-500 rounded-full animate-spin" />
              <span className="text-sm">{t.search_loading}</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.search_no_results}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              <span className="font-medium text-gray-900 dark:text-white">"{q}"</span>
              {' '}· {results.length} {mediaType === 'movie' ? t.search_type_movie.toLowerCase() : t.search_type_tv.toLowerCase()}
            </p>
            <MovieGrid movies={results.map(m => ({ ...m, media_type: mediaType }))} />
          </div>
        )}
      </div>
    </div>
  );
}
