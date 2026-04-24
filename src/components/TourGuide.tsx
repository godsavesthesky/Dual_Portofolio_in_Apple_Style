import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Map } from 'lucide-react';

const TOUR_KEY = 'portfolio_tour_done_v4';

type Lang = 'id' | 'en';
type Mood = 'wave' | 'point' | 'think' | 'excited' | 'bye' | 'fly' | 'idle';
type Phase = 'hidden' | 'intro' | 'tour' | 'standby';

interface TourStep {
  targetSelector?: string;
  scrollToSection?: string;
  highlightSelector?: string;
  title: { id: string; en: string };
  desc: { id: string; en: string };
  mood: Mood;
  bubbleDir: 'left' | 'right' | 'top' | 'bottom';
  // Optional: demo action to run when step shown
  demoAction?: 'click-design' | 'click-arch';
}

const STEPS: TourStep[] = [
  {
    title: { id: 'Halo! Aku RoboGuide 👋', en: "Hey! I'm RoboGuide 👋" },
    desc: {
      id: 'Aku siap temenin kamu eksplor portofolio ini. Yuk mulai!',
      en: "I'll guide you through this portfolio. Let's go!",
    },
    mood: 'wave',
    bubbleDir: 'left',
  },
  {
    targetSelector: '[data-tour="side-switcher"]',
    highlightSelector: '[data-tour="side-switcher"]',
    title: { id: 'Dua Mode Kreatif 🎨🏗️', en: 'Two Creative Modes 🎨🏗️' },
    desc: {
      id: 'Di sini kamu bisa switch antara sisi Design (grafis & ilustrasi) dan Architecture (desain bangunan). Coba klik salah satunya!',
      en: 'Switch between Design (graphics & illustration) and Architecture (building design). Try clicking one!',
    },
    mood: 'point',
    bubbleDir: 'bottom',
  },
  {
    targetSelector: '[data-tour="dock-works"]',
    highlightSelector: '[data-tour="dock-works"]',
    scrollToSection: 'works',
    title: { id: 'Galeri Karya 🖼️', en: 'Works Gallery 🖼️' },
    desc: {
      id: 'Semua proyek & karya ada di sini — desain grafis, ilustrasi, sampai konten kreatif. Klik buat lihat detailnya!',
      en: 'All projects and works live here — graphic design, illustration, creative content. Click to see details!',
    },
    mood: 'excited',
    bubbleDir: 'top',
  },
  {
    targetSelector: '[data-tour="dock-about"]',
    highlightSelector: '[data-tour="dock-about"]',
    scrollToSection: 'about',
    title: { id: 'Tentang Aku 👤', en: 'About Me 👤' },
    desc: {
      id: 'Bio, skill, dan tools yang dipakai ada di sini — dikemas dalam gaya macOS window yang kece!',
      en: 'Bio, skills, and tools — all in a sleek macOS window style!',
    },
    mood: 'think',
    bubbleDir: 'top',
  },
  {
    targetSelector: '[data-tour="dock-connect"]',
    highlightSelector: '[data-tour="dock-connect"]',
    title: { id: 'Yuk Ngobrol! 💬', en: "Let's Connect! 💬" },
    desc: {
      id: 'Mau kolaborasi atau sekedar say hi? Klik Connect dan kirimin pesan langsung!',
      en: 'Want to collab or just say hi? Hit Connect and drop a message!',
    },
    mood: 'bye',
    bubbleDir: 'top',
  },
];

