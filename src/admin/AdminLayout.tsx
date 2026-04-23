import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  User,
  PenTool,
  Film,
  BookOpen,
  Building,
  Ruler,
  Video,
  Briefcase,
  Tag,
  Download,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../hooks/useTheme';

const navGroups = [
  {
    label: 'General',
    items: [
      { to: '/admin/profile', label: 'Profile', icon: User },
      { to: '/admin/categories', label: 'Categories', icon: Tag },
      { to: '/admin/experience', label: 'Experience', icon: Briefcase },
      { to: '/admin/cv-downloads', label: 'CV Downloads', icon: Download },
    ],
  },
  {
    label: '🎨 Design',
    items: [
      { to: '/admin/design-works', label: 'Design Works', icon: PenTool },
      { to: '/admin/design-videos', label: 'Design Videos', icon: Film },
      { to: '/admin/zines', label: 'Zines', icon: BookOpen },
    ],
  },
  {
    label: '🏗️ Architecture',
    items: [
      { to: '/admin/arch-works', label: 'Arch Projects', icon: Building },
      { to: '/admin/drawings', label: 'Drawings', icon: Ruler },
      { to: '/admin/arch-videos', label: 'Arch Videos', icon: Video },
    ],
  },
];

export default function AdminLayout() {
  useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex">
      <aside className="w-60 shrink-0 border-r border-[var(--border)] glass-heavy min-h-screen flex flex-col">
        <div className="px-5 py-5 border-b border-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Admin</p>
          <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">Portfolio CMS</p>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                {group.label}
              </p>
              <div className="space-y-1 mt-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                        }`
                      }
                      style={({ isActive }) => isActive ? { background: 'var(--accent)' } : undefined}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border)] space-y-1">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors">
            <ExternalLink className="w-4 h-4" /> View site
          </a>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--surface)] transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}