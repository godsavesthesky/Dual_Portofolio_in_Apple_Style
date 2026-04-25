import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verify = async (s: Session | null) => {
      if (!s) {
        if (!cancelled) {
          setSession(null);
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      // Verify the user is in the admins table via the is_admin() RPC.
      const { data, error } = await supabase.rpc('is_admin');
      if (cancelled) return;
      if (error) {
        console.warn('[useAuth] is_admin() RPC error:', error.message);
        // Be safe: deny access if we can't verify.
        setSession(s);
        setIsAdmin(false);
      } else {
        setSession(s);
        setIsAdmin(Boolean(data));
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => verify(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      verify(s);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, isAdmin, loading };
}