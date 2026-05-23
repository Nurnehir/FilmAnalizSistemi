import { useState } from 'react';
import { useLang } from '../context/LangContext';

function StarDisplay({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= value ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(dateStr, lang) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ReviewCard({ review, onEdit, onDelete }) {
  const { t, lang } = useLang();
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const bodyTrimmed = review.body.length > 300 && !expanded
    ? review.body.slice(0, 300) + '...'
    : review.body;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-sm">
            {review.display_name[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{review.display_name}</p>
            <p className="text-xs text-gray-400">{formatDate(review.created_at, lang)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarDisplay value={review.rating} />
          {review.is_own && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => onEdit(review)}
                className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                title={t.review_edit}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(review)}
                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title={t.review_delete}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Spoiler warning */}
      {review.has_spoiler && !spoilerRevealed && (
        <div className="my-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-center justify-between">
          <span className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
            ⚠️ {t.review_spoiler_warning}
          </span>
          <button
            onClick={() => setSpoilerRevealed(true)}
            className="text-xs text-yellow-700 dark:text-yellow-400 underline hover:no-underline"
          >
            {t.review_show_spoiler}
          </button>
        </div>
      )}

      {/* Body */}
      {(!review.has_spoiler || spoilerRevealed) && (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {bodyTrimmed}
          </p>
          {review.body.length > 300 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              {expanded
                ? (lang === 'tr' ? 'Daha az göster' : 'Show less')
                : (lang === 'tr' ? 'Devamını oku' : 'Read more')}
            </button>
          )}
        </div>
      )}

      {/* Edited badge */}
      {review.updated_at !== review.created_at && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 italic">
          {lang === 'tr' ? 'Düzenlendi' : 'Edited'}
        </p>
      )}
    </div>
  );
}
