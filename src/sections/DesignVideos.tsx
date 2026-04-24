import { useEffect, useState } from 'react';
import { Film } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { DesignVideo } from '../lib/types';
import VideoGallery from '../components/VideoGallery';
import VideoFolderGallery from '../components/VideoFolderGallery';

interface VideoItem {
  id: string;
  project_id: string;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  sort_order: number;
}

interface VideoProject {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  year: number | null;
  items: VideoItem[];
}

export default function DesignVideos() {
  const ref = useScrollAnimation();
  const [videos, setVideos] = useState<DesignVideo[]>([]);
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: vids }, { data: projs }, { data: vitems }] = await Promise.all([
        supabase.from('design_videos').select('*').order('year', { ascending: false }),
        supabase.from('video_projects').select('*')
          .in('side', ['design', 'both'])
          .order('created_at', { ascending: false }),
        supabase.from('video_items').select('*').order('sort_order'),
      ]);

      if (vids) setVideos(vids as DesignVideo[]);

      if (projs && vitems) {
        const itemsByProject: Record<string, VideoItem[]> = {};
        for (const item of vitems as VideoItem[]) {
          if (!itemsByProject[item.project_id]) itemsByProject[item.project_id] = [];
          itemsByProject[item.project_id].push(item);
        }
        setProjects((projs as any[]).map(p => ({ ...p, items: itemsByProject[p.id] ?? [] })));
      }

      setLoading(false);
    })();
  }, []);

  const hasContent = videos.length > 0 || projects.length > 0;

  return (
    <section id="videos" className="min-h-[70vh] flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Video Content</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">
            Motion & Reels
          </h2>

          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : !hasContent ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Film className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No videos yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {projects.length > 0 && (
                <div>
                  {videos.length > 0 && (
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">Projects</p>
                  )}
                  <VideoFolderGallery projects={projects} />
                </div>
              )}
              {videos.length > 0 && (
                <div>
                  {projects.length > 0 && (
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">Individual</p>
                  )}
                  <VideoGallery videos={videos} title="video-content.mov" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}