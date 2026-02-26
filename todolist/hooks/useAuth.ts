import { useEffect, useState, useCallback } from "react";
import { getProfile } from "../lib/api";

type AuthUser = {
  name: string;
  email: string;
  createdAt: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // trigger re-fetch

  const refreshUser = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    setLoading(true); // optional: show loading state on refresh
  }, []);

  useEffect(() => {
    let cancelled = false;

    getProfile()
      .then((data: any) => {
        if (!cancelled && data?.user) {
          const { name, email, createdAt } = data.user;
          setUser({ name, email, createdAt });
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]); // now useEffect runs whenever refreshKey changes

  return { user, loading, refreshUser };
}