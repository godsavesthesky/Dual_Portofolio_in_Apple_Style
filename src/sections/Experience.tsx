import { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { Experience } from '../lib/types';

interface Props {
  activeSide: 'design' | 'arch';
}

export default function ExperienceSection({ activeSide }: Props) {
  const ref = useScrollAnimation();
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('experience')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setItems(data as Experience[]);
      setLoading(false);
    })();
  }, []);

  // Filter: tampilkan item yang side-nya 'both' atau sesuai activeSide
  const filtered = items.filter(exp => {
    if (exp.side === 'both') return true;
    if (activeSide === 'design' && exp.side === 'design') return true;
    if (activeSide === 'arch' && exp.side === 'arch') return true;
    return false;
  });

  return (
    <section id="experience" className="min-h-[80vh] flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Experience</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-12 tracking-tight">
            Where I've Worked
          </h2>

          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Briefcase className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No experience entries yet.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {filtered.map(exp => (
                <article key={exp.id} className="glass rounded-2xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">{exp.role}</h3>
                      {exp.company && <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>{exp.company}</p>}
                    </div>
                    {exp.period && <span className="text-xs text-[var(--text-secondary)] shrink-0">{exp.period}</span>}
                  </div>
                  {exp.description && (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{exp.description}</p>
                  )}
                  {exp.side !== 'both' && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-medium glass text-[var(--text-secondary)]">
                      {exp.side === 'design' ? '🎨 Design' : '🏗️ Architecture'}
                    </span>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}