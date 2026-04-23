import { useEffect, useState } from 'react';
import { Film } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { ArchVideo } from '../lib/types';
import VideoGallery from '../components/VideoGallery';

export default function ArchVideos() {
  const ref = useScrollAnimation();
  const [items, setItems] = useState<ArchVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('arch_videos')
        .select('*')
        .order('year', { ascending: false });
      if (data) setItems(data as ArchVideo[]);
      setLoading(false);
    })();
  }, []);

  return (
    <section id="arch-videos" className="min-h-[70vh] flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Visualizations</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">
            3D Walkthroughs & Process
          </h2>

          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : items.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Film className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No videos yet. Check back soon.</p>
            </div>
          ) : (
            <VideoGallery videos={items} title="walkthrough.mp4" />
          )}
        </div>
      </div>
    </section>
  );
}
