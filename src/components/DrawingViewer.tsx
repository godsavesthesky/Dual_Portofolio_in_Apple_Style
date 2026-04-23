import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Ruler } from 'lucide-react';

interface DrawingItem {
  id: string;
  title: string;
  drawing_type: string | null;
  project_name: string | null;
  image_url: string | null;
  photos: string[] | null;
}

interface DrawingViewerProps {
  drawings: DrawingItem[];
  title?: string;
}

export default function DrawingViewer({ drawings, title }: DrawingViewerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{ drawing: DrawingItem; photoIdx: number } | null>(null);

  if (!drawings || drawings.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  const openLightbox = (drawing: DrawingItem, idx: number) => setLightbox({ drawing, photoIdx: idx });
  const closeLightbox = () => setLightbox(null);

  // Get all images for a drawing (main + photos array)
  const getImages = (d: DrawingItem): string[] => {
    const imgs: string[] = [];
    if (d.image_url) imgs.push(d.image_url);
    if (d.photos) imgs.push(...d.photos);
    return imgs;
  };

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden shadow-2xl">
        {/* macOS title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)]">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#28CA41] shadow-sm" />
          {title && (
            <span className="flex-1 text-center text-xs font-medium text-[var(--text-secondary)] select-none">
              {title} — {drawings.length} drawings
            </span>
          )}
        </div>

        {/* Drawing cards */}
        <div className="relative p-3 select-none">
          {drawings.length > 2 && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div ref={trackRef} className="flex gap-3 overflow-x-auto scroll-smooth pb-1 hide-scrollbar">
            {drawings.map((d, i) => (
              <button
                key={d.id}
                onClick={() => openLightbox(d, 0)}
                className="flex-shrink-0 rounded-xl overflow-hidden border border-[var(--border)] hover:scale-[1.02] transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60 relative group"
                style={{ width: 300, height: 200 }}
              >
                {d.image_url ? (
                  <img src={d.image_url} alt={d.title} className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, rgba(120,113,108,0.15), rgba(168,162,158,0.1))' }}>
                    <Ruler className="w-8 h-8 text-[var(--text-secondary)] opacity-40" />
                    <span className="text-xs text-[var(--text-secondary)] opacity-50">Drawing</span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
                </div>

                {/* Info overlay */}
                <div className="absolute top-2 left-2">
                  {d.drawing_type && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-white/90 bg-black/40 backdrop-blur-md">
                      {d.drawing_type}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-xs font-medium text-white/90 truncate">{d.title}</p>
                  {d.project_name && <p className="text-[10px] text-white/60 truncate">{d.project_name}</p>}
                </div>
              </button>
            ))}
          </div>

          {drawings.length > 2 && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (() => {
        const imgs = getImages(lightbox.drawing);
        const idx = lightbox.photoIdx;
        const src = imgs[idx];

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {imgs.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setLightbox({ ...lightbox, photoIdx: (idx - 1 + imgs.length) % imgs.length }); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setLightbox({ ...lightbox, photoIdx: (idx + 1) % imgs.length }); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="max-w-5xl max-h-[85vh] px-16" onClick={e => e.stopPropagation()}>
              {src ? (
                <img src={src} alt={lightbox.drawing.title} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
              ) : (
                <div className="w-[600px] h-[400px] rounded-2xl flex items-center justify-center glass">
                  <Ruler className="w-12 h-12 text-[var(--text-secondary)] opacity-40" />
                </div>
              )}
              <div className="text-center mt-3">
                <p className="text-white text-sm font-medium">{lightbox.drawing.title}</p>
                {lightbox.drawing.project_name && (
                  <p className="text-white/50 text-xs mt-0.5">{lightbox.drawing.drawing_type} — {lightbox.drawing.project_name}</p>
                )}
                {imgs.length > 1 && (
                  <p className="text-white/40 text-xs mt-1">{idx + 1} / {imgs.length}</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
