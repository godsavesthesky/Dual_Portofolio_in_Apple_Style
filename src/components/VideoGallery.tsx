import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, VolumeX, Volume2, Film, X } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  video_type: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
}

interface VideoGalleryProps {
  videos: VideoItem[];
  title?: string;
}

/* ───────────────────────────────────────────────────────────────
 *  VIDEO CARD (preview kecil di track)
 * ─────────────────────────────────────────────────────────────── */
function VideoCard({ video, onClick }: { video: VideoItem; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Autoplay when card enters viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        const vid = videoRef.current;
        if (!vid) return;
        if (entry.isIntersecting) {
          vid.play().catch(() => {});
          setIsPlaying(true);
        } else {
          vid.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`flex-shrink-0 rounded-xl overflow-hidden border border-[var(--border)] transition-all hover:scale-[1.02] relative cursor-pointer group ${isPlaying ? 'video-card-playing' : ''}`}
      style={{ width: 280, height: 200 }}
    >
      {video.video_url ? (
        <>
          <video
            ref={videoRef}
            src={video.video_url}
            poster={video.thumbnail_url ?? undefined}
            muted={muted}
            loop
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          />
          {/* Play icon overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-200">
              <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setMuted(!muted); }}
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </>
      ) : video.thumbnail_url ? (
        <div className="relative w-full h-full">
          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="w-10 h-10 text-white/80" />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))' }}>
          <Film className="w-8 h-8 text-[var(--text-secondary)] opacity-50" />
          <span className="text-xs text-[var(--text-secondary)] opacity-50">Video</span>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute top-2 left-2 flex gap-1.5">
        {video.video_type && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-white/90 bg-black/40 backdrop-blur-md">
            {video.video_type}
          </span>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
        <p className="text-xs font-medium text-white/90 truncate">{video.title}</p>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
 *  LIGHTBOX (iOS-style fullscreen viewer)
 * ─────────────────────────────────────────────────────────────── */
function VideoLightbox({
  videos,
  index,
  onClose,
  onNavigate,
}: {
  videos: VideoItem[];
  index: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const current = videos[index];
  const hasPrev = index > 0;
  const hasNext = index < videos.length - 1;

  // Mount animation
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && hasPrev) onNavigate(index - 1);
      else if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1);
      else if (e.key === ' ') {
        e.preventDefault();
        const v = videoRef.current;
        if (v) { v.paused ? v.play() : v.pause(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, hasPrev, hasNext, onClose, onNavigate]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Auto-play when video changes
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [index]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-8"
      style={{
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-white/20 hover:text-white transition-all z-20"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-xs font-medium z-20">
        {index + 1} / {videos.length}
      </div>

      {/* Prev button */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(index - 1)}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-white/20 hover:text-white transition-all z-20"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={() => onNavigate(index + 1)}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-white/20 hover:text-white transition-all z-20"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Video container */}
      <div
        className="relative flex flex-col items-center gap-4 max-h-full"
        style={{
          transform: mounted ? 'scale(1)' : 'scale(0.94)',
          transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {current.video_url ? (
          <video
            ref={videoRef}
            key={current.id} // force remount on change
            src={current.video_url}
            poster={current.thumbnail_url ?? undefined}
            muted={muted}
            loop
            playsInline
            controls
            autoPlay
            className="rounded-2xl shadow-2xl max-h-[78vh] w-auto"
            style={{
              aspectRatio: '9 / 16',
              maxWidth: 'min(420px, 88vw)',
              background: '#000',
            }}
          />
        ) : (
          <div className="rounded-2xl bg-black/40 p-10 text-white/70 text-sm">
            Video tidak tersedia.
          </div>
        )}

        {/* Info bar */}
        <div className="flex items-center justify-center gap-3 flex-wrap max-w-[90vw]">
          {current.video_type && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-white/90 bg-white/15">
              {current.video_type}
            </span>
          )}
          <p className="text-sm font-medium text-white/90 text-center">{current.title}</p>
          <button
            onClick={() => setMuted(m => !m)}
            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
 *  GALLERY (track + lightbox host)
 * ─────────────────────────────────────────────────────────────── */
export default function VideoGallery({ videos, title }: VideoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const close = useCallback(() => setOpenIdx(null), []);
  const navigate = useCallback((i: number) => setOpenIdx(i), []);

  if (!videos || videos.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
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
              {title} — {videos.length} videos
            </span>
          )}
        </div>

        {/* Video track */}
        <div className="relative p-3 select-none">
          {videos.length > 2 && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div
            ref={trackRef}
            className="flex gap-3 overflow-x-auto scroll-smooth pb-1 hide-scrollbar"
          >
            {videos.map((v, i) => (
              <VideoCard key={v.id} video={v} onClick={() => setOpenIdx(i)} />
            ))}
          </div>

          {videos.length > 2 && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {openIdx !== null && (
        <VideoLightbox
          videos={videos}
          index={openIdx}
          onClose={close}
          onNavigate={navigate}
        />
      )}
    </>
  );
}