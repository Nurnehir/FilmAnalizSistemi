import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { updateUsername, updatePassword, updateAvatar, deleteAvatar } from '../api/auth';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t } = useLang();

  const [username, setUsername] = useState(user?.username || '');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState(null);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState(null);
  const fileRef = useRef();

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameMsg(null);
    try {
      const res = await updateUsername(username);
      updateUser(res.data);
      setUsernameMsg({ type: 'success', text: t.profile_username_updated });
    } catch (err) {
      setUsernameMsg({ type: 'error', text: err.response?.data?.detail || t.profile_update_failed });
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPasswordMsg({ type: 'error', text: t.profile_password_mismatch });
      return;
    }
    if (passwords.next.length < 6) {
      setPasswordMsg({ type: 'error', text: t.profile_password_short });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await updatePassword(passwords.current, passwords.next);
      setPasswordMsg({ type: 'success', text: t.profile_password_updated });
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.detail || t.profile_password_failed });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarRemoving(true);
    setAvatarMsg(null);
    try {
      const res = await deleteAvatar();
      updateUser(res.data);
      setAvatarMsg({ type: 'success', text: t.profile_avatar_removed });
    } catch {
      setAvatarMsg({ type: 'error', text: t.profile_avatar_remove_failed });
    } finally {
      setAvatarRemoving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg({ type: 'error', text: t.profile_avatar_too_large });
      return;
    }
    setAvatarLoading(true);
    setAvatarMsg(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const res = await updateAvatar(ev.target.result);
        updateUser(res.data);
        setAvatarMsg({ type: 'success', text: t.profile_avatar_updated });
      } catch {
        setAvatarMsg({ type: 'error', text: t.profile_avatar_failed });
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const Msg = ({ msg }) => {
    if (!msg) return null;
    return (
      <p className={`text-xs mt-2 ${msg.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {msg.type === 'success' ? '✓ ' : '⚠ '}{msg.text}
      </p>
    );
  };

  const inputCls = 'w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm placeholder-gray-400 dark:placeholder-gray-600';
  const btnCls = 'bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm';
  const cardCls = 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        <div>
          <h1 className="text-2xl font-bold">{t.profile_title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t.profile_subtitle}</p>
        </div>

        {/* Profil Resmi */}
        <section className={cardCls}>
          <h2 className="text-base font-semibold mb-4">{t.profile_photo}</h2>
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
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={avatarLoading || avatarRemoving}
                  className={btnCls}
                >
                  {avatarLoading ? t.loading : t.profile_change_photo}
                </button>
                {user?.avatar_url && (
                  <button
                    onClick={handleAvatarRemove}
                    disabled={avatarLoading || avatarRemoving}
                    className="text-sm px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50 transition font-medium"
                  >
                    {avatarRemoving ? t.profile_avatar_removing : t.profile_avatar_remove}
                  </button>
                )}
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1.5">{t.profile_photo_hint}</p>
              <Msg msg={avatarMsg} />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </section>

        {/* Kullanıcı Adı */}
        <section className={cardCls}>
          <h2 className="text-base font-semibold mb-4">{t.profile_username_section}</h2>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs mb-1.5">{t.profile_email_label}</label>
              <input value={user?.email || ''} disabled className={`${inputCls} opacity-40 cursor-not-allowed`} />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs mb-1.5">{t.profile_username_label}</label>
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
                {usernameLoading ? t.profile_saving : t.profile_save}
              </button>
              <Msg msg={usernameMsg} />
            </div>
          </form>
        </section>

        {/* Şifre */}
        <section className={cardCls}>
          <h2 className="text-base font-semibold mb-4">{t.profile_password_section}</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {[
              { label: t.profile_current_password, key: 'current', placeholder: '••••••••' },
              { label: t.profile_new_password, key: 'next', placeholder: 'En az 6 karakter' },
              { label: t.profile_confirm_password, key: 'confirm', placeholder: '••••••••' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-gray-500 dark:text-gray-400 text-xs mb-1.5">{label}</label>
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
                {passwordLoading ? t.profile_updating : t.profile_update_password}
              </button>
              <Msg msg={passwordMsg} />
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}
