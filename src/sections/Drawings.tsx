import { useEffect, useState } from 'react';
import { Ruler } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { Drawing } from '../lib/types';
import DrawingViewer from '../components/DrawingViewer';

export default function Drawings() {
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
    <section id="drawings" className="min-h-[80vh] flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Technical Drawings</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">
            Gambar Kerja
          </h2>

          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : items.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Ruler className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No drawings yet. Check back soon.</p>
            </div>
          ) : (
            <DrawingViewer drawings={items} title="gambar-kerja.dwg" />
          )}
        </div>
      </div>
    </section>
  );
}