// ─── Spotlight overlay ────────────────────────────────────────────
function SpotlightOverlay({
  targetSelector,
  active,
}: {
  targetSelector?: string;
  active: boolean;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!active || !targetSelector) { setRect(null); return; }

    const update = () => {
      const el = document.querySelector(targetSelector);
      if (el) setRect(el.getBoundingClientRect());
    };
    update();
    const id = setInterval(update, 200);
    return () => clearInterval(id);
  }, [targetSelector, active]);

  if (!active) return null;

  const PAD = 12;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9990,
        pointerEvents: 'all',
        // We use a CSS clip trick: one big overlay with a "hole" cut out via box-shadow
        transition: 'opacity 0.3s ease',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Dark blur overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.62)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
      }} />

      {/* Cutout highlight — a transparent hole with glowing border */}
      {rect && (
        <>
          {/* Clear hole via mix-blend-mode trick */}
          <div style={{
            position: 'absolute',
            left: rect.left - PAD,
            top: rect.top - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            borderRadius: '16px',
            background: 'transparent',
            boxShadow: `0 0 0 9999px rgba(0,0,0,0.62), 0 0 0 2px rgba(56,189,248,0.7), 0 0 24px 4px rgba(56,189,248,0.35)`,
            backdropFilter: 'blur(0px)',
            WebkitBackdropFilter: 'blur(0px)',
            zIndex: 1,
            pointerEvents: 'none',
            transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
          }} />
          {/* Animated pulse ring */}
          <div style={{
            position: 'absolute',
            left: rect.left - PAD - 6,
            top: rect.top - PAD - 6,
            width: rect.width + PAD * 2 + 12,
            height: rect.height + PAD * 2 + 12,
            borderRadius: '20px',
            border: '1.5px solid rgba(56,189,248,0.4)',
            zIndex: 1,
            pointerEvents: 'none',
            animation: 'spotPulse 1.8s ease-in-out infinite',
            transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </>
      )}
    </div>
  );
}

