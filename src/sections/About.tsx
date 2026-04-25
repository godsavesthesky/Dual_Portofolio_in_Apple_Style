import { Wrench, Heart } from 'lucide-react';
import MacWindow from '../components/MacWindow';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useProfile } from '../lib/useProfile';

export default function About() {
  const ref = useScrollAnimation();
  const { profile, loading } = useProfile();

  const displayName = profile?.name || 'Your Name';
  const tagline = profile?.tagline || 'Graphic Designer · Illustrator · Building Designer';
  const bio = profile?.bio || 'Bio coming soon.';
  const photo = profile?.photo_url;
  const initial = displayName.trim().charAt(0).toUpperCase() || 'Y';

  // Skills — split jadi 2 kategori.
  // Kalau kolom baru (software_skills / soft_skills) masih kosong,
  // fallback ke kolom legacy "skills" biar data lama tetap muncul.
  const softwareSkills = profile?.software_skills ?? [];
  const softSkills = profile?.soft_skills ?? [];
  const legacySkills = profile?.skills ?? [];
  const useLegacy = softwareSkills.length === 0 && softSkills.length === 0 && legacySkills.length > 0;

  // Pecah bio jadi paragraf
  const paragraphs = bio.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  return (
    <section id="about" className="min-h-screen flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>About</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-12 tracking-tight">Who I Am</h2>

          <MacWindow title="about.md" className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-6">
              {/* Avatar + Name + Tagline */}
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
              </div>

              {/* Bio */}
              <div className="w-full max-w-xl">
                {loading ? (
                  <p className="text-[var(--text-secondary)] leading-relaxed text-center">Loading…</p>
                ) : paragraphs.length > 0 ? (
                  <div className="space-y-4">
                    {paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className="text-[var(--text-secondary)] leading-relaxed text-[15px] text-justify"
                        style={{ hyphens: 'auto', WebkitHyphens: 'auto' } as React.CSSProperties}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)] leading-relaxed text-center">{bio}</p>
                )}
              </div>

              {/* Skills — dipisah jadi Software Tools & Soft Skills */}
              {!loading && (softwareSkills.length > 0 || softSkills.length > 0 || useLegacy) && (
                <div className="pt-6 border-t border-[var(--border)] w-full">
                  {useLegacy ? (
                    <SkillGroup
                      icon={Wrench}
                      title="Skills & Tools"
                      skills={legacySkills}
                    />
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {softwareSkills.length > 0 && (
                        <SkillGroup
                          icon={Wrench}
                          title="Software Tools"
                          skills={softwareSkills}
                        />
                      )}
                      {softSkills.length > 0 && (
                        <SkillGroup
                          icon={Heart}
                          title="Soft Skills"
                          skills={softSkills}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </MacWindow>
        </div>
      </div>
    </section>
  );
}

/* ─── Helper: satu grup skill ─── */

function SkillGroup({
  icon: Icon,
  title,
  skills,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  skills: string[];
}) {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
          {title}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {skills.map(s => (
          <span
            key={s}
            className="px-3 py-1 rounded-full text-xs font-medium glass text-[var(--text-primary)]"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}