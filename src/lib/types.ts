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
  skills: string[] | null;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'design_work' | 'arch_work' | 'zine' | 'drawing';
  created_at: string;
}

/* ─── DESIGN SIDE ─── */

export interface DesignWork {
  id: string;
  title: string;
  category_id: string | null;
  year: number | null;
  description: string | null;
  photo_url: string | null;
  photos: string[] | null;
  created_at: string;
}

export interface DesignVideo {
  id: string;
  title: string;
  video_type: string | null;      // "Brand Video" | "Social Content" | "Motion Graphics" etc
  video_url: string | null;        // direct mp4/webm URL or embed
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
  photos: string[] | null;         // interior pages gallery
  description: string | null;
  page_count: number | null;
  pdf_url: string | null;          // optional downloadable pdf
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
  created_at: string;
}

export interface Drawing {
  id: string;
  title: string;
  drawing_type: string | null;     // "Floor Plan" | "Section" | "Elevation" | "Detail" etc
  project_name: string | null;
  image_url: string | null;
  photos: string[] | null;         // multiple drawing sheets
  created_at: string;
}

export interface ArchVideo {
  id: string;
  title: string;
  video_type: string | null;      // "3D Walkthrough" | "Fly-through" | "Process" etc
  video_url: string | null;
  thumbnail_url: string | null;
  description: string | null;
  year: number | null;
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
  name: string;
  email: string;
  downloaded_at: string;
}
