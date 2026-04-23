import { useEffect, useMemo, useState } from 'react';
import { PenTool } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { DesignWork, Category } from '../lib/types';
import FilterTabs from '../components/FilterTabs';
import MacGallery from '../components/MacGallery';

export default function DesignWorks() {
  const ref = useScrollAnimation();
  const [items, setItems] = useState<DesignWork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<string | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: works } = await supabase
        .from('design_works')
        .select('*')
        .order('year', { ascending: false });

      if (works) {
        setItems(works as DesignWork[]);
        const usedIds = [...new Set(works.map(w => w.category_id).filter(Boolean))];
        if (usedIds.length > 0) {
          const { data: cats } = await supabase
            .from('categories')
            .select('*')
            .in('id', usedIds)
            .eq('type', 'design_work')
            .order('name');
          if (cats) setCategories(cats as Category[]);
        }
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter(i => i.category_id === filter)),
    [filter, items]
  );

  return (
    <section id="works" className="min-h-screen flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Selected Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">
            Graphic Design & Illustration
          </h2>

          <FilterTabs categories={categories} value={filter} onChange={setFilter} />

          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <PenTool className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No works yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(w => (
                <article key={w.id} className="glass rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col">
                  {w.photo_url ? (
                    <img src={w.photo_url} alt={w.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))' }}>
                      <PenTool className="w-10 h-10 text-blue-500/60" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">{w.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-secondary)]">
                      {w.year && <span>{w.year}</span>}
                    </div>
                    {w.description && (
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{w.description}</p>
                    )}
                    {w.photos && w.photos.length > 0 && (
                      <MacGallery photos={w.photos} title={w.title} />
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
