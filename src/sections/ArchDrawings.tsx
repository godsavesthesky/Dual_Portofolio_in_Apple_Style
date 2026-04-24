import { useEffect, useState } from 'react';
import { Ruler } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { Drawing } from '../lib/types';
import MacGallery from '../components/MacGallery';

export default function ArchDrawings() {
  const ref = useScrollAnimation();
  const [items, setItems] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('drawings')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setItems(data as Drawing[]);
      setLoading(false);
    })();
  }, []);

  return (
    <section id="drawings" className="min-h-[70vh] flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Technical Drawings
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">
            Drawings & Plans
          </h2>

          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : items.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Ruler className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No drawings yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map(d => (
                <article key={d.id} className="glass rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col">
                  {d.image_url ? (
                    <img src={d.image_url} alt={d.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(120,113,108,0.2), rgba(168,162,158,0.15))' }}>
                      <Ruler className="w-10 h-10 text-stone-500/60" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">{d.title}</h3>
                    {d.drawing_type && (
                      <span className="text-xs text-[var(--text-secondary)]">{d.drawing_type}</span>
                    )}
                    {d.photos && d.photos.length > 0 && (
                      <MacGallery photos={d.photos} title={d.title} />
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