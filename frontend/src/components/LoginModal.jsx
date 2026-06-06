import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import PasswordInput from './PasswordInput';

export default function LoginModal({ open, onClose }) {
  const { loginSilent } = useAuth();
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setEmail('');
      setPassword('');
      setError(null);
      setIsLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await loginSilent(email, password);
      // loginSilent closes the modal automatically via closeLoginModal in AuthContext
    } catch (err) {
      setError(err.response?.data?.detail || t.login_failed);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = 'w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm placeholder-gray-400 dark:placeholder-gray-600';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎬</span>
          <span className="text-gray-900 dark:text-white font-bold text-lg">MARS</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t.guest_modal_title}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t.login_subtitle}</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl px-4 py-3 mb-5 text-sm flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5">⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5">{t.login_email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className={inputCls}
              placeholder="ornek@email.com"
            />
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5">{t.login_password}</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputCls}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.login_loading}
              </span>
            ) : t.login_btn}
          </button>
        </form>

        <div className="mt-5 space-y-2 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t.login_no_account}{' '}
            <Link
              to="/register"
              onClick={onClose}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-500 font-medium"
            >
              {t.login_register_link}
            </Link>
          </p>
          <Link
            to="/forgot-password"
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-xs"
          >
            {t.login_forgot}
          </Link>
        </div>
      </div>
    </div>
  );
}
