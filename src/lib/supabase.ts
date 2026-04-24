import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  // Don't throw — let the app render with empty states instead of crashing.
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Create a .env file (see .env.example).'
  );
}

export const supabase = createClient(url ?? '', key ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Storage bucket names (create these in Supabase Dashboard)
export const BUCKET_PHOTOS = 'photos';
export const BUCKET_DOCS = 'documents';
export const BUCKET_VIDEOS = 'videos';