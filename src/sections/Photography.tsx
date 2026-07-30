import { useEffect, useMemo, useState } from 'react';
import { Camera } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { Photography as PhotographyType } from '../lib/types';
import MacPhotoGallery from '../components/MacPhotoGallery';

export default function Photography() {
  const ref = useScrollAnimation();
  const [items, setItems] = useState<PhotographyType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('photography')
        .select('*')
        .order('year', { ascending: false });
      if (data) setItems(data as PhotographyType[]);
      setLoading(false);
    })();
  }, []);

  /* Map row Photography (cover_url/photos/location/camera) ke bentuk yang
     dipahami MacPhotoGallery (photos/sub_type) */
  const entries = useMemo(
    () =>
      items.map(p => ({
        id: p.id,
        title: p.title,
        photos: p.photos?.length ? p.photos : p.cover_url ? [p.cover_url] : [],
        description: p.description,
        year: p.year,
        sub_type: [p.location, p.camera].filter(Boolean).join(' · ') || null,
      })),
    [items]
  );

  return (
    <section id="photography" className="min-h-[80vh] flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Photography
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">
            Behind the Lens
          </h2>

          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : items.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Camera className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No photos yet. Check back soon.</p>
            </div>
          ) : (
            <MacPhotoGallery entries={entries} windowTitle="Behind the Lens" />
          )}
        </div>
      </div>
    </section>
  );
}