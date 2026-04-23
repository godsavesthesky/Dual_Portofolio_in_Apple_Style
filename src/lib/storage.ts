import { supabase, BUCKET_PHOTOS, BUCKET_DOCS } from './supabase';

/**
 * Upload a file to Supabase Storage and return its public URL.
 */
export async function uploadFile(
  bucket: 'photos' | 'documents',
  file: File,
  folder = ''
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const filename = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

export async function uploadPhoto(file: File, folder = '') {
  return uploadFile(BUCKET_PHOTOS, file, folder);
}

export async function uploadDocument(file: File, folder = '') {
  return uploadFile(BUCKET_DOCS, file, folder);
}
