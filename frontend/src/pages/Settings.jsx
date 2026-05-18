import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();

  const cardCls = 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6';
  const labelCls = 'text-sm font-medium text-gray-700 dark:text-gray-300';

  const OptionBtn = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition border ${
        active
          ? 'bg-purple-600 border-purple-600 text-white'
          : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-purple-400'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        <div>
          <h1 className="text-2xl font-bold">{t.settings_title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t.settings_subtitle}</p>
        </div>

        {/* Appearance */}
        <section className={cardCls}>
          <h2 className="text-base font-semibold mb-5">{t.settings_appearance}</h2>

          <div className="space-y-5">
            {/* Theme */}
            <div>
              <p className={`${labelCls} mb-3`}>{t.settings_theme}</p>
              <div className="flex gap-3">
                <OptionBtn active={theme === 'dark'} onClick={() => theme !== 'dark' && toggleTheme()}>
                  <span>🌙</span> {t.settings_dark}
                </OptionBtn>
                <OptionBtn active={theme === 'light'} onClick={() => theme !== 'light' && toggleTheme()}>
                  <span>☀️</span> {t.settings_light}
                </OptionBtn>
              </div>
            </div>

            {/* Language */}
            <div>
              <p className={`${labelCls} mb-3`}>{t.settings_language}</p>
              <div className="flex gap-3">
                <OptionBtn active={lang === 'tr'} onClick={() => lang !== 'tr' && toggleLang()}>
                  🇹🇷 {t.settings_lang_tr}
                </OptionBtn>
                <OptionBtn active={lang === 'en'} onClick={() => lang !== 'en' && toggleLang()}>
                  🇬🇧 {t.settings_lang_en}
                </OptionBtn>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
