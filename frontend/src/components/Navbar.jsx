import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
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

  return (
    <nav className="bg-gray-900/95 backdrop-blur border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Sol: Logo + Linkler */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🎬</span>
              <span className="text-white font-bold text-lg tracking-tight group-hover:text-purple-300 transition-colors">FilmAI</span>
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {[
                  { to: '/', label: 'Keşfet' },
                  { to: '/recommend', label: 'Öneri' },
                  { to: '/watchlist', label: 'Listelerim' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                      isActive(to)
                        ? 'text-white bg-gray-800'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sağ: Avatar dropdown veya giriş butonları */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-transparent hover:ring-purple-500 transition-all">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:block text-gray-300 text-sm font-medium">
                  {user.username}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                  {/* Kullanıcı bilgisi */}
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-white text-sm font-semibold">{user.username}</p>
                    <p className="text-gray-400 text-xs mt-0.5 truncate">{user.email}</p>
                  </div>

                  {/* Menü öğeleri */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-base">👤</span>
                      Profil
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-base">⚙️</span>
                      Ayarlar
                    </Link>
                  </div>

                  {/* Çıkış */}
                  <div className="border-t border-gray-700 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-base">🚪</span>
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="text-sm bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
