import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUsername, updatePassword, updateAvatar } from '../api/auth';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState(null);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState(null);
  const fileRef = useRef();

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameMsg(null);
    try {
      const res = await updateUsername(username);
      updateUser(res.data);
      setUsernameMsg({ type: 'success', text: 'Kullanıcı adı güncellendi.' });
    } catch (err) {
      setUsernameMsg({ type: 'error', text: err.response?.data?.detail || 'Güncelleme başarısız.' });
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }
    if (passwords.next.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Şifre en az 6 karakter olmalı.' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await updatePassword(passwords.current, passwords.next);
      setPasswordMsg({ type: 'success', text: 'Şifre başarıyla güncellendi.' });
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.detail || 'Şifre güncellenemedi.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg({ type: 'error', text: 'Dosya 2MB\'dan küçük olmalı.' });
      return;
    }
    setAvatarLoading(true);
    setAvatarMsg(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const res = await updateAvatar(ev.target.result);
        updateUser(res.data);
        setAvatarMsg({ type: 'success', text: 'Profil resmi güncellendi.' });
      } catch {
        setAvatarMsg({ type: 'error', text: 'Yükleme başarısız.' });
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const Msg = ({ msg }) => {
    if (!msg) return null;
    return (
      <p className={`text-xs mt-2 ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
        {msg.type === 'success' ? '✓ ' : '⚠ '}{msg.text}
      </p>
    );
  };

  const inputCls = 'w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm placeholder-gray-600';
  const btnCls = 'bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        <div>
          <h1 className="text-2xl font-bold">Profilim</h1>
          <p className="text-gray-400 text-sm mt-1">Hesap bilgilerini buradan düzenleyebilirsin.</p>
        </div>

        {/* Profil Resmi */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-4">Profil Resmi</h2>
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-600" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold text-white ring-2 ring-purple-800">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              {avatarLoading && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarLoading}
                className={btnCls}
              >
                Fotoğraf Değiştir
              </button>
              <p className="text-gray-500 text-xs mt-1.5">JPG, PNG · Maks 2MB</p>
              <Msg msg={avatarMsg} />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </section>

        {/* Kullanıcı Adı */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-4">Kullanıcı Adı</h2>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">E-posta (değiştirilemez)</label>
              <input value={user?.email || ''} disabled className={`${inputCls} opacity-40 cursor-not-allowed`} />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Kullanıcı Adı</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required minLength={3}
                className={inputCls}
                placeholder="yeni_kullanici_adi"
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={usernameLoading || username === user?.username} className={btnCls}>
                {usernameLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <Msg msg={usernameMsg} />
            </div>
          </form>
        </section>

        {/* Şifre */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-4">Şifre Güncelle</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {[
              { label: 'Mevcut Şifre', key: 'current', placeholder: '••••••••' },
              { label: 'Yeni Şifre', key: 'next', placeholder: 'En az 6 karakter' },
              { label: 'Yeni Şifre (Tekrar)', key: 'confirm', placeholder: '••••••••' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-gray-400 text-xs mb-1.5">{label}</label>
                <input
                  type="password"
                  value={passwords[key]}
                  onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                  required
                  className={inputCls}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={passwordLoading} className={btnCls}>
                {passwordLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
              <Msg msg={passwordMsg} />
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}
