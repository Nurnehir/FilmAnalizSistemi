import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const inputCls = 'w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm placeholder-gray-400 dark:placeholder-gray-600';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch {
      setError(t.error_generic);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">

        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-gradient-to-br from-purple-900 via-indigo-950 to-gray-950 p-10">
          <div>
            <div className="flex items-center gap-2 mb-10">
              <span className="text-3xl">🎬</span>
              <span className="text-white font-bold text-xl tracking-tight">FilmAI</span>
            </div>
            <h2 className="text-white text-2xl font-bold leading-snug mb-3">
              {t.login_brand_title}
            </h2>
            <p className="text-purple-200/70 text-sm leading-relaxed">
              {t.login_brand_sub}
            </p>
          </div>
          <ul className="space-y-3">
            {[t.login_feat_1, t.login_feat_2, t.login_feat_3].map((f) => (
              <li key={f} className="flex items-center gap-2 text-purple-100/80 text-sm">
                <span className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300 text-xs flex-shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white dark:bg-gray-900 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t.forgot_title}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{t.forgot_subtitle}</p>

            {success ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-200 font-medium mb-1">{t.forgot_success}</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">{email}</p>
                <Link
                  to="/login"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium text-sm transition-colors"
                >
                  ← {t.forgot_back}
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl px-4 py-3 mb-6 text-sm flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">⚠</span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5">{t.forgot_email}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputCls}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm tracking-wide"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t.forgot_loading}
                      </span>
                    ) : t.forgot_btn}
                  </button>
                </form>

                <p className="text-center mt-8">
                  <Link
                    to="/login"
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors"
                  >
                    ← {t.forgot_back}
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
