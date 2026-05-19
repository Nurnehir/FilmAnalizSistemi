const MOVIE_GENRES = [
  { id: 28,    tr: 'Aksiyon',         en: 'Action' },
  { id: 12,    tr: 'Macera',          en: 'Adventure' },
  { id: 16,    tr: 'Animasyon',       en: 'Animation' },
  { id: 35,    tr: 'Komedi',          en: 'Comedy' },
  { id: 80,    tr: 'Suç',             en: 'Crime' },
  { id: 99,    tr: 'Belgesel',        en: 'Documentary' },
  { id: 18,    tr: 'Drama',           en: 'Drama' },
  { id: 10751, tr: 'Aile',            en: 'Family' },
  { id: 14,    tr: 'Fantezi',         en: 'Fantasy' },
  { id: 27,    tr: 'Korku',           en: 'Horror' },
  { id: 9648,  tr: 'Gizem',           en: 'Mystery' },
  { id: 10749, tr: 'Romantik',        en: 'Romance' },
  { id: 878,   tr: 'Bilim Kurgu',     en: 'Sci-Fi' },
  { id: 53,    tr: 'Gerilim',         en: 'Thriller' },
  { id: 37,    tr: 'Kovboy',          en: 'Western' },
];

const TV_GENRES = [
  { id: 10759, tr: 'Aksiyon & Macera',        en: 'Action & Adventure' },
  { id: 16,    tr: 'Animasyon',               en: 'Animation' },
  { id: 35,    tr: 'Komedi',                  en: 'Comedy' },
  { id: 80,    tr: 'Suç',                     en: 'Crime' },
  { id: 99,    tr: 'Belgesel',                en: 'Documentary' },
  { id: 18,    tr: 'Drama',                   en: 'Drama' },
  { id: 10751, tr: 'Aile',                    en: 'Family' },
  { id: 9648,  tr: 'Gizem',                   en: 'Mystery' },
  { id: 878,   tr: 'Bilim Kurgu & Fantezi',   en: 'Sci-Fi & Fantasy' },
  { id: 37,    tr: 'Kovboy',                  en: 'Western' },
];

export default function GenreSidebar({ mediaType, selected, onChange, t, lang }) {
  const genres = mediaType === 'tv' ? TV_GENRES : MOVIE_GENRES;

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id]);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t.genre_filter_title}
        </span>
        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
          >
            {t.genre_filter_clear}
          </button>
        )}
      </div>

      {genres.map((g) => {
        const checked = selected.includes(g.id);
        return (
          <label
            key={g.id}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm select-none ${
              checked
                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <input
              type="checkbox"
              className="w-3.5 h-3.5 accent-purple-600 shrink-0"
              checked={checked}
              onChange={() => toggle(g.id)}
            />
            {lang === 'tr' ? g.tr : g.en}
          </label>
        );
      })}
    </div>
  );
}
