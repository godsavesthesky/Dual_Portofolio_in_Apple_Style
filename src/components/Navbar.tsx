import { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
  onConnectClick: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeSide: 'design' | 'arch';
}

const designNav = [
  { id: 'home', label: 'Home' },
  { id: 'works', label: 'Works' },
  { id: 'videos', label: 'Videos' },
  { id: 'zines', label: 'Zines' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
];

const archNav = [
  { id: 'home', label: 'Home' },
  { id: 'works', label: 'Projects' },
  { id: 'drawings', label: 'Drawings' },
  { id: 'arch-videos', label: 'Videos' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
];

export default function Navbar({ activeSection, onNavigate, onConnectClick, theme, onToggleTheme, activeSide }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = activeSide === 'design' ? designNav : archNav;

  const handleNav = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <header className="md:hidden fixed top-0 inset-x-0 z-40">
      <nav className="glass-heavy border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-4 h-14">
          <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">Portfolio</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMenuOpen(v => !v)}
              data-tour="navbar-menu"
              className="w-8 h-8 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-[var(--border)] py-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { onConnectClick(); setMenuOpen(false); }}
              className="w-full text-left px-5 py-3 text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
            >
              Connect
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}