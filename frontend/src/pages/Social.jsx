import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getFollowing, getFollowers, searchUsers, followUser, unfollowUser } from '../api/social';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { useSocialNotif } from '../context/SocialNotifContext';
import LoadingSpinner from '../components/LoadingSpinner';

function UserCard({ profile, onFollowToggle }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(profile.is_following);

  const isOwnProfile = user?.username === profile.username;

  const handleToggle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profile.id);
        setIsFollowing(false);
        if (onFollowToggle) onFollowToggle(profile.id, false);
      } else {
        await followUser(profile.id);
        setIsFollowing(true);
        if (onFollowToggle) onFollowToggle(profile.id, true);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <Link
      to={`/user/${profile.username}`}
      className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-purple-400 dark:hover:border-purple-700 transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden">
        {profile.avatar_url
          ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          : profile.username[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white text-sm">@{profile.username}</p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
          {profile.follower_count} {t.social_followers_count} · {profile.collection_count ?? 0} {t.social_list_count} · {profile.watchlist_count} {t.social_watchlist_count}
        </p>
      </div>
      {!isOwnProfile && (
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 ${
            isFollowing
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {loading ? '...' : isFollowing ? t.social_unfollow : t.social_follow}
        </button>
      )}
    </Link>
  );
}

export default function Social() {
  const { t } = useLang();
  const { clearSocialNotif } = useSocialNotif();
  const [tab, setTab] = useState('following');
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    clearSocialNotif();
    const load = async () => {
      setIsLoading(true);
      try {
        const [f1, f2] = await Promise.all([getFollowing(), getFollowers()]);
        setFollowing(f1);
        setFollowers(f2);
      } catch {}
      setIsLoading(false);
    };
    load();
  }, []);

  // Dropdown dışına tıklayınca kapat
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setSearchResults([]); setShowDropdown(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchUsers(val.trim());
        setSearchResults(results);
        setShowDropdown(true);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 400);
  };

  const handleFollowToggle = (userId, nowFollowing) => {
    setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, is_following: nowFollowing } : u));
    if (nowFollowing) {
      const found = [...following, ...followers, ...searchResults].find(u => u.id === userId);
      if (found && !following.find(u => u.id === userId)) {
        setFollowing(prev => [...prev, { ...found, is_following: true }]);
      }
    } else {
      setFollowing(prev => prev.filter(u => u.id !== userId));
    }
  };

  const list = tab === 'following' ? following : followers;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.social_title}</h1>

        {/* User search */}
        {/* Kullanıcı arama — debounce dropdown */}
        <div ref={searchWrapRef} className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder={t.social_search_user}
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
              {searchResults.map(profile => (
                <div key={profile.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <UserCard profile={profile} onFollowToggle={handleFollowToggle} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1">
          {['following', 'followers'].map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${
                tab === tabKey
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tabKey === 'following' ? t.social_following : t.social_followers}
              <span className="ml-1.5 text-xs opacity-60">
                {tabKey === 'following' ? following.length : followers.length}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-10"><LoadingSpinner /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-400 dark:text-gray-600 text-sm">
              {tab === 'following' ? t.social_no_following : t.social_no_followers}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map(profile => (
              <UserCard key={profile.id} profile={profile} onFollowToggle={handleFollowToggle} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
