export interface Profile {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  photo_url: string | null;
  cv_url: string | null;
  linkedin: string | null;
  instagram: string | null;
  tiktok: string | null;
  email: string | null;
  skills: string[] | null;              // legacy — tetap dipertahankan
  software_skills: string[] | null;     // baru — untuk Software Tools
  soft_skills: string[] | null;         // baru — untuk Soft Skills
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'design_work' | 'arch_work' | 'zine' | 'drawing';
  display_order?: number;
  created_at: string;
}

/* ─── DESIGN SIDE ─── */

export interface DesignWork {
  id: string;
  title: string;
  category_id: string | null;
  sub_type: string | null;
  year: number | null;
  description: string | null;
  photo_url: string | null;
  photos: string[] | null;
  featured?: boolean;
  created_at: string;
}

export interface DesignVideo {
  id: string;
  title: string;
  design_work_id: string | null;
  video_type: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  description: string | null;
  year: number | null;
  created_at: string;
}

export interface Zine {
  id: string;
  title: string;
  issue: string | null;
  year: number | null;
  cover_url: string | null;
  photos: string[] | null;
  description: string | null;
  page_count: number | null;
  pdf_url: string | null;
  created_at: string;
}

export interface Photography {
  id: string;
  title: string;
  year: number | null;
  location: string | null;
  camera: string | null;
  cover_url: string | null;
  photos: string[] | null;
  description: string | null;
  created_at: string;
}

/* ─── ARCHITECTURE SIDE ─── */

export interface ArchWork {
  id: string;
  title: string;
  category_id: string | null;
  year: number | null;
  description: string | null;
  photo_url: string | null;
  photos: string[] | null;
  featured?: boolean;
  created_at: string;
}

export interface Drawing {
  id: string;
  title: string;
  arch_work_id: string | null;
  drawing_type: string | null;
  image_url: string | null;
  photos: string[] | null;
  created_at: string;
}

export interface ArchVideo {
  id: string;
  title: string;
  arch_work_id: string | null;
  video_type: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  description: string | null;
  /** Optional — present only if the column exists in your Supabase schema. */
  year?: number | null;
  /** Optional — present only if the column exists in your Supabase schema. */
  videos?: string[] | null;
  created_at: string;
}

/* ─── SHARED ─── */

export interface Experience {
  id: string;
  role: string;
  company: string | null;
  period: string | null;
  description: string | null;
  side: 'design' | 'arch' | 'both';
  created_at: string;
}

export interface CvDownload {
  id: string;
  name: string | null;
  email: string | null;
  cv_type: 'design' | 'arch' | null;
  user_id: string | null;
  downloaded_at: string;
}

export interface CvFile {
  id: string;
  cv_type: 'design' | 'arch';
  file_url: string | null;
  label: string | null;
  updated_at: string;
}