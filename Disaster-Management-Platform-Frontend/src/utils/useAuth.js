import { useEffect, useState } from 'react';
import { getOfflineSession } from './offlineStorage';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const cachedUser = await getOfflineSession();
        if (cachedUser) {
          setUser(cachedUser);
        }
      } catch (err) {
        console.error("Auth loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  return { user, loading };
}