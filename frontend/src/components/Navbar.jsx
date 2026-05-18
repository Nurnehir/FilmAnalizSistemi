import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/', label: t.nav_home },
    { to: '/recommend', label: t.nav_recommend },
    { to: '/watchlist', label: t.nav_watchlist },
  ];

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo + Nav links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🎬</span>
              <span className="text-gray-900 dark:text-white font-bold text-lg tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">FilmAI</span>
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                      isActive(to)
                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: theme toggle + lang toggle + avatar */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? t.settings_light : t.settings_dark}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Lang toggle */}
            <button
              onClick={toggleLang}
              title={lang === 'tr' ? 'Switch to English' : "Türkçe'ye geç"}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
            >
              {lang === 'tr' ? 'EN' : 'TR'}
            </button>

            {/* Avatar dropdown or login buttons */}
            {user ? (
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent hover:ring-purple-500 transition-all" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-transparent hover:ring-purple-500 transition-all">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-gray-700 dark:text-gray-300 text-sm font-medium">
                    {user.username}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-white text-sm font-semibold">{user.username}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-base">👤</span>
                        {t.nav_profile}
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-base">⚙️</span>
                        {t.nav_settings}
                      </Link>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-base">🚪</span>
                        {t.nav_logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors border ${
                    isActive('/login')
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  {t.login_btn}
                </Link>
                <Link
                  to="/register"
                  className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors border ${
                    isActive('/register')
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  {t.register_btn}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
