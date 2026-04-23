import React from 'react';
import { Home, User, Briefcase, MessageCircle, Sun, Moon, PenTool, Film, BookOpen, Building, Ruler } from 'lucide-react';

interface DockProps {
  activeSection: string;
  onNavigate: (id: string) => void;
  onConnectClick: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeSide: 'design' | 'arch';
}

interface DockItemData {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const designItems: DockItemData[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" />, color: 'bg-gradient-to-br from-sky-400 to-blue-600' },
  { id: 'works', label: 'Works', icon: <PenTool className="w-6 h-6" />, color: 'bg-gradient-to-br from-rose-400 to-red-600' },
  { id: 'videos', label: 'Videos', icon: <Film className="w-6 h-6" />, color: 'bg-gradient-to-br from-violet-400 to-purple-600' },
  { id: 'zines', label: 'Zines', icon: <BookOpen className="w-6 h-6" />, color: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  { id: 'about', label: 'About', icon: <User className="w-6 h-6" />, color: 'bg-gradient-to-br from-emerald-400 to-teal-600' },
  { id: 'experience', label: 'Experience', icon: <Briefcase className="w-6 h-6" />, color: 'bg-gradient-to-br from-cyan-400 to-blue-500' },
];

const archItems: DockItemData[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" />, color: 'bg-gradient-to-br from-sky-400 to-blue-600' },
  { id: 'works', label: 'Projects', icon: <Building className="w-6 h-6" />, color: 'bg-gradient-to-br from-stone-400 to-stone-600' },
  { id: 'drawings', label: 'Drawings', icon: <Ruler className="w-6 h-6" />, color: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  { id: 'arch-videos', label: 'Videos', icon: <Film className="w-6 h-6" />, color: 'bg-gradient-to-br from-violet-400 to-purple-600' },
  { id: 'about', label: 'About', icon: <User className="w-6 h-6" />, color: 'bg-gradient-to-br from-emerald-400 to-teal-600' },
  { id: 'experience', label: 'Experience', icon: <Briefcase className="w-6 h-6" />, color: 'bg-gradient-to-br from-cyan-400 to-blue-500' },
];

export default function Dock({ activeSection, onNavigate, onConnectClick, theme, onToggleTheme, activeSide }: DockProps) {
  const items = activeSide === 'design' ? designItems : archItems;

  return (
    <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div
        className="flex items-end gap-2 px-4 py-3 rounded-2xl glass-heavy shadow-2xl"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' }}
      >
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="dock-item relative group"
            aria-label={item.label}
          >
            <span className="dock-label text-[var(--text-primary)]">{item.label}</span>
            <div className={`dock-icon text-white ${item.color} ${activeSection === item.id ? 'ring-2 ring-white/30 ring-offset-1 ring-offset-transparent' : ''}`}>
              {item.icon}
            </div>
            {activeSection === item.id && <span className="w-1 h-1 rounded-full bg-[var(--accent)] mt-0.5" />}
          </button>
        ))}

        <div className="w-px h-10 bg-[var(--border)] mx-1 self-center" />

        <button onClick={onConnectClick} className="dock-item relative group" aria-label="Connect">
          <span className="dock-label text-[var(--text-primary)]">Connect</span>
          <div className="dock-icon text-white bg-gradient-to-br from-[#0A84FF] to-[#005DC1]">
            <MessageCircle className="w-6 h-6" />
          </div>
        </button>

        <button onClick={onToggleTheme} className="dock-item relative group" aria-label="Toggle theme">
          <span className="dock-label text-[var(--text-primary)]">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          <div className="dock-icon text-white bg-gradient-to-br from-slate-500 to-slate-700">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </div>
        </button>
      </div>
    </div>
  );
}
