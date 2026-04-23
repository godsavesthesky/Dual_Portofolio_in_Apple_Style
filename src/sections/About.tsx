import MacWindow from '../components/MacWindow';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useProfile } from '../lib/useProfile';

export default function About() {
  const ref = useScrollAnimation();
  const { profile, loading } = useProfile();

  const displayName = profile?.name || 'Your Name';
  const tagline = profile?.tagline || 'Graphic Designer · Illustrator · Building Designer';
  const bio = profile?.bio || 'Bio coming soon.';
  const skills = profile?.skills ?? [];
  const photo = profile?.photo_url;
  const initial = displayName.trim().charAt(0).toUpperCase() || 'Y';

  return (
    <section id="about" className="min-h-screen flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>About</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-12 tracking-tight">Who I Am</h2>

          <MacWindow title="about.md" className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-6 text-center">
              {photo ? (
                <img src={photo} alt={displayName} className="w-24 h-24 rounded-full object-cover border-2 border-[var(--border)]" />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--accent), #00c6ff)' }}>
                  {initial}
                </div>
              )}

              <div>
                <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">{displayName}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{tagline}</p>
              </div>

              <p className="text-[var(--text-secondary)] leading-relaxed max-w-lg whitespace-pre-line">
                {loading ? 'Loading…' : bio}
              </p>

              {skills.length > 0 && (
                <div className="pt-4 border-t border-[var(--border)] w-full max-w-lg">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-3">Skills & Tools</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {skills.map(s => (
                      <span key={s} className="px-3 py-1 rounded-full text-xs font-medium glass text-[var(--text-primary)]">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </MacWindow>
        </div>
      </div>
    </section>
  );
}
