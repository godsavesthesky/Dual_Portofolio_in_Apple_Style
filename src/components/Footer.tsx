import { Mail, Linkedin, Instagram } from 'lucide-react';
import { useProfile } from '../lib/useProfile';

interface FooterProps {
  onNavigate: (id: string) => void;
  onConnectClick: () => void;
  activeSide: 'design' | 'arch';
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.83 1.55V6.79a4.85 4.85 0 0 1-1.06-.1z" />
    </svg>
  );
}

const designLinks = [
  { id: 'home', label: 'Home' },
  { id: 'works', label: 'Works' },
  { id: 'videos', label: 'Videos' },
  { id: 'zines', label: 'Zines' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
];

const archLinks = [
  { id: 'home', label: 'Home' },
  { id: 'works', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
];

export default function Footer({ onNavigate, onConnectClick, activeSide }: FooterProps) {
  const { profile } = useProfile();
  const year = new Date().getFullYear();
  const links = activeSide === 'design' ? designLinks : archLinks;

  const socials: { href: string; icon: React.ReactNode; label: string }[] = [];
  if (profile?.linkedin)
    socials.push({ href: profile.linkedin, icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn' });
  if (profile?.instagram)
    socials.push({ href: profile.instagram, icon: <Instagram className="w-4 h-4" />, label: 'Instagram' });
  if (profile?.tiktok)
    socials.push({ href: profile.tiktok, icon: <TikTokIcon />, label: 'TikTok' });
  if (profile?.email)
    socials.push({ href: `mailto:${profile.email}`, icon: <Mail className="w-4 h-4" />, label: 'Email' });

  const displayName = profile?.name || 'Your Name';
  const tagline = profile?.tagline || 'Graphic Designer · Illustrator · Building Designer';

  return (
    <footer className="glass border-t border-[var(--border)] mt-16 mb-28 md:mb-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{displayName}</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tagline}</p>
            {socials.length > 0 && (
              <div className="flex items-center gap-3 mt-4">
                {socials.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('mailto') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:scale-110 transition-all duration-200"
                    aria-label={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">Quick Links</h4>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
              {links.map(link => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">Get In Touch</h4>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Have a project in mind?</p>
            <button
              onClick={onConnectClick}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Connect with me
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-secondary)]">© {year} {displayName}. All rights reserved.</p>
          <p className="text-xs text-[var(--text-secondary)]">Built with React + Vite</p>
        </div>
      </div>
    </footer>
  );
}