import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_KEY = 'portfolio_tour_done_v2';

type Lang = 'id' | 'en';
type Mood = 'wave' | 'point' | 'think' | 'excited' | 'bye' | 'fly';

interface TourStep {
  targetSelector?: string;
  title: { id: string; en: string };
  desc: { id: string; en: string };
  mood: Mood;
  bubbleFrom?: 'right' | 'left' | 'top' | 'bottom';
}

const STEPS: TourStep[] = [
  {
    title: { id: 'Halo! Aku RoboGuide 👋', en: 'Hey! I\'m RoboGuide 👋' },
    desc: {
      id: 'Aku akan temenin kamu eksplor portofolio ini! Mau mulai dari mana dulu?',
      en: 'I\'ll guide you through this portfolio! Ready to explore?',
    },
    mood: 'wave',
  },
  {
    targetSelector: '[data-tour="side-switcher"]',
    title: { id: 'Dua Mode Kreatif 🎨🏗️', en: 'Two Creative Modes 🎨🏗️' },
    desc: {
      id: 'Ini tombol buat switch antara sisi Design (grafis & ilustrasi) dan Architecture (desain bangunan). Coba klik!',
      en: 'This switches between Design (graphics & illustration) and Architecture (building design). Give it a try!',
    },
    mood: 'point',
    bubbleFrom: 'bottom',
  },
  {
    targetSelector: '[data-tour="dock-works"]',
    title: { id: 'Galeri Karya 🖼️', en: 'Works Gallery 🖼️' },
    desc: {
      id: 'Di sini semua proyek dan karya tersimpan. Klik buat lihat detail tiap karya!',
      en: 'All projects and works are here. Click any to see the full details!',
    },
    mood: 'excited',
    bubbleFrom: 'top',
  },
  {
    targetSelector: '[data-tour="dock-about"]',
    title: { id: 'Tentang Aku 👤', en: 'About Me 👤' },
    desc: {
      id: 'Bio, skill, dan tools yang aku pake ada di sini — dikemas dalam gaya macOS window!',
      en: 'Bio, skills, and tools I use — all wrapped in a macOS window style!',
    },
    mood: 'think',
    bubbleFrom: 'top',
  },
  {
    targetSelector: '[data-tour="dock-connect"]',
    title: { id: 'Yuk Ngobrol! 💬', en: 'Let\'s Connect! 💬' },
    desc: {
      id: 'Mau kolaborasi atau sekedar say hi? Klik Connect dan kirimin pesan!',
      en: 'Want to collab or just say hi? Hit Connect and send a message!',
    },
    mood: 'bye',
    bubbleFrom: 'top',
  },
];

