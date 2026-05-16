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
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              <span className="text-white font-bold text-lg">FilmAI</span>
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Keşfet
                </Link>
                <Link
                  to="/recommend"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/recommend') ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  AI Öneri
                </Link>
                <Link
                  to="/watchlist"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/watchlist') ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Listelerim
                </Link>
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm hidden sm:block">
                Merhaba, <span className="text-white font-medium">{user.username}</span>
              </span>
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
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Giriş
              </Link>
              <Link
                to="/register"
                className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg transition-colors"
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
