import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, getUserWatchlist, followUser, unfollowUser } from '../api/social';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UserProfile() {
  const { username } = useParams();
  const { t } = useLang();
  const { user, openLoginModal } = useAuth();

  const [profile, setProfile] = useState(null);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [prof, wl] = await Promise.all([
          getUserProfile(username),
          getUserWatchlist(username),
        ]);
        setProfile(prof);
        setFollowing(prof.is_following);
        setCollections(wl);
      } catch {
        setError(t.error_generic || 'Kullanıcı bulunamadı.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [username]);

  const handleFollow = async () => {
    if (!user) { openLoginModal(); return; }
    try {
      if (following) {
        await unfollowUser(profile.id);
        setFollowing(false);
        setProfile(prev => ({ ...prev, follower_count: prev.follower_count - 1 }));
      } else {
        await followUser(profile.id);
        setFollowing(true);
        setProfile(prev => ({ ...prev, follower_count: prev.follower_count + 1 }));
      }
    } catch {}
  };

  const isOwnProfile = user?.username === username;

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <LoadingSpinner />
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <p className="text-gray-500 dark:text-gray-400">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Profile card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              : profile.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">@{profile.username}</h1>
            <div className="flex gap-5 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span><strong className="text-gray-900 dark:text-white">{profile.follower_count}</strong> {t.social_followers_count}</span>
              <span><strong className="text-gray-900 dark:text-white">{profile.following_count}</strong> {t.social_following_count}</span>
              <span>
                <strong className="text-gray-900 dark:text-white">{profile.collection_count}</strong> {t.social_list_count}
                {' · '}
                <strong className="text-gray-900 dark:text-white">{profile.watchlist_count}</strong> {t.social_watchlist_count}
              </span>
            </div>
          </div>
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                following
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {following ? t.social_unfollow : t.social_follow}
            </button>
          )}
        </div>

        {/* Public collections */}
        <div>
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">{t.social_public_lists}</h2>
          {collections.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-600">{t.social_no_public_lists}</p>
          ) : (
            <div className="space-y-4">
              {collections.map(col => (
                <div key={col.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {col.name}
                    <span className="ml-2 text-xs text-gray-400 dark:text-gray-600 font-normal">{col.item_count} film</span>
                  </h3>
                  {col.items.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-600">Henüz film eklenmemiş.</p>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {col.items.map(item => (
                        <Link
                          key={item.tmdb_id}
                          to={`/movie/${item.tmdb_id}?type=${item.media_type}`}
                          className="flex-shrink-0 w-16 group"
                        >
                          <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {item.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w154${item.poster_path.startsWith('/') ? item.poster_path : '/' + item.poster_path}`}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">🎬</div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1 text-center">{item.title}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
