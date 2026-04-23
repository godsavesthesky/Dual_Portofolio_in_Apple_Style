import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSection?: string;
  robotMood: 'wave' | 'point' | 'think' | 'excited' | 'bye';
}

const TOUR_KEY = 'portfolio_tour_done_v1';

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Halo! Aku RoboGuide 👋',
    description: 'Selamat datang di portofolionya! Boleh aku temenin jalan-jalan sebentar? Gak lama kok, cuma kenalan sama isi webnya aja!',
    robotMood: 'wave',
  },
  {
    id: 'side-switcher',
    title: 'Dua Mode Kreatif',
    description: 'Di sini ada dua sisi — 🎨 Design buat karya grafis & ilustrasi, dan 🏗️ Architecture buat proyek bangunan. Bisa switch kapan aja!',
    targetSection: 'home',
    robotMood: 'point',
  },
  {
    id: 'works',
    title: 'Galeri Karya',
    description: 'Semua proyek & karya ada di section ini. Bisa diklik buat liat detailnya. Ada filter juga buat nyarinya lebih gampang!',
    targetSection: 'works',
    robotMood: 'excited',
  },
  {
    id: 'about',
    title: 'Kenalan Lebih Deket',
    description: 'Bio, skill, dan tools yang dipake ada di section About. Dikemas dengan gaya macOS window yang kece!',
    targetSection: 'about',
    robotMood: 'think',
  },
  {
    id: 'done',
    title: 'Selamat Menjelajah! 🚀',
    description: 'Itu aja tur singkatnya! Kalau mau ngobrol atau kolaborasi, ada tombol Connect di Dock bawah. Selamat eksplor!',
    robotMood: 'bye',
  },
];

