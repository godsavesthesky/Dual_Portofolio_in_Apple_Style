import { useState } from 'react';
import { Download, ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useProfile } from '../lib/useProfile';
import CVDownloadModal from '../components/CVDownloadModal';

interface HomeProps {
  activeSide: 'design' | 'arch';
}

export default function Home({ activeSide }: HomeProps) {
  const ref1 = useScrollAnimation();
  const ref2 = useScrollAnimation();
  const ref3 = useScrollAnimation();
  const { profile } = useProfile();
  const [cvOpen, setCvOpen] = useState(false);

  const displayName = profile?.name || 'Your Name';
  const photo = profile?.photo_url;
  const initial = displayName.trim().charAt(0).toUpperCase() || 'Y';

  const tagline = activeSide === 'design'
    ? 'Crafting visual stories through design, illustration & content creation'
    : 'Designing thoughtful spaces and architectural experiences';

  const badge = activeSide === 'design'
    ? 'Graphic Designer · Illustrator'
    : 'Building Designer · Visualizer';

  return (
    <section id="home" className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />
      </div>

      <div className="section-container text-center relative z-10">
        <div ref={ref1} className="animate-on-scroll flex justify-center mb-8">
          {photo ? (
            <img src={photo} alt={displayName} className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-[var(--border)] shadow-2xl" />
          ) : (
            <div
              className="w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-2xl"
              style={{ background: 'linear-gradient(135deg, var(--accent), #00c6ff)' }}
            >
              {initial}
            </div>
          )}
        </div>

        <div ref={ref2} className="animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-[var(--text-secondary)] mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {badge}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight tracking-tight">
            Hi, I'm <span style={{ color: 'var(--accent)' }}>{displayName}</span>
          </h1>

          <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-light">
            {tagline}
          </p>
        </div>

        <div ref={ref3} className="animate-on-scroll mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-95 flex items-center gap-2"
            style={{ background: 'var(--accent)' }}
          >
            See My Work <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCvOpen(true)}
            className="px-6 py-3 rounded-xl font-medium glass text-[var(--text-primary)] transition-all duration-200 hover:opacity-80 active:scale-95 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download CV
          </button>
        </div>
      </div>

      <CVDownloadModal isOpen={cvOpen} onClose={() => setCvOpen(false)} cvUrl={profile?.cv_url ?? null} />
    </section>
  );
}
