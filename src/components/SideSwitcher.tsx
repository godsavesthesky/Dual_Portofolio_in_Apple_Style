import { Palette, Building } from 'lucide-react';

interface SideSwitcherProps {
  activeSide: 'design' | 'arch';
  onSwitch: (side: 'design' | 'arch') => void;
}

const sides = [
  { key: 'design' as const, icon: Palette, label: 'Design & Illustration' },
  { key: 'arch' as const, icon: Building, label: 'Architecture' },
];

export default function SideSwitcher({ activeSide, onSwitch }: SideSwitcherProps) {
  return (
    <div className="fixed top-[68px] left-1/2 -translate-x-1/2 z-30 md:top-5">
      <div
        className="flex items-center gap-1 p-1 rounded-2xl glass-heavy shadow-xl"
        style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.15)' }}
      >
        {sides.map(side => {
          const active = activeSide === side.key;
          return (
            <button
              key={side.key}
              onClick={() => onSwitch(side.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold
                transition-all duration-300 whitespace-nowrap
                ${active
                  ? 'text-white shadow-md scale-[1.02]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
                }
              `}
              style={active ? { background: 'var(--accent)' } : undefined}
            >
              <side.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{side.label}</span>
              <span className="sm:hidden">{side.key === 'design' ? 'Design' : 'Arch'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
