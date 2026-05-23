import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import StarRating from './StarRating';

export default function ReviewForm({ initialData = null, onSubmit, onCancel, isLoading }) {
  const { t, lang } = useLang();
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [body, setBody] = useState(initialData?.body || '');
  const [hasSpoiler, setHasSpoiler] = useState(initialData?.has_spoiler || false);
  const [isAnonymous, setIsAnonymous] = useState(initialData?.is_anonymous || false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setBody(initialData.body);
      setHasSpoiler(initialData.has_spoiler);
      setIsAnonymous(initialData.is_anonymous);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) {
      setError(lang === 'tr' ? 'Lütfen bir puan seçin.' : 'Please select a rating.');
      return;
    }
    if (body.length < 10) {
      setError(lang === 'tr' ? 'Yorum en az 10 karakter olmalı.' : 'Review must be at least 10 characters.');
      return;
    }
    setError('');
    onSubmit({ rating, body, has_spoiler: hasSpoiler, is_anonymous: isAnonymous });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      {/* Star rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {lang === 'tr' ? 'Puanın' : 'Your Rating'}
        </label>
        <StarRating
          value={rating}
          onChange={(v) => setRating(v || 0)}
        />
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {lang === 'tr' ? 'Yorumun' : 'Your Review'}
        </label>
        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder={lang === 'tr' ? 'Bu film hakkında ne düşünüyorsun?' : 'What did you think of this film?'}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <span className="absolute bottom-2 right-3 text-xs text-gray-400">
            {body.length} / 2000
          </span>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasSpoiler}
            onChange={(e) => setHasSpoiler(e.target.checked)}
            className="w-4 h-4 accent-purple-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            ⚠️ {lang === 'tr' ? 'Spoiler içeriyor' : 'Contains spoiler'}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 accent-purple-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {lang === 'tr' ? 'Anonim yorum yap' : 'Post anonymously'}
          </span>
        </label>
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-500">{error}</p>
      )}

      <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
        {lang === 'tr' ? 'Yorumlar herkese açık olarak yayınlanır.' : 'Reviews are publicly visible.'}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading
            ? (lang === 'tr' ? 'Gönderiliyor...' : 'Submitting...')
            : t.review_submit}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