function RobotSVG({ mood }: { mood: TourStep['robotMood'] }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % 2), 600);
    return () => clearInterval(id);
  }, []);

  const armRotateL =
    mood === 'wave' ? (frame === 0 ? -30 : -50) :
    mood === 'point' ? -60 :
    mood === 'excited' ? (frame === 0 ? -70 : -50) :
    mood === 'bye' ? (frame === 0 ? -80 : -40) :
    -20;

  const armRotateR =
    mood === 'point' ? -110 :
    mood === 'excited' ? (frame === 0 ? -50 : -70) :
    -20;

  const eyeY = mood === 'think' ? 38 : 36;

  const mouthPath =
    mood === 'excited' || mood === 'wave' ? 'M 30 56 Q 40 64 50 56' :
    mood === 'bye' ? 'M 30 58 Q 40 52 50 58' :
    mood === 'think' ? 'M 32 57 Q 40 60 48 57' :
    'M 30 56 Q 40 62 50 56';

  return (
    <svg
      width="80"
      height="110"
      viewBox="0 0 80 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 6px 18px rgba(0,122,255,0.35))' }}
    >
      {/* Jetpack thrusters */}
      <rect x="28" y="90" width="10" height="14" rx="5" fill="#334155" opacity="0.85" />
      <rect x="42" y="90" width="10" height="14" rx="5" fill="#334155" opacity="0.85" />
      <ellipse cx="33" cy="105" rx="5" ry="3" fill="#60a5fa" opacity={frame === 0 ? 0.9 : 0.4} />
      <ellipse cx="47" cy="105" rx="5" ry="3" fill="#60a5fa" opacity={frame === 0 ? 0.4 : 0.9} />
      <ellipse cx="33" cy="108" rx="3.5" ry="2" fill="#bfdbfe" opacity={frame === 0 ? 0.6 : 0.15} />
      <ellipse cx="47" cy="108" rx="3.5" ry="2" fill="#bfdbfe" opacity={frame === 0 ? 0.15 : 0.6} />

      {/* Body */}
      <rect x="20" y="58" width="40" height="36" rx="10" fill="#1e3a5f" />
      <rect x="20" y="58" width="40" height="14" rx="7" fill="#3b82f6" opacity="0.18" />
      {/* Chest light */}
      <circle cx="40" cy="76" r="7" fill="#0ea5e9" opacity="0.2" />
      <circle cx="40" cy="76" r="4" fill="#38bdf8" opacity={frame === 0 ? 0.95 : 0.6} />
      <circle cx="40" cy="76" r="2" fill="white" opacity="0.85" />
      {/* Side details */}
      <rect x="23" y="67" width="4" height="12" rx="2" fill="#60a5fa" opacity="0.2" />
      <rect x="53" y="67" width="4" height="12" rx="2" fill="#60a5fa" opacity="0.2" />

      {/* Left arm */}
      <g transform={`rotate(${armRotateL}, 20, 65)`}>
        <rect x="4" y="62" width="17" height="8" rx="4" fill="#1e3a5f" />
        <rect x="4" y="62" width="17" height="4" rx="2" fill="#3b82f6" opacity="0.2" />
        <circle cx="4" cy="66" r="5" fill="#1e40af" />
        <circle cx="4" cy="66" r="3" fill="#60a5fa" opacity="0.7" />
      </g>

      {/* Right arm */}
      <g transform={`rotate(${armRotateR}, 60, 65)`}>
        <rect x="59" y="62" width="17" height="8" rx="4" fill="#1e3a5f" />
        <rect x="59" y="62" width="17" height="4" rx="2" fill="#3b82f6" opacity="0.2" />
        <circle cx="76" cy="66" r="5" fill="#1e40af" />
        <circle cx="76" cy="66" r="3" fill="#60a5fa" opacity="0.7" />
      </g>

      {/* Neck */}
      <rect x="33" y="50" width="14" height="10" rx="3" fill="#152b47" />
      <line x1="36" y1="51" x2="36" y2="59" stroke="#60a5fa" strokeWidth="0.5" opacity="0.35" />
      <line x1="40" y1="51" x2="40" y2="59" stroke="#60a5fa" strokeWidth="0.5" opacity="0.35" />
      <line x1="44" y1="51" x2="44" y2="59" stroke="#60a5fa" strokeWidth="0.5" opacity="0.35" />

      {/* Head */}
      <rect x="14" y="14" width="52" height="38" rx="14" fill="#1e3a5f" />
      <rect x="14" y="14" width="52" height="16" rx="10" fill="#3b82f6" opacity="0.15" />

      {/* Visor / faceplate */}
      <rect x="18" y="20" width="44" height="28" rx="10" fill="#0c1e35" opacity="0.92" />
      <rect x="18" y="20" width="44" height="10" rx="7" fill="#60a5fa" opacity="0.08" />

      {/* Eyes */}
      <circle cx="30" cy={eyeY} r="6" fill="#0ea5e9" opacity="0.18" />
      <circle cx="30" cy={eyeY} r="4.5" fill="#38bdf8" />
      <circle cx="30" cy={eyeY} r="2.8" fill="white" />
      <circle cx="31.2" cy={eyeY - 1} r="1" fill="#0ea5e9" />

      <circle cx="50" cy={eyeY} r="6" fill="#0ea5e9" opacity="0.18" />
      <circle cx="50" cy={eyeY} r="4.5" fill="#38bdf8" />
      <circle cx="50" cy={eyeY} r="2.8" fill="white" />
      <circle cx="51.2" cy={eyeY - 1} r="1" fill="#0ea5e9" />

      {/* Eye glow pulse */}
      {(mood === 'excited' || mood === 'wave') && (
        <>
          <circle cx="30" cy={eyeY} r="7" fill="#38bdf8" opacity={frame === 0 ? 0.3 : 0.08} />
          <circle cx="50" cy={eyeY} r="7" fill="#38bdf8" opacity={frame === 0 ? 0.08 : 0.3} />
        </>
      )}

      {/* Mouth */}
      <path d={mouthPath} stroke="#38bdf8" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />

      {/* Antenna */}
      <line x1="40" y1="14" x2="40" y2="4" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="3.5" r="4" fill="#0ea5e9" />
      <circle cx="40" cy="3.5" r="2.5" fill={frame === 0 ? '#7dd3fc' : '#38bdf8'} />
      <circle cx="40" cy="3.5" r="1.2" fill="white" opacity="0.9" />

      {/* Ear bolts */}
      <circle cx="14" cy="32" r="4.5" fill="#1e40af" />
      <circle cx="14" cy="32" r="2.5" fill="#60a5fa" opacity="0.8" />
      <circle cx="14" cy="32" r="1" fill="white" opacity="0.5" />
      <circle cx="66" cy="32" r="4.5" fill="#1e40af" />
      <circle cx="66" cy="32" r="2.5" fill="#60a5fa" opacity="0.8" />
      <circle cx="66" cy="32" r="1" fill="white" opacity="0.5" />
    </svg>
  );
}