// ─── Robot SVG ───────────────────────────────────────────────────
function RobotSVG({ mood, size = 80 }: { mood: Mood; size?: number }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % 2), 550);
    return () => clearInterval(id);
  }, []);

  const lArmR =
    mood === 'wave' || mood === 'bye' ? (frame === 0 ? -35 : -55) :
    mood === 'point' ? -65 :
    mood === 'excited' ? (frame === 0 ? -75 : -45) :
    mood === 'fly' ? -80 : -18;

  const rArmR =
    mood === 'point' ? -105 :
    mood === 'excited' ? (frame === 0 ? -45 : -75) :
    mood === 'fly' ? -80 : -18;

  const eyeY = mood === 'think' ? 38 : 36;
  const mouth =
    mood === 'excited' || mood === 'wave' ? 'M29 56 Q40 65 51 56' :
    mood === 'bye' ? 'M29 58 Q40 51 51 58' :
    mood === 'think' ? 'M31 57 Q40 61 49 57' :
    mood === 'fly' ? 'M29 56 Q40 65 51 56' :
    'M29 56 Q40 63 51 56';

  const scale = size / 80;

  return (
    <svg
      width={size}
      height={size * 1.38}
      viewBox="0 0 80 110"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 8px 20px rgba(0,122,255,0.4))',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        display: 'block',
      }}
    >
      {/* Thrusters */}
      <rect x="27" y="88" width="11" height="15" rx="5" fill="#1e3a5f" />
      <rect x="42" y="88" width="11" height="15" rx="5" fill="#1e3a5f" />
      <ellipse cx="32.5" cy="104" rx="5.5" ry="3.5" fill="#38bdf8" opacity={frame === 0 ? 0.95 : 0.35} />
      <ellipse cx="47.5" cy="104" rx="5.5" ry="3.5" fill="#38bdf8" opacity={frame === 0 ? 0.35 : 0.95} />
      <ellipse cx="32.5" cy="107" rx="4" ry="2.5" fill="#bfdbfe" opacity={frame === 0 ? 0.7 : 0.1} />
      <ellipse cx="47.5" cy="107" rx="4" ry="2.5" fill="#bfdbfe" opacity={frame === 0 ? 0.1 : 0.7} />

      {/* Body */}
      <rect x="19" y="57" width="42" height="36" rx="11" fill="#1e3a5f" />
      <rect x="19" y="57" width="42" height="13" rx="8" fill="#3b82f6" opacity="0.16" />
      <circle cx="40" cy="75" r="7.5" fill="#0ea5e9" opacity="0.18" />
      <circle cx="40" cy="75" r="4.5" fill="#38bdf8" opacity={frame === 0 ? 1 : 0.6} />
      <circle cx="40" cy="75" r="2.2" fill="white" opacity="0.9" />
      <rect x="22" y="66" width="4.5" height="13" rx="2" fill="#60a5fa" opacity="0.18" />
      <rect x="53.5" y="66" width="4.5" height="13" rx="2" fill="#60a5fa" opacity="0.18" />

      {/* Left arm */}
      <g transform={`rotate(${lArmR},19,65)`}>
        <rect x="2" y="61" width="18" height="9" rx="4.5" fill="#1e3a5f" />
        <rect x="2" y="61" width="18" height="4" rx="2" fill="#3b82f6" opacity="0.2" />
        <circle cx="2" cy="65.5" r="5.5" fill="#1e40af" />
        <circle cx="2" cy="65.5" r="3" fill="#60a5fa" opacity="0.8" />
      </g>

      {/* Right arm */}
      <g transform={`rotate(${rArmR},61,65)`}>
        <rect x="60" y="61" width="18" height="9" rx="4.5" fill="#1e3a5f" />
        <rect x="60" y="61" width="18" height="4" rx="2" fill="#3b82f6" opacity="0.2" />
        <circle cx="78" cy="65.5" r="5.5" fill="#1e40af" />
        <circle cx="78" cy="65.5" r="3" fill="#60a5fa" opacity="0.8" />
      </g>

      {/* Neck */}
      <rect x="32" y="49" width="16" height="10" rx="3.5" fill="#152b47" />
      {[35, 40, 45].map(x => (
        <line key={x} x1={x} y1="50" x2={x} y2="58" stroke="#60a5fa" strokeWidth="0.6" opacity="0.3" />
      ))}

      {/* Head */}
      <rect x="13" y="13" width="54" height="40" rx="15" fill="#1e3a5f" />
      <rect x="13" y="13" width="54" height="16" rx="11" fill="#3b82f6" opacity="0.13" />

      {/* Visor */}
      <rect x="17" y="19" width="46" height="29" rx="11" fill="#0a1929" opacity="0.94" />
      <rect x="17" y="19" width="46" height="11" rx="8" fill="#60a5fa" opacity="0.07" />

      {/* Eyes */}
      {[30, 50].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={eyeY} r="6.5" fill="#0ea5e9" opacity="0.15" />
          <circle cx={cx} cy={eyeY} r="5" fill="#38bdf8" />
          <circle cx={cx} cy={eyeY} r="3" fill="white" />
          <circle cx={cx + 1.2} cy={eyeY - 1.2} r="1.1" fill="#0ea5e9" />
          {(mood === 'excited' || mood === 'wave' || mood === 'fly') && (
            <circle cx={cx} cy={eyeY} r="7.5" fill="#38bdf8" opacity={i === 0 ? (frame === 0 ? 0.3 : 0.06) : (frame === 0 ? 0.06 : 0.3)} />
          )}
        </g>
      ))}

      {/* Mouth */}
      <path d={mouth} stroke="#38bdf8" strokeWidth="2.3" fill="none" strokeLinecap="round" />

      {/* Antenna */}
      <line x1="40" y1="13" x2="40" y2="3" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="40" cy="2.5" r="4.5" fill="#0ea5e9" />
      <circle cx="40" cy="2.5" r="2.8" fill={frame === 0 ? '#7dd3fc' : '#38bdf8'} />
      <circle cx="40" cy="2.5" r="1.3" fill="white" opacity="0.95" />

      {/* Ear bolts */}
      {[13, 67].map(cx => (
        <g key={cx}>
          <circle cx={cx} cy="31" r="5" fill="#1e40af" />
          <circle cx={cx} cy="31" r="2.8" fill="#60a5fa" opacity="0.85" />
          <circle cx={cx} cy="31" r="1.1" fill="white" opacity="0.55" />
        </g>
      ))}

      {/* Fly trail */}
      {mood === 'fly' && (
        <>
          <ellipse cx="33" cy="107" rx="6" ry="4" fill="#38bdf8" opacity={frame === 0 ? 0.5 : 0.2} />
          <ellipse cx="47" cy="107" rx="6" ry="4" fill="#38bdf8" opacity={frame === 0 ? 0.2 : 0.5} />
          <ellipse cx="33" cy="111" rx="4" ry="2.5" fill="#bfdbfe" opacity="0.3" />
          <ellipse cx="47" cy="111" rx="4" ry="2.5" fill="#bfdbfe" opacity="0.3" />
        </>
      )}
    </svg>
  );
}