// ─── Robot SVG ────────────────────────────────────────────────────
function RobotSVG({ mood, size = 72 }: { mood: Mood; size?: number }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % 2), 550);
    return () => clearInterval(id);
  }, []);

  const lArmR =
    mood === 'wave' || mood === 'bye' ? (frame === 0 ? -32 : -54) :
    mood === 'point' ? -68 :
    mood === 'excited' ? (frame === 0 ? -72 : -44) :
    mood === 'fly' ? -85 :
    mood === 'idle' ? (frame === 0 ? -10 : -22) : -16;

  const rArmR =
    mood === 'point' ? -108 :
    mood === 'excited' ? (frame === 0 ? -42 : -72) :
    mood === 'fly' ? -85 :
    mood === 'idle' ? (frame === 0 ? -22 : -10) : -16;

  const eyeY = mood === 'think' ? 37 : mood === 'idle' ? 36 : 35;
  const eyeScale = mood === 'idle' ? (frame === 0 ? 1 : 0.85) : 1;

  const mouth =
    mood === 'excited' || mood === 'wave' || mood === 'fly' ? 'M29 56 Q40 65 51 56' :
    mood === 'bye' ? 'M29 58 Q40 51 51 58' :
    mood === 'think' || mood === 'idle' ? 'M31 57 Q40 61 49 57' :
    'M29 56 Q40 63 51 56';

  const w = size;
  const h = Math.round(size * 1.39);

  return (
    <svg width={w} height={h} viewBox="0 0 80 110" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 6px 16px rgba(0,122,255,0.45))', display: 'block' }}>

      {/* Thrusters */}
      <rect x="27" y="88" width="11" height="14" rx="5" fill="#1e3a5f" />
      <rect x="42" y="88" width="11" height="14" rx="5" fill="#1e3a5f" />
      <ellipse cx="32.5" cy="103" rx="5.5" ry="3.5" fill="#38bdf8" opacity={frame === 0 ? 0.95 : 0.3} />
      <ellipse cx="47.5" cy="103" rx="5.5" ry="3.5" fill="#38bdf8" opacity={frame === 0 ? 0.3 : 0.95} />
      <ellipse cx="32.5" cy="107" rx="4" ry="2.2" fill="#bfdbfe" opacity={mood === 'idle' ? 0.15 : (frame === 0 ? 0.65 : 0.1)} />
      <ellipse cx="47.5" cy="107" rx="4" ry="2.2" fill="#bfdbfe" opacity={mood === 'idle' ? 0.15 : (frame === 0 ? 0.1 : 0.65)} />

      {/* Body */}
      <rect x="19" y="57" width="42" height="35" rx="11" fill="#1e3a5f" />
      <rect x="19" y="57" width="42" height="13" rx="8" fill="#3b82f6" opacity="0.15" />
      <circle cx="40" cy="74" r="7" fill="#0ea5e9" opacity="0.18" />
      <circle cx="40" cy="74" r="4.5" fill="#38bdf8" opacity={mood === 'idle' ? (frame === 0 ? 0.4 : 0.2) : (frame === 0 ? 1 : 0.55)} />
      <circle cx="40" cy="74" r="2.2" fill="white" opacity="0.9" />
      <rect x="22" y="65" width="4" height="13" rx="2" fill="#60a5fa" opacity="0.18" />
      <rect x="54" y="65" width="4" height="13" rx="2" fill="#60a5fa" opacity="0.18" />

      {/* Left arm */}
      <g transform={`rotate(${lArmR},19,64)`}>
        <rect x="2" y="60" width="18" height="9" rx="4.5" fill="#1e3a5f" />
        <rect x="2" y="60" width="18" height="4" rx="2" fill="#3b82f6" opacity="0.18" />
        <circle cx="2" cy="64.5" r="5.5" fill="#1e40af" />
        <circle cx="2" cy="64.5" r="3" fill="#60a5fa" opacity="0.8" />
      </g>

      {/* Right arm */}
      <g transform={`rotate(${rArmR},61,64)`}>
        <rect x="61" y="60" width="18" height="9" rx="4.5" fill="#1e3a5f" />
        <rect x="61" y="60" width="18" height="4" rx="2" fill="#3b82f6" opacity="0.18" />
        <circle cx="79" cy="64.5" r="5.5" fill="#1e40af" />
        <circle cx="79" cy="64.5" r="3" fill="#60a5fa" opacity="0.8" />
      </g>

      {/* Neck */}
      <rect x="32" y="49" width="16" height="10" rx="3.5" fill="#152b47" />
      {[35,40,45].map(x=>(
        <line key={x} x1={x} y1="50" x2={x} y2="58" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3"/>
      ))}

      {/* Head */}
      <rect x="13" y="12" width="54" height="40" rx="15" fill="#1e3a5f" />
      <rect x="13" y="12" width="54" height="16" rx="11" fill="#3b82f6" opacity="0.12" />

      {/* Visor */}
      <rect x="17" y="18" width="46" height="29" rx="11" fill="#0a1929" opacity="0.93" />
      <rect x="17" y="18" width="46" height="10" rx="7" fill="#60a5fa" opacity="0.07" />

      {/* Eyes */}
      {([30,50] as number[]).map((cx,i)=>(
        <g key={i} transform={`scale(${eyeScale})`} style={{ transformOrigin: `${cx}px ${eyeY}px` }}>
          <circle cx={cx} cy={eyeY} r="6" fill="#0ea5e9" opacity="0.15"/>
          <circle cx={cx} cy={eyeY} r="4.8" fill="#38bdf8" opacity={mood === 'idle' ? 0.6 : 1}/>
          <circle cx={cx} cy={eyeY} r="2.9" fill="white" opacity={mood === 'idle' ? 0.7 : 1}/>
          <circle cx={cx+1.2} cy={eyeY-1.2} r="1.1" fill="#0ea5e9"/>
          {(mood==='excited'||mood==='wave'||mood==='fly') && (
            <circle cx={cx} cy={eyeY} r="7" fill="#38bdf8"
              opacity={i===0?(frame===0?0.28:0.06):(frame===0?0.06:0.28)}/>
          )}
        </g>
      ))}

      {/* Mouth */}
      <path d={mouth} stroke="#38bdf8" strokeWidth="2.3" fill="none" strokeLinecap="round"
        opacity={mood === 'idle' ? 0.5 : 1}/>

      {/* Antenna */}
      <line x1="40" y1="12" x2="40" y2="3" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="40" cy="2.5" r="4.5" fill="#0ea5e9"/>
      <circle cx="40" cy="2.5" r="2.8"
        fill={mood === 'idle' ? (frame === 0 ? '#334155' : '#1e40af') : (frame===0?'#7dd3fc':'#38bdf8')}/>
      <circle cx="40" cy="2.5" r="1.3" fill="white" opacity="0.95"/>

      {/* Ears */}
      {([13,67] as number[]).map(cx=>(
        <g key={cx}>
          <circle cx={cx} cy="30" r="5" fill="#1e40af"/>
          <circle cx={cx} cy="30" r="2.8" fill="#60a5fa" opacity="0.85"/>
          <circle cx={cx} cy="30" r="1.1" fill="white" opacity="0.5"/>
        </g>
      ))}

      {/* ZZZ when idle */}
      {mood === 'idle' && frame === 0 && (
        <>
          <text x="58" y="20" fontSize="7" fill="#60a5fa" opacity="0.6" fontWeight="bold">z</text>
          <text x="63" y="14" fontSize="9" fill="#60a5fa" opacity="0.4" fontWeight="bold">z</text>
        </>
      )}
    </svg>
  );
}