export default function TourGuide() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [robotBob, setRobotBob] = useState(false);
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;
    const done = localStorage.getItem(TOUR_KEY);
    if (done) return;
    hasShown.current = true;
    const t = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setBubbleVisible(true), 350);
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  // Bob float animation
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setRobotBob(b => !b), 1800);
    return () => clearInterval(id);
  }, [visible]);

  const goTo = useCallback((next: number) => {
    setAnimating(true);
    setBubbleVisible(false);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
      setTimeout(() => setBubbleVisible(true), 100);
    }, 220);

    const target = TOUR_STEPS[next]?.targetSection;
    if (target) {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleNext = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      goTo(step + 1);
    } else {
      dismiss();
    }
  }, [step, goTo]);

  const handlePrev = useCallback(() => {
    if (step > 0) goTo(step - 1);
  }, [step, goTo]);

  const dismiss = useCallback(() => {
    setBubbleVisible(false);
    setTimeout(() => setVisible(false), 300);
    localStorage.setItem(TOUR_KEY, '1');
  }, []);

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '7rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.5rem',
        pointerEvents: 'none',
      }}
    >
      {/* Speech bubble */}
      <div
        style={{
          opacity: bubbleVisible ? 1 : 0,
          transform: bubbleVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.96)',
          transition: 'opacity 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          pointerEvents: bubbleVisible ? 'auto' : 'none',
          width: '276px',
          position: 'relative',
        }}
      >
        <div
          style={{
            background: 'var(--surface)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,122,255,0.08)',
          }}
        >
          {/* Close */}
          <button
            onClick={dismiss}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
            }}
          >
            <X size={13} />
          </button>

          {/* Step dots */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === step ? 'var(--accent)' : 'var(--border)',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? 'translateX(6px)' : 'translateX(0)',
              transition: 'opacity 0.18s ease, transform 0.18s ease',
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px', paddingRight: '20px' }}>
              {current.title}
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.55 }}>
              {current.description}
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {step > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  padding: '6px 10px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <ChevronLeft size={13} /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '7px 14px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              {isLast ? 'Asyik, siap! 🚀' : <><span>Lanjut</span> <ChevronRight size={13} /></>}
            </button>
          </div>
        </div>

        {/* Bubble tail pointing down toward robot */}
        <div style={{ position: 'absolute', bottom: '-8px', right: '40px', width: '16px', height: '10px', overflow: 'hidden' }}>
          <div
            style={{
              width: '13px',
              height: '13px',
              background: 'var(--surface)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid var(--border)',
              borderRadius: '2px',
              transform: 'rotate(45deg)',
              position: 'absolute',
              bottom: '5px',
              left: '1px',
            }}
          />
        </div>
      </div>

      {/* Robot body — clickable to toggle bubble */}
      <div
        onClick={() => setBubbleVisible(v => !v)}
        title="RoboGuide — klik buat buka/tutup"
        style={{
          transform: robotBob ? 'translateY(-6px)' : 'translateY(0px)',
          transition: 'transform 1s cubic-bezier(0.45, 0, 0.55, 1)',
          pointerEvents: 'auto',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <RobotSVG mood={current.robotMood} />
      </div>
    </div>
  );
}