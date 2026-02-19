import { useEffect, useState } from "react";
import { getProfile } from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  // add other user fields here
}

export function useAuth() {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    getProfile()
      .then((data: User) => {
        if (!cancelled) setUser(data);
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
  }, []);


  return { user, loading };
}
