'use client';

import { useEffect } from 'react';
import { supabase } from '../../lib/auth/supabase';
import { useAuthStore } from '../../store/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; Secure`;
      } else {
        document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; Secure`;
      } else {
        document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  return <>{children}</>;
}