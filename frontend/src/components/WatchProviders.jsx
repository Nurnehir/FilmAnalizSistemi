import { useState } from 'react';
import { useLang } from '../context/LangContext';

export default function WatchProviders({ providers = [] }) {
  const { t } = useLang();
  const [tooltip, setTooltip] = useState(null);

  if (!providers.length) return null;

  const visible = providers.slice(0, 5);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {t.providers_watch_on}
      </span>
      <div className="flex items-center gap-1.5">
        {visible.map((p, i) => (
          <div key={i} className="relative">
            <div
              className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 cursor-default"
              onMouseEnter={() => setTooltip(i)}
              onMouseLeave={() => setTooltip(null)}
            >
              {p.logo_url ? (
                <img src={p.logo_url} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                  {p.name.charAt(0)}
                </div>
              )}
            </div>
            {tooltip === i && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap z-20 pointer-events-none">
                {p.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
