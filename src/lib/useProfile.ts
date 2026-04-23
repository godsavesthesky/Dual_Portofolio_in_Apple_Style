import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Profile } from './types';

let cached: Profile | null = null;
const subscribers = new Set<(p: Profile | null) => void>();

async function loadProfile() {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[useProfile]', error);
    return null;
  }
  cached = (data as Profile) ?? null;
  subscribers.forEach(cb => cb(cached));
  return cached;
}

export function refreshProfile() {
  return loadProfile();
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    const cb = (p: Profile | null) => setProfile(p);
    subscribers.add(cb);
    if (!cached) {
      loadProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => {
      subscribers.delete(cb);
    };
  }, []);

  return { profile, loading };
}
