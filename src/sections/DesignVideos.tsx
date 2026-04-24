import { useEffect, useState } from 'react';
import { Film } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import MacVideoGallery from '../components/MacVideoGallery';
import VideoFolderGallery from '../components/VideoFolderGallery';

interface DesignVideo {
  id: string;
  title: string;
  video_type: string | null;
  video_url: string | null;
  videos: string[] | null;
  thumbnail_url: string | null;
  description: string | null;
  year: number | null;
  design_work_id: string | null;
}

interface VideoProject {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  year: number | null;
  items: { id: string; title: string; video_url: string | null; thumbnail_url: string | null; sort_order: number }[];
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
        supabase.from('video_projects').select('*').in('side', ['design', 'both']).order('created_at', { ascending: false }),
        supabase.from('video_items').select('*').order('sort_order'),
      ]);
      if (vids) setVideos(vids as DesignVideo[]);
      if (projs && vitems) {
        const byProject: Record<string, any[]> = {};
        for (const item of vitems as any[]) {
          if (!byProject[item.project_id]) byProject[item.project_id] = [];
          byProject[item.project_id].push(item);
        }
        setProjects((projs as any[]).map(p => ({ ...p, items: byProject[p.id] ?? [] })));
      }
      setLoading(false);
    })();
  }, []);

  const hasVideos = videos.some(v => (v.videos?.length ?? 0) > 0 || v.video_url);
  const hasContent = hasVideos || projects.length > 0;

  const byYear = videos.reduce<Record<string, DesignVideo[]>>((acc, v) => {
    const y = v.year?.toString() ?? 'Other';
    if (!acc[y]) acc[y] = [];
    acc[y].push(v);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) =>
    b === 'Other' ? -1 : a === 'Other' ? 1 : parseInt(b) - parseInt(a)
  );

  return (
    <section id="videos" className="min-h-[70vh] flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Video Content
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">
            Motion & Reels
          </h2>

          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : !hasContent ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Film className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No videos yet.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {projects.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">
                    Projects
                  </p>
                  <VideoFolderGallery projects={projects} />
                </div>
              )}

              {hasVideos && years.map(year => {
                const yearVideos = byYear[year].filter(
                  v => (v.videos?.length ?? 0) > 0 || v.video_url
                );
                if (!yearVideos.length) return null;
                return (
                  <div key={year}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">
                      {year}
                    </p>
                    <MacVideoGallery
                      entries={yearVideos}
                      windowTitle={`videos-${year}.mov`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}