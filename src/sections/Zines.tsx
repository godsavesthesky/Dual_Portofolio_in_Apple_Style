import { useEffect, useState } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { Zine } from '../lib/types';
import MacGallery from '../components/MacGallery';

export default function Zines() {
  const ref = useScrollAnimation();
  const [items, setItems] = useState<Zine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('zines')
        .select('*')
        .order('year', { ascending: false });
      if (data) setItems(data as Zine[]);
      setLoading(false);
    })();
  }, []);

  return (
    <section id="zines" className="min-h-[80vh] flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Zines</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">
            Self-Published Works
          </h2>

          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : items.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <BookOpen className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No zines yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map(z => (
                <article key={z.id} className="glass rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col">
                  {z.cover_url ? (
                    <img src={z.cover_url} alt={z.title} className="w-full h-56 object-cover" />
                  ) : (
                    <div className="w-full h-56 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(234,88,12,0.2))' }}>
                      <BookOpen className="w-10 h-10 text-amber-500/60" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">{z.title}</h3>
                      {z.issue && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide text-white" style={{ background: 'var(--accent)' }}>
                          {z.issue}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-secondary)]">
                      {z.year && <span>{z.year}</span>}
                      {z.page_count && <><span>·</span><span>{z.page_count} pages</span></>}
                    </div>

                    {z.description && (
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{z.description}</p>
                    )}

                    {z.pdf_url && (
                      <a
                        href={z.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-lg glass text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View PDF
                      </a>
                    )}

                    {z.photos && z.photos.length > 0 && (
                      <MacGallery photos={z.photos} title={z.title} />
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
