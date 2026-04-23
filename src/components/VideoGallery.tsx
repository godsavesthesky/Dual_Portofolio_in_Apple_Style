import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, VolumeX, Volume2, Film } from 'lucide-react';

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

function VideoCard({ video }: { video: VideoItem }) {
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
      className={`flex-shrink-0 rounded-xl overflow-hidden border border-[var(--border)] transition-all hover:scale-[1.02] relative ${isPlaying ? 'video-card-playing' : ''}`}
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
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setMuted(!muted)}
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
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-xs font-medium text-white/90 truncate">{video.title}</p>
      </div>
    </div>
  );
}

export default function VideoGallery({ videos, title }: VideoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!videos || videos.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
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
          {videos.map(v => (
            <VideoCard key={v.id} video={v} />
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
  );
}
