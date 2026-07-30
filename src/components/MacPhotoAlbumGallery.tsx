import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────── */
export interface PhotoAlbumEntry {
  id: string;
  title: string;
  photo_url?: string | null;
  photos?: string[] | null;
  description?: string | null;
  year?: number | null;
  sub_type?: string | null;
}

interface Props {
  entries: PhotoAlbumEntry[];
  windowTitle?: string;
}

function getUrls(entry: PhotoAlbumEntry): string[] {
  if (entry.photos?.length) return entry.photos;
  if (entry.photo_url) return [entry.photo_url];
  return [];
}

/* ─── Lightbox ──────────────────────────────────────────────────────── */
function Lightbox({
  entry,
  onClose,
}: {
  entry: PhotoAlbumEntry;
  onClose: () => void;
}) {
  const urls = getUrls(entry);
  const [idx, setIdx] = useState(0);

  const prev = useCallback(() => setIdx(i => (i - 1 + urls.length) % urls.length), [urls.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % urls.length), [urls.length]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', h);
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  if (!urls.length) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
      {/* macOS window */}
      <div
        className="relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--glass-bg, rgba(28,28,30,0.95))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] cursor-pointer" onClick={onClose} />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <span className="w-3 h-3 rounded-full bg-[#28CA41]" />
          <div className="flex-1 text-center">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {entry.title}
              {urls.length > 1 ? ` — ${idx + 1}/${urls.length}` : ''}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full glass flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Photo */}
        <div className="bg-black flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
          <img
            key={urls[idx]}
            src={urls[idx]}
            alt={`${entry.title} ${idx + 1}`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Nav arrows */}
        {urls.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Description */}
        {entry.description && (
          <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {entry.description}
            </p>
          </div>
        )}

        {/* iOS-style thumbnail strip */}
        {urls.length > 1 && (
          <div
            className="flex items-center gap-2 px-4 py-3 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex gap-2 flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {urls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    i === idx
                      ? 'border-[var(--accent)] scale-105'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                  style={{ width: 72, height: 48 }}
                >
                  <img src={url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ─── iOS Photos-style album tile ──────────────────────────────────── */
function AlbumTile({
  entry,
  onClick,
}: {
  entry: PhotoAlbumEntry;
  onClick: () => void;
}) {
  const urls = getUrls(entry);
  if (!urls.length) return null;

  const count = urls.length;
  const previews = urls.slice(0, Math.min(4, count));

  return (
    <button
      onClick={onClick}
      className="group text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      {/* Thumbnail grid — iOS Photos style */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ aspectRatio: '1/1', background: '#111' }}
      >
        {count === 1 ? (
          <img src={urls[0]} alt={entry.title} className="w-full h-full object-cover" />
        ) : count === 2 ? (
          <div className="grid grid-cols-2 h-full gap-px">
            {previews.map((url, i) => (
              <img key={i} src={url} alt="" className="w-full h-full object-cover" />
            ))}
          </div>
        ) : count === 3 ? (
          <div className="grid h-full gap-px" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <img src={previews[0]} alt="" className="w-full h-full object-cover row-span-2" />
            <img src={previews[1]} alt="" className="w-full h-full object-cover" />
            <img src={previews[2]} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-px">
            {previews.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="w-full h-full object-cover" />
                {i === 3 && count > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-base font-bold">+{count - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-200">
          <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 shadow-xl">
            <Camera className="w-5 h-5 text-black" />
          </div>
        </div>

        {/* Count pill — only if multiple */}
        {count > 1 && (
          <div
            className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          >
            <Camera className="w-2.5 h-2.5" />
            {count}
          </div>
        )}
      </div>

      {/* Label below tile — iOS Photos style */}
      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {entry.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {[entry.sub_type, entry.year?.toString()].filter(Boolean).join(' · ')}
        </p>
      </div>
    </button>
  );
}

/* ─── Main export ───────────────────────────────────────────────────── */
export default function MacPhotoAlbumGallery({ entries, windowTitle }: Props) {
  const [selected, setSelected] = useState<PhotoAlbumEntry | null>(null);

  const validEntries = entries.filter(e => getUrls(e).length > 0);

  if (validEntries.length === 0) return null;

  const fileCount = validEntries.reduce((sum, e) => sum + getUrls(e).length, 0);

  return (
    <>
      {/* macOS window shell */}
      <div className="glass rounded-2xl overflow-hidden shadow-2xl">
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#28CA41] shadow-sm" />
          <span
            className="flex-1 text-center text-xs font-medium select-none"
            style={{ color: 'var(--text-secondary)' }}
          >
            {windowTitle ?? 'Photos'} — {fileCount} photo{fileCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* iOS Photos album grid inside window */}
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {validEntries.map(entry => (
              <AlbumTile
                key={entry.id}
                entry={entry}
                onClick={() => setSelected(entry)}
              />
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <Lightbox entry={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