// ─── Particle trail while flying ─────────────────────────────────
function FlyTrail({ active, x, y }: { active: boolean; x: number; y: number }) {
  const [particles, setParticles] = useState<{ id: number; ox: number; oy: number; age: number }[]>([]);
  const ref = useRef({ x, y });

  useEffect(() => { ref.current = { x, y }; }, [x, y]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    let id = 0;
    const interval = setInterval(() => {
      const { x: cx, y: cy } = ref.current;
      setParticles(prev => [
        ...prev.filter(p => p.age < 18).map(p => ({ ...p, age: p.age + 1 })),
        { id: id++, ox: cx + (Math.random() - 0.5) * 20, oy: cy + 55 + Math.random() * 10, age: 0 },
      ]);
    }, 40);
    return () => clearInterval(interval);
  }, [active]);

  if (!active || particles.length === 0) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9997 }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.ox,
            top: p.oy + p.age * 2,
            width: Math.max(2, 8 - p.age * 0.4),
            height: Math.max(2, 8 - p.age * 0.4),
            borderRadius: '50%',
            background: p.age < 6 ? '#38bdf8' : p.age < 12 ? '#60a5fa' : '#bfdbfe',
            opacity: Math.max(0, 1 - p.age / 18),
            transform: 'translate(-50%,-50%)',
            transition: 'none',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function TourGuide() {
  const [phase, setPhase] = useState<'hidden' | 'intro' | 'lang' | 'tour' | 'done'>('hidden');
  const [lang, setLang] = useState<Lang>('id');
  const [step, setStep] = useState(0);
  const [flying, setFlying] = useState(false);
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [robotVisible, setRobotVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [animBubble, setAnimBubble] = useState(false);
  const [bobOffset, setBobOffset] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });

  // Bob float
  useEffect(() => {
    if (phase !== 'tour') return;
    const id = setInterval(() => setBobOffset(b => !b), 1700);
    return () => clearInterval(id);
  }, [phase]);

  // Init
  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (done) return;
    const t = setTimeout(() => {
      setPhase('intro');
      setTimeout(() => setIntroVisible(true), 80);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  // ── helpers ──
  const getElementCenter = useCallback((selector: string): { x: number; y: number } | null => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  const startTourAtStep = useCallback((stepIdx: number, currentPos?: { x: number; y: number }) => {
    const s = STEPS[stepIdx];
    const startPos = currentPos || posRef.current;

    if (s.targetSelector) {
      const dest = getElementCenter(s.targetSelector);
      if (dest) {
        setTargetPos(dest);
        const landX = dest.x - 40;
        const landY = dest.y - 80;
        setFlying(true);
        setBubbleVisible(false);

        // Animate robot position via CSS transition
        setRobotPos(startPos);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setRobotPos({ x: landX, y: landY });
          });
        });

        setTimeout(() => {
          posRef.current = { x: landX, y: landY };
          setFlying(false);
          setTimeout(() => {
            setBubbleVisible(true);
            setAnimBubble(true);
          }, 150);
        }, 750);
        return;
      }
    }

    setBubbleVisible(true);
    setAnimBubble(true);
  }, [getElementCenter]);

  const beginTour = useCallback(() => {
    const startX = window.innerWidth - 120;
    const startY = window.innerHeight - 160;
    posRef.current = { x: startX, y: startY };
    setRobotPos({ x: startX, y: startY });

    setIntroVisible(false);
    setTimeout(() => {
      setPhase('tour');
      setStep(0);
      setRobotVisible(true);
      setTimeout(() => {
        setBubbleVisible(true);
        setAnimBubble(true);
      }, 400);
    }, 400);
  }, []);

  const goNext = useCallback(() => {
    const nextStep = step + 1;
    if (nextStep >= STEPS.length) {
      // Done
      setBubbleVisible(false);
      setTimeout(() => {
        setRobotVisible(false);
        setPhase('done');
        localStorage.setItem(TOUR_KEY, '1');
      }, 300);
      return;
    }
    setAnimBubble(false);
    setBubbleVisible(false);
    setStep(nextStep);
    setTimeout(() => startTourAtStep(nextStep, posRef.current), 200);
  }, [step, startTourAtStep]);

  const goPrev = useCallback(() => {
    if (step <= 0) return;
    const prevStep = step - 1;
    setAnimBubble(false);
    setBubbleVisible(false);
    setStep(prevStep);
    setTimeout(() => startTourAtStep(prevStep, posRef.current), 200);
  }, [step, startTourAtStep]);

  const dismiss = useCallback(() => {
    setBubbleVisible(false);
    setIntroVisible(false);
    setTimeout(() => {
      setRobotVisible(false);
      setPhase('done');
      localStorage.setItem(TOUR_KEY, '1');
    }, 300);
  }, []);

  const selectLang = useCallback((l: Lang) => {
    setLang(l);
    beginTour();
  }, [beginTour]);

  if (phase === 'hidden' || phase === 'done') return null;

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Bubble direction relative to robot
  const bubbleDir = currentStep?.bubbleFrom || 'right';
  const bubbleStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: '264px',
      opacity: bubbleVisible ? 1 : 0,
      transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1)',
    };
    if (bubbleDir === 'top') return { ...base, bottom: '115%', left: '50%', transform: bubbleVisible ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.92)', transformOrigin: 'bottom center' };
    if (bubbleDir === 'bottom') return { ...base, top: '115%', left: '50%', transform: bubbleVisible ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.92)', transformOrigin: 'top center' };
    if (bubbleDir === 'left') return { ...base, right: '110%', top: '10px', transform: bubbleVisible ? 'scale(1)' : 'scale(0.92)', transformOrigin: 'right center' };
    return { ...base, left: '110%', top: '10px', transform: bubbleVisible ? 'scale(1)' : 'scale(0.92)', transformOrigin: 'left center' };
  })();

  return (
    <>
      {/* ── INTRO OVERLAY ── */}
      {phase === 'intro' && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: introVisible ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              transform: introVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {/* Big robot intro */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ animation: 'roboFloat 2s ease-in-out infinite' }}>
                <RobotSVG mood="wave" size={120} />
              </div>
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 10px' }}>
              Halo! / Hello! 👋
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', margin: '0 0 32px', lineHeight: 1.6, maxWidth: '320px' }}>
              Aku RoboGuide — pemandu virtual portofolio ini.<br />
              I'm RoboGuide — your virtual portfolio guide.
            </p>

            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Pilih bahasa / Choose language
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {([
                { l: 'id' as Lang, label: '🇮🇩 Bahasa Indonesia', sub: 'Pakai bahasa Indo!' },
                { l: 'en' as Lang, label: '🇬🇧 English', sub: 'Tour in English!' },
              ]).map(({ l, label, sub }) => (
                <button
                  key={l}
                  onClick={() => selectLang(l)}
                  style={{
                    padding: '14px 28px',
                    borderRadius: '16px',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    minWidth: '160px',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,122,255,0.4)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,122,255,0.7)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px) scale(1.03)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: '11.5px', opacity: 0.65 }}>{sub}</div>
                </button>
              ))}
            </div>

            <button
              onClick={dismiss}
              style={{
                marginTop: '20px', background: 'transparent', border: 'none',
                color: 'rgba(255,255,255,0.35)', fontSize: '12px', cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {lang === 'id' ? 'Skip tur' : 'Skip tour'}
            </button>
          </div>
        </div>
      )}

      {/* ── FLYING ROBOT + TOUR ── */}
      {phase === 'tour' && (
        <>
          <FlyTrail active={flying} x={robotPos.x} y={robotPos.y} />

          <div
            style={{
              position: 'fixed',
              left: robotPos.x,
              top: robotPos.y,
              zIndex: 9998,
              opacity: robotVisible ? 1 : 0,
              transition: flying
                ? 'left 0.75s cubic-bezier(0.22,1,0.36,1), top 0.75s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease'
                : `left 0s, top 0s, opacity 0.3s ease, transform 0.9s cubic-bezier(0.45,0,0.55,1)`,
              transform: `translateY(${flying ? '-8px' : bobOffset ? '-6px' : '0px'})`,
              pointerEvents: robotVisible ? 'auto' : 'none',
            }}
          >
            {/* Bubble */}
            <div style={{ position: 'relative' }}>
              <div style={bubbleStyle}>
                <div
                  style={{
                    background: 'var(--surface)',
                    backdropFilter: 'blur(32px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '16px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,122,255,0.08)',
                  }}
                >
                  {/* Close */}
                  <button
                    onClick={dismiss}
                    style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', padding: '2px',
                      display: 'flex', alignItems: 'center', borderRadius: '50%',
                      width: '22px', height: '22px',
                    }}
                  >
                    <X size={13} />
                  </button>

                  {/* Dots */}
                  <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                    {STEPS.map((_, i) => (
                      <div key={i} style={{
                        width: i === step ? '18px' : '6px',
                        height: '6px', borderRadius: '3px',
                        background: i === step ? 'var(--accent)' : 'var(--border)',
                        transition: 'all 0.3s ease', flexShrink: 0,
                      }} />
                    ))}
                  </div>

                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 5px', paddingRight: '20px' }}>
                    {currentStep.title[lang]}
                  </p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.55 }}>
                    {currentStep.desc[lang]}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {step > 0 && (
                      <button onClick={goPrev} style={{
                        padding: '6px 10px', borderRadius: '10px',
                        border: '1px solid var(--border)', background: 'transparent',
                        color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '3px',
                      }}>
                        <ChevronLeft size={13} />
                        {lang === 'id' ? 'Balik' : 'Back'}
                      </button>
                    )}
                    <button onClick={goNext} style={{
                      flex: 1, padding: '7px 14px', borderRadius: '10px', border: 'none',
                      background: 'var(--accent)', color: '#fff', fontSize: '12.5px',
                      fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    }}>
                      {isLast
                        ? (lang === 'id' ? 'Asyik, siap! 🚀' : 'Awesome, let\'s go! 🚀')
                        : <>{lang === 'id' ? 'Lanjut' : 'Next'} <ChevronRight size={13} /></>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Robot */}
              <div
                onClick={() => setBubbleVisible(v => !v)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="RoboGuide"
              >
                <RobotSVG mood={flying ? 'fly' : currentStep.mood} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Global keyframes */}
      <style>{`
        @keyframes roboFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </>
  );
}