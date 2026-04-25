import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface MacGalleryProps {
  photos: string[];
  title?: string;
  /** Optional: show a PPT/embed button */
  pptLabel?: string;
  onPptClick?: () => void;
}

export default function MacGallery({ photos, title, pptLabel, onPptClick }: MacGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  };

  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevPhoto = useCallback(
    () => setLightbox(i => (i !== null ? (i - 1 + photos.length) % photos.length : null)),
    [photos.length]
  );
  const nextPhoto = useCallback(
    () => setLightbox(i => (i !== null ? (i + 1) % photos.length : null)),
    [photos.length]
  );

  // Keyboard navigation + body scroll lock while lightbox is open
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft' && photos.length > 1) prevPhoto();
      else if (e.key === 'ArrowRight' && photos.length > 1) nextPhoto();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, photos.length, closeLightbox, prevPhoto, nextPhoto]);

  if (!photos || photos.length === 0) return null;

  return (
    <>
      {/* macOS window shell */}
      <div className="glass rounded-2xl overflow-hidden shadow-xl mt-4">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)]">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#28CA41] shadow-sm" />
          {title && (
            <span className="flex-1 text-center text-xs font-medium text-[var(--text-secondary)] select-none">
              {title} — {photos.length} foto
            </span>
          )}
          {pptLabel && onPptClick && (
            <button
              onClick={onPptClick}
              className="text-[10px] font-medium px-2 py-1 rounded-md text-white transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)' }}
            >
              {pptLabel}
            </button>
          )}
        </div>

        {/* Gallery track */}
        <div className="relative p-3 select-none">
          {photos.length > 2 && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div
            ref={trackRef}
            className="flex gap-3 overflow-x-auto scroll-smooth pb-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {photos.map((url, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i)}
                className="flex-shrink-0 rounded-xl overflow-hidden border border-[var(--border)] hover:scale-[1.03] transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
                style={{ width: 220, height: 148 }}
                aria-label={`Foto ${i + 1}`}
              >
                <img
                  src={url}
                  alt={`foto ${i + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>

          {photos.length > 2 && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="max-w-4xl max-h-[85vh] px-16"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={photos[lightbox]}
              alt={`foto ${lightbox + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            {photos.length > 1 && (
              <p className="text-center text-white/50 text-xs mt-3">
                {lightbox + 1} / {photos.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}