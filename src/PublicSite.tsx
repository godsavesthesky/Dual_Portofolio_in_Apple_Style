import { useState, useEffect, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import Navbar from './components/Navbar';
import Dock from './components/Dock';
import Footer from './components/Footer';
import SideSwitcher from './components/SideSwitcher';
import ConnectModal from './components/ConnectModal';

import Home from './sections/Home';
import About from './sections/About';
import ExperienceSection from './sections/Experience';

// Design side
import DesignWorks from './sections/DesignWorks';
import DesignVideos from './sections/DesignVideos';
import Zines from './sections/Zines';

// Architecture side
import ArchWorks from './sections/ArchWorks';
import Drawings from './sections/Drawings';
import ArchVideos from './sections/ArchVideos';

const DESIGN_SECTIONS = ['home', 'works', 'videos', 'zines', 'about', 'experience'];
const ARCH_SECTIONS = ['home', 'works', 'drawings', 'arch-videos', 'about', 'experience'];

export default function PublicSite() {
  const { theme, toggleTheme } = useTheme();
  const [activeSide, setActiveSide] = useState<'design' | 'arch'>('design');
  const [activeSection, setActiveSection] = useState('home');
  const [connectOpen, setConnectOpen] = useState(false);

  const sections = activeSide === 'design' ? DESIGN_SECTIONS : ARCH_SECTIONS;

  // Intersection observers for active section tracking
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    // Small delay to let DOM update after side switch
    const timer = setTimeout(() => {
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          },
          { threshold: 0.35 }
        );
        observer.observe(el);
        observers.push(observer);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observers.forEach(o => o.disconnect());
    };
  }, [sections, activeSide]);

  const handleNavigate = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSwitchSide = useCallback((side: 'design' | 'arch') => {
    if (side === activeSide) return;
    setActiveSide(side);
    setActiveSection('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSide]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Mobile nav */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onConnectClick={() => setConnectOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeSide={activeSide}
      />

      {/* Prominent side switcher */}
      <SideSwitcher activeSide={activeSide} onSwitch={handleSwitchSide} />

      {/* Main content — key forces remount on side switch for fresh animations */}
      <main className="pt-14 md:pt-0" key={activeSide}>
        <div className="side-enter">
          <Home activeSide={activeSide} />

          {activeSide === 'design' ? (
            <>
              <DesignWorks />
              <DesignVideos />
              <Zines />
            </>
          ) : (
            <>
              <ArchWorks />
              <Drawings />
              <ArchVideos />
            </>
          )}

          <About />
          <ExperienceSection />
        </div>
      </main>

      <Footer
        onNavigate={handleNavigate}
        onConnectClick={() => setConnectOpen(true)}
        activeSide={activeSide}
      />

      {/* macOS Dock — desktop only */}
      <Dock
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onConnectClick={() => setConnectOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeSide={activeSide}
      />

      <ConnectModal isOpen={connectOpen} onClose={() => setConnectOpen(false)} />
    </div>
  );
}
