import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getNotificationsCount } from '../api/social';

const SocialNotifContext = createContext({ totalNotif: 0, clearSocialNotif: () => {} });

const LS_FOLLOWERS_KEY  = 'social_seen_followers';
const LS_SHARED_TS_KEY  = 'social_shared_seen_at';

export function SocialNotifProvider({ children }) {
  const { user } = useAuth();
  const [followerNotif, setFollowerNotif] = useState(0);
  const [sharedNotif,   setSharedNotif]   = useState(0);

  useEffect(() => {
    if (!user) { setFollowerNotif(0); setSharedNotif(0); return; }
    const load = async () => {
      try {
        const since = localStorage.getItem(LS_SHARED_TS_KEY) || null;
        const { follower_count, shared_event_count } = await getNotificationsCount(since);
        const seenFollowers = parseInt(localStorage.getItem(LS_FOLLOWERS_KEY) || '0', 10);
        setFollowerNotif(Math.max(0, follower_count - seenFollowers));
        setSharedNotif(shared_event_count);
      } catch {}
    };
    load();
  }, [user]);

  const clearSocialNotif = useCallback(async () => {
    try {
      const since = localStorage.getItem(LS_SHARED_TS_KEY) || null;
      const { follower_count } = await getNotificationsCount(since);
      localStorage.setItem(LS_FOLLOWERS_KEY, String(follower_count));
      localStorage.setItem(LS_SHARED_TS_KEY, new Date().toISOString());
      setFollowerNotif(0);
      setSharedNotif(0);
    } catch {}
  }, []);

  const totalNotif = followerNotif + sharedNotif;

  return (
    <SocialNotifContext.Provider value={{ followerNotif, sharedNotif, totalNotif, clearSocialNotif }}>
      {children}
    </SocialNotifContext.Provider>
  );
}

export const useSocialNotif = () => useContext(SocialNotifContext);
