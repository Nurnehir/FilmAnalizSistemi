import { useState, useRef, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { updateNote } from '../api/watchlist';

const MAX_CHARS = 500;

export default function NoteEditor({ itemId, initialNote, onSaved }) {
  const { t } = useLang();
  const [note, setNote] = useState(initialNote || '');
  const [saved, setSaved] = useState(false);
  const [tooLong, setTooLong] = useState(false);
  const debounceRef = useRef(null);
  const savedTimerRef = useRef(null);

  useEffect(() => {
    setNote(initialNote || '');
  }, [initialNote]);

  const handleChange = (e) => {
    const val = e.target.value;
    setNote(val);
    setSaved(false);

    if (val.length > MAX_CHARS) {
      setTooLong(true);
      return;
    }
    setTooLong(false);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const updated = await updateNote(itemId, val);
        setSaved(true);
        clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 2500);
        if (onSaved) onSaved(updated);
      } catch {
        // silent
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      clearTimeout(savedTimerRef.current);
    };
  }, []);

  const chars = note.length;

  return (
    <div className="mt-3">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
        {t.note_my_note}
      </label>
      <div className="relative">
        <textarea
          value={note}
          onChange={handleChange}
          placeholder={t.note_placeholder}
          rows={3}
          className={`w-full text-sm rounded-xl px-3 py-2 pr-16 resize-none border transition-colors focus:outline-none focus:ring-2 ${
            tooLong
              ? 'border-red-400 focus:ring-red-400 bg-red-50 dark:bg-red-950/20 text-gray-800 dark:text-gray-200'
              : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
          }`}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 pointer-events-none">
          {saved && !tooLong && (
            <span className="text-xs text-green-500 font-medium animate-pulse">
              {t.note_saved}
            </span>
          )}
          <span className={`text-xs tabular-nums ${tooLong ? 'text-red-500' : 'text-gray-400'}`}>
            {chars} {t.note_char_limit}
          </span>
        </div>
      </div>
      {tooLong && (
        <p className="text-xs text-red-500 mt-1">{t.note_too_long}</p>
      )}
    </div>
  );
}
