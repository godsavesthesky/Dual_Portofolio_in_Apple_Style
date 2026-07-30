import { useEffect, useState } from 'react';
import { Camera, MapPin } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { Photography as PhotographyType } from '../lib/types';
import MacGallery from '../components/MacGallery';

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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map(p => (
                <article
                  key={p.id}
                  className="glass rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col"
                >
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.title} className="w-full h-56 object-cover" />
                  ) : (
                    <div
                      className="w-full h-56 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(6,182,212,0.2))' }}
                    >
                      <Camera className="w-10 h-10 text-teal-500/60" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                      {p.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-secondary)]">
                      {p.year && <span>{p.year}</span>}
                      {p.location && (
                        <>
                          {p.year && <span>·</span>}
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {p.location}
                          </span>
                        </>
                      )}
                      {p.camera && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Camera className="w-3 h-3" /> {p.camera}
                          </span>
                        </>
                      )}
                    </div>

                    {p.description && (
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{p.description}</p>
                    )}

                    {p.photos && p.photos.length > 0 && (
                      <MacGallery photos={p.photos} title={p.title} />
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