// ─── Particle trail ────────────────────────────────────────────────
function FlyTrail({ active, x, y }: { active: boolean; x: number; y: number }) {
  const [particles, setParticles] = useState<{id:number;px:number;py:number;age:number}[]>([]);
  const posRef = useRef({ x, y });
  useEffect(() => { posRef.current = { x, y }; }, [x, y]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    let pid = 0;
    const id = setInterval(() => {
      const { x: cx, y: cy } = posRef.current;
      setParticles(prev => [
        ...prev.filter(p => p.age < 16).map(p => ({ ...p, age: p.age + 1 })),
        { id: pid++, px: cx + 36 + (Math.random()-0.5)*18, py: cy + 90 + Math.random()*8, age: 0 },
      ]);
    }, 38);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9996 }}>
      {particles.map(p => {
        const size = Math.max(2, 9 - p.age * 0.5);
        const color = p.age < 5 ? '#38bdf8' : p.age < 10 ? '#60a5fa' : '#bfdbfe';
        return (
          <div key={p.id} style={{
            position:'absolute', left: p.px, top: p.py + p.age * 2.5,
            width: size, height: size, borderRadius:'50%', background: color,
            opacity: Math.max(0, 1 - p.age/16),
            transform:'translate(-50%,-50%)',
          }}/>
        );
      })}
    </div>
  );
}

