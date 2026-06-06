import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getFollowerCount } from '../api/social';

const SocialNotifContext = createContext({ followerNotif: 0, clearSocialNotif: () => {} });

const LS_KEY = 'social_seen_followers';

export function SocialNotifProvider({ children }) {
  const { user } = useAuth();
  const [followerNotif, setFollowerNotif] = useState(0);

  useEffect(() => {
    if (!user) { setFollowerNotif(0); return; }

    const load = async () => {
      try {
        const { count } = await getFollowerCount();
        const seen = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
        setFollowerNotif(Math.max(0, count - seen));
      } catch {}
    };
    load();
  }, [user]);

  const clearSocialNotif = useCallback(async () => {
    try {
      const { count } = await getFollowerCount();
      localStorage.setItem(LS_KEY, String(count));
      setFollowerNotif(0);
    } catch {}
  }, []);

  return (
    <SocialNotifContext.Provider value={{ followerNotif, clearSocialNotif }}>
      {children}
    </SocialNotifContext.Provider>
  );
}

export const useSocialNotif = () => useContext(SocialNotifContext);
