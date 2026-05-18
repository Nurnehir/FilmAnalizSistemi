import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Giriş yapılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl border border-gray-800">

        {/* Sol panel — sinema temalı */}
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-gradient-to-br from-purple-900 via-indigo-950 to-gray-950 p-10">
          <div>
            <div className="flex items-center gap-2 mb-10">
              <span className="text-3xl">🎬</span>
              <span className="text-white font-bold text-xl tracking-tight">FilmAI</span>
            </div>
            <h2 className="text-white text-2xl font-bold leading-snug mb-3">
              Sana özel film dünyasına hoş geldin
            </h2>
            <p className="text-purple-200/70 text-sm leading-relaxed">
              Ruh haline göre kişiselleştirilmiş öneriler, fragmanlar ve izleme listesi — hepsi bir arada.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              'Yapay zeka destekli kişisel öneriler',
              'Fragman izleme ve film detayları',
              'Kişisel izleme listesi',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-purple-100/80 text-sm">
                <span className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300 text-xs flex-shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Sağ panel — form */}
        <div className="flex-1 bg-gray-900 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h1 className="text-2xl font-bold text-white mb-1">Tekrar hoş geldin</h1>
            <p className="text-gray-400 text-sm mb-8">Devam etmek için hesabına giriş yap</p>

            {error && (
              <div className="bg-red-950/60 border border-red-800 text-red-300 rounded-xl px-4 py-3 mb-6 text-sm flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm placeholder-gray-600"
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Şifre</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm placeholder-gray-600"
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
                    Giriş yapılıyor...
                  </span>
                ) : 'Giriş Yap'}
              </button>
            </form>

            <p className="text-gray-500 text-sm mt-8 text-center">
              Henüz hesabın yok mu?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Ücretsiz kayıt ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
