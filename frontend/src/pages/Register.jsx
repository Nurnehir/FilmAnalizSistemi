import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Register() {
  const { register } = useAuth();
  const { t } = useLang();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register(form.email, form.username, form.password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Kayıt olunamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = 'w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm placeholder-gray-400 dark:placeholder-gray-600';

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
              {t.register_brand_title}
            </h2>
            <p className="text-purple-200/70 text-sm leading-relaxed">
              {t.register_brand_sub}
            </p>
          </div>
          <ul className="space-y-3">
            {[t.register_feat_1, t.register_feat_2, t.register_feat_3].map((f) => (
              <li key={f} className="flex items-center gap-2 text-purple-100/80 text-sm">
                <span className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300 text-xs flex-shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 bg-white dark:bg-gray-900 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t.register_title}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{t.register_subtitle}</p>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl px-4 py-3 mb-6 text-sm flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5">{t.register_email}</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={inputCls}
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5">{t.register_username}</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className={inputCls}
                  placeholder="kullanici123"
                />
              </div>
              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5">{t.register_password}</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={inputCls}
                  placeholder="••••••••"
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
                    {t.register_loading}
                  </span>
                ) : t.register_btn}
              </button>
            </form>

            <p className="text-gray-500 text-sm mt-8 text-center">
              {t.register_has_account}{' '}
              <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium transition-colors">
                {t.register_login_link}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
