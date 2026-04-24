import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, Pause, VolumeX, Volume2, Film, X } from 'lucide-react';

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

/* ═══════════════════════════════════════════════════════════════
 *  VIDEO CARD (preview kecil di track)
 * ═══════════════════════════════════════════════════════════════ */
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
            <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 duration-200 shadow-lg">
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

      {/* Top badge */}
      <div className="absolute top-2 left-2 flex gap-1.5">
        {video.video_type && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-white/90 bg-black/40 backdrop-blur-md">
            {video.video_type}
          </span>
        )}
      </div>
      {/* Bottom title */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
        <p className="text-xs font-medium text-white/90 truncate">{video.title}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  LIGHTBOX (macOS-style fullscreen viewer)
 *  Rendered via portal → escapes all stacking contexts
 * ═══════════════════════════════════════════════════════════════ */
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
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0..1
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

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
        togglePlay();
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

  // Reset on video change
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().then(() => setPlaying(true)).catch(() => {});
  }, [index]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().then(() => setPlaying(true)).catch(() => {}); }
    else { v.pause(); setPlaying(false); }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime / v.duration);
    setCurrentTime(v.currentTime);
  };

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) setDuration(v.duration);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = Math.max(0, Math.min(1, ratio)) * v.duration;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return createPortal(
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483000, // absurdly high — beats everything including TourGuide
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-all"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div
        className="text-white/80 text-xs font-medium"
        style={{
          position: 'absolute',
          top: '24px',
          left: '20px',
          padding: '6px 12px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {index + 1} of {videos.length}
      </div>

      {/* Prev button */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(index - 1)}
          className="flex items-center justify-center text-white/90 hover:text-white transition-all"
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={() => onNavigate(index + 1)}
          className="flex items-center justify-center text-white/90 hover:text-white transition-all"
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Video frame */}
      <div
        style={{
          position: 'relative',
          transform: mounted ? 'scale(1)' : 'scale(0.92)',
          transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
          background: '#000',
          aspectRatio: '9 / 16',
          height: 'min(82dvh, 820px)',
          maxWidth: '92vw',
        }}
      >
        {current.video_url ? (
          <video
            ref={videoRef}
            key={current.id}
            src={current.video_url}
            poster={current.thumbnail_url ?? undefined}
            muted={muted}
            loop
            playsInline
            autoPlay
            onClick={togglePlay}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              cursor: 'pointer',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px',
            }}
          >
            Video tidak tersedia.
          </div>
        )}

        {/* TOP badge — type */}
        {current.video_type && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.95)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {current.video_type}
          </div>
        )}

        {/* Center Play button (when paused) */}
        {!playing && current.video_url && (
          <button
            onClick={togglePlay}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '72px',
              height: '72px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
            aria-label="Play"
          >
            <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
          </button>
        )}

        {/* BOTTOM bar — custom macOS-style controls */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px 14px 14px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 20%, transparent)',
            pointerEvents: 'none',
          }}
        >
          {/* Title */}
          <p
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: '13px',
              fontWeight: 600,
              margin: '0 0 10px',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {current.title}
          </p>

          {/* Progress bar */}
          <div
            onClick={seek}
            style={{
              height: '4px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.25)',
              overflow: 'hidden',
              cursor: 'pointer',
              marginBottom: '8px',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: 'rgba(255,255,255,0.95)',
                transition: 'width 0.1s linear',
              }}
            />
          </div>

          {/* Controls row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={togglePlay}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                {playing ? <Pause className="w-3.5 h-3.5" fill="currentColor" /> : <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />}
              </button>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(currentTime)} / {fmt(duration)}
              </span>
            </div>
            <button
              onClick={() => setMuted(m => !m)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  GALLERY (track + lightbox host)
 * ═══════════════════════════════════════════════════════════════ */
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

      {/* Lightbox (rendered via portal → document.body) */}
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