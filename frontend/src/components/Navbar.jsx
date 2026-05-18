import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900/95 backdrop-blur border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-gray-300 text-sm font-medium">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
              >
                Çıkış
              </button>
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