// ─── Standby mini robot (after tour done) ─────────────────────────
function StandbyRobot({ lang, onReopen }: { lang: Lang; onReopen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [bob, setBob] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setBob(b => !b), 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowTip(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'fixed', bottom: '7rem', right: '1.2rem',
        zIndex: 9995, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px',
      }}
    >
      {/* Tooltip */}
      {showTip && (
        <div style={{
          background: 'var(--surface)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '7px 12px',
          fontSize: '11.5px',
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.96)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          pointerEvents: 'none',
        }}>
          {lang === 'id' ? '🗺️ Recap tur?' : '🗺️ Recap tour?'}
        </div>
      )}

      {/* Mini robot button */}
      <div
        onClick={onReopen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: 'pointer',
          transform: `translateY(${bob ? '-5px' : '0px'}) scale(${hovered ? 1.08 : 1})`,
          transition: 'transform 1.1s cubic-bezier(0.45,0,0.55,1)',
          filter: hovered ? 'drop-shadow(0 8px 20px rgba(0,122,255,0.55))' : 'none',
        }}
        title={lang === 'id' ? 'Buka tur lagi' : 'Reopen tour'}
      >
        <RobotSVG mood={hovered ? 'wave' : 'idle'} size={52} />
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────
export default function TourGuide() {
  const [phase, setPhase] = useState<Phase>('hidden');
  const [lang, setLang] = useState<Lang>('id');
  const [step, setStep] = useState(0);
  const [flying, setFlying] = useState(false);
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [robotVisible, setRobotVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [bob, setBob] = useState(false);
  const [spotlightSel, setSpotlightSel] = useState<string | undefined>(undefined);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (phase !== 'tour') return;
    const id = setInterval(() => setBob(b => !b), 1700);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) {
      setPhase('standby');
      return;
    }
    const t = setTimeout(() => {
      setPhase('intro');
      setTimeout(() => setIntroVisible(true), 60);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  const getCenter = useCallback((sel: string) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  const flyToStep = useCallback((idx: number, from: { x: number; y: number }) => {
    const s = STEPS[idx];
    setBubbleVisible(false);
    setSpotlightSel(undefined);

    // Scroll page to relevant section first
    if (s.scrollToSection) {
      const section = document.getElementById(s.scrollToSection);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (s.targetSelector) {
      // Wait a tick for scroll to start, then get position
      const doFly = () => {
        const dest = getCenter(s.targetSelector!);
        if (dest) {
          const landX = dest.x - 36;
          const landY =
            s.bubbleDir === 'top' ? dest.y - 136 :
            s.bubbleDir === 'bottom' ? dest.y + 20 :
            dest.y - 50;

          setFlying(true);
          setRobotPos(from);
          requestAnimationFrame(() => requestAnimationFrame(() => setRobotPos({ x: landX, y: landY })));

          setTimeout(() => {
            posRef.current = { x: landX, y: landY };
            setFlying(false);
            // Show spotlight on target
            setSpotlightSel(s.highlightSelector);
            setTimeout(() => setBubbleVisible(true), 140);
          }, 740);
          return;
        }
        // fallback: no element found, just show bubble
        posRef.current = from;
        setRobotPos(from);
        setTimeout(() => setBubbleVisible(true), 200);
      };

      if (s.scrollToSection) {
        setTimeout(doFly, 380); // give scroll a head-start
      } else {
        doFly();
      }
      return;
    }

    // No target — stay put
    posRef.current = from;
    setRobotPos(from);
    setTimeout(() => setBubbleVisible(true), 200);
  }, [getCenter]);

  const beginTour = useCallback((l: Lang) => {
    setLang(l);
    const startX = window.innerWidth - 110;
    const startY = window.innerHeight - 170;
    posRef.current = { x: startX, y: startY };
    setRobotPos({ x: startX, y: startY });

    setIntroVisible(false);
    setTimeout(() => {
      setPhase('tour');
      setStep(0);
      setRobotVisible(true);
      setTimeout(() => setBubbleVisible(true), 360);
    }, 360);
  }, []);

  const goNext = useCallback(() => {
    const next = step + 1;
    if (next >= STEPS.length) {
      setBubbleVisible(false);
      setSpotlightSel(undefined);
      setTimeout(() => {
        setRobotVisible(false);
        // Fly off screen then go standby
        setRobotPos({ x: window.innerWidth + 150, y: -150 });
        setTimeout(() => setPhase('standby'), 800);
      }, 300);
      localStorage.setItem(TOUR_KEY, '1');
      return;
    }
    setStep(next);
    flyToStep(next, posRef.current);
  }, [step, flyToStep]);

  const goPrev = useCallback(() => {
    if (step <= 0) return;
    const prev = step - 1;
    setStep(prev);
    flyToStep(prev, posRef.current);
  }, [step, flyToStep]);

  const dismiss = useCallback(() => {
    setIntroVisible(false);
    setBubbleVisible(false);
    setSpotlightSel(undefined);
    setTimeout(() => {
      setRobotPos({ x: window.innerWidth + 150, y: -150 });
      setTimeout(() => { setRobotVisible(false); setPhase('standby'); }, 750);
    }, 280);
    localStorage.setItem(TOUR_KEY, '1');
  }, []);

  const reopenTour = useCallback(() => {
    setStep(0);
    setSpotlightSel(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const startX = window.innerWidth - 110;
    const startY = window.innerHeight - 170;
    posRef.current = { x: startX, y: startY };
    setRobotPos({ x: startX, y: startY });
    setRobotVisible(true);
    setPhase('tour');
    setTimeout(() => setBubbleVisible(true), 400);
  }, []);

  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Bubble positioning relative to robot
  const bubblePos: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: '262px',
      opacity: bubbleVisible ? 1 : 0,
      transition: 'opacity 0.28s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1)',
      pointerEvents: bubbleVisible ? 'auto' : 'none',
      zIndex: 10001,
    };
    const inV = bubbleVisible;
    switch (cur?.bubbleDir) {
      case 'top':    return { ...base, bottom: '108%', left: '50%', transform: `translateX(-50%) ${inV ? 'scale(1)' : 'scale(0.94) translateY(6px)'}`, transformOrigin: 'bottom center' };
      case 'bottom': return { ...base, top: '108%',   left: '50%', transform: `translateX(-50%) ${inV ? 'scale(1)' : 'scale(0.94) translateY(-6px)'}`, transformOrigin: 'top center' };
      case 'left':   return { ...base, right: '108%', top: '0',    transform: inV ? 'scale(1)' : 'scale(0.94) translateX(6px)',  transformOrigin: 'right center' };
      default:       return { ...base, left: '108%',  top: '0',    transform: inV ? 'scale(1)' : 'scale(0.94) translateX(-6px)', transformOrigin: 'left center' };
    }
  })();

  return (
    <>
      {/* ── INTRO OVERLAY ─────────────────────────────────── */}
      {phase === 'intro' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: introVisible ? 1 : 0,
          transition: 'opacity 0.45s ease',
        }}>
          <div style={{
            background: 'rgba(15,25,45,0.88)',
            border: '1px solid rgba(96,165,250,0.2)',
            borderRadius: '28px',
            padding: '36px 32px 28px',
            textAlign: 'center',
            maxWidth: '360px',
            width: 'calc(100vw - 48px)',
            transform: introVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
            transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
            position: 'relative',
            boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(96,165,250,0.08)',
          }}>
            <button onClick={dismiss} style={{
              position: 'absolute', top: '14px', right: '14px',
              background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', borderRadius: '50%',
              width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><X size={14}/></button>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px', animation: 'roboFloat 2.2s ease-in-out infinite' }}>
              <RobotSVG mood="wave" size={72} />
            </div>

            <h2 style={{ fontSize: '21px', fontWeight: 700, color: 'white', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
              Halo! / Hello! 👋
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.52)', margin: '0 0 26px', lineHeight: 1.65 }}>
              Aku RoboGuide — pemandu virtual portofolio ini.<br/>
              I'm RoboGuide — your virtual portfolio guide.
            </p>

            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Pilih bahasa / Choose language
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              {([
                { l: 'id' as Lang, flag: '🇮🇩', label: 'Bahasa Indonesia', sub: 'Pakai bahasa Indo!' },
                { l: 'en' as Lang, flag: '🇬🇧', label: 'English', sub: 'Tour in English!' },
              ]).map(({ l, flag, label, sub }) => (
                <button key={l} onClick={() => beginTour(l)} style={{
                  flex: 1, padding: '12px 8px', borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.11)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white', cursor: 'pointer',
                  transition: 'all 0.2s ease', textAlign: 'center',
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget;
                  b.style.background = 'rgba(0,122,255,0.32)';
                  b.style.borderColor = 'rgba(0,122,255,0.55)';
                  b.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget;
                  b.style.background = 'rgba(255,255,255,0.06)';
                  b.style.borderColor = 'rgba(255,255,255,0.11)';
                  b.style.transform = 'translateY(0)';
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{flag}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '10.5px', opacity: 0.45 }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SPOTLIGHT OVERLAY ─────────────────────────────── */}
      {phase === 'tour' && (
        <SpotlightOverlay targetSelector={spotlightSel} active={!!spotlightSel} />
      )}

      {/* ── FLYING ROBOT + BUBBLE ─────────────────────────── */}
      {(phase === 'tour') && (
        <>
          <FlyTrail active={flying} x={robotPos.x} y={robotPos.y}/>

          <div style={{
            position: 'fixed',
            left: robotPos.x,
            top: robotPos.y,
            zIndex: 10002,
            opacity: robotVisible ? 1 : 0,
            transition: flying
              ? 'left 0.74s cubic-bezier(0.22,1,0.36,1), top 0.74s cubic-bezier(0.22,1,0.36,1), opacity 0.3s'
              : `left 0s, top 0s, opacity 0.3s ease, transform 1s cubic-bezier(0.45,0,0.55,1)`,
            transform: `translateY(${flying ? '-10px' : bob ? '-6px' : '0px'})`,
            pointerEvents: robotVisible ? 'auto' : 'none',
          }}>
            <div style={{ position: 'relative' }}>
              {/* Speech bubble */}
              <div style={bubblePos}>
                <div style={{
                  background: 'var(--surface)',
                  backdropFilter: 'blur(32px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  padding: '14px 14px 12px',
                  boxShadow: '0 8px 36px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,122,255,0.07)',
                  position: 'relative',
                }}>
                  <button onClick={dismiss} style={{
                    position: 'absolute', top: '9px', right: '9px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', display: 'flex',
                    alignItems: 'center', borderRadius: '50%',
                    width: '20px', height: '20px',
                  }}><X size={12}/></button>

                  {/* Step dots */}
                  <div style={{ display:'flex', gap:'4px', marginBottom:'9px' }}>
                    {STEPS.map((_,i) => (
                      <div key={i} style={{
                        width: i===step?'16px':'5px', height:'5px', borderRadius:'3px',
                        background: i===step?'var(--accent)':'var(--border)',
                        transition:'all 0.3s ease', flexShrink:0,
                      }}/>
                    ))}
                  </div>

                  <p style={{ fontSize:'12.5px', fontWeight:600, color:'var(--text-primary)', margin:'0 0 4px', paddingRight:'18px' }}>
                    {cur?.title[lang]}
                  </p>
                  <p style={{ fontSize:'12px', color:'var(--text-secondary)', margin:'0 0 12px', lineHeight:1.55 }}>
                    {cur?.desc[lang]}
                  </p>

                  <div style={{ display:'flex', gap:'7px' }}>
                    {step > 0 && (
                      <button onClick={goPrev} style={{
                        padding:'5px 9px', borderRadius:'9px',
                        border:'1px solid var(--border)', background:'transparent',
                        color:'var(--text-secondary)', fontSize:'11.5px', cursor:'pointer',
                        display:'flex', alignItems:'center', gap:'2px',
                      }}>
                        <ChevronLeft size={12}/>{lang==='id'?'Balik':'Back'}
                      </button>
                    )}
                    <button onClick={goNext} style={{
                      flex:1, padding:'6px 12px', borderRadius:'9px', border:'none',
                      background:'var(--accent)', color:'#fff', fontSize:'12px',
                      fontWeight:600, cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:'3px',
                    }}>
                      {isLast
                        ? (lang==='id'?'Siap! 🚀':"Let's go! 🚀")
                        : <>{lang==='id'?'Lanjut':'Next'}<ChevronRight size={12}/></>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Robot */}
              <div onClick={() => setBubbleVisible(v => !v)} style={{ cursor:'pointer', userSelect:'none' }}>
                <RobotSVG mood={flying ? 'fly' : (cur?.mood ?? 'wave')}/>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── STANDBY MINI ROBOT ────────────────────────────── */}
      {phase === 'standby' && (
        <StandbyRobot lang={lang} onReopen={reopenTour} />
      )}

      <style>{`
        @keyframes roboFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spotPulse {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.015); }
        }
      `}</style>
    </>
  );
}