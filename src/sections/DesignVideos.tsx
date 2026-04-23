import { useEffect, useState } from 'react';
import { Film } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { DesignVideo } from '../lib/types';
import VideoGallery from '../components/VideoGallery';

export default function DesignVideos() {
  const ref = useScrollAnimation();
  const [items, setItems] = useState<DesignVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('design_videos')
        .select('*')
        .order('year', { ascending: false });
      if (data) setItems(data as DesignVideo[]);
      setLoading(false);
    })();
  }, []);

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
          ) : items.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Film className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No videos yet. Check back soon.</p>
            </div>
          ) : (
            <VideoGallery videos={items} title="video-content.mov" />
          )}
        </div>
      </div>
    </section>
  );
}
