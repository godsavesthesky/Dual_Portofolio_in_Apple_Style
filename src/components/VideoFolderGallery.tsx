import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Play, Film, VolumeX, Volume2 } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  sort_order: number;
}

interface VideoProject {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  year: number | null;
  items: VideoItem[];
}

interface Props {
  projects: VideoProject[];
}

/* ═══ VIDEO PLAYER MODAL ═══ */
function VideoModal({
  project,
  startIndex,
  onClose,
}: {
  project: VideoProject;
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const items = project.items.filter(v => v.video_url);
  const item = items[current];

  const prev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent(c => Math.min(items.length - 1, c + 1)), [items.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  // Reset + play saat ganti video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
  }, [current]);

  if (!item) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden"
        style={{ background: 'var(--glass-bg)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <div>
            <p className="text-xs text-[var(--text-secondary)]">{project.title}</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
          </div>
          <div className="flex items-center gap-3">
            {items.length > 1 && (
              <span className="text-xs text-[var(--text-secondary)]">{current + 1} / {items.length}</span>
            )}
            <button
              onClick={() => setMuted(m => !m)}
              className="w-8 h-8 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video */}
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            key={item.id}
            src={item.video_url!}
            poster={item.thumbnail_url ?? undefined}
            controls
            autoPlay
            muted={muted}
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Nav arrows + thumbnails jika multiple */}
        {items.length > 1 && (
          <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border)] overflow-x-auto">
            <button
              onClick={prev}
              disabled={current === 0}
              className="shrink-0 w-8 h-8 rounded-full glass flex items-center justify-center disabled:opacity-30 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-2 flex-1 overflow-x-auto">
              {items.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setCurrent(i)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === current ? 'border-[var(--accent)] scale-105' : 'border-transparent opacity-60 hover:opacity-80'}`}
                  style={{ width: 72, height: 48 }}
                >
                  {v.thumbnail_url ? (
                    <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                  ) : (
                    <video src={v.video_url!} className="w-full h-full object-cover pointer-events-none" muted preload="metadata" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={next}
              disabled={current === items.length - 1}
              className="shrink-0 w-8 h-8 rounded-full glass flex items-center justify-center disabled:opacity-30 hover:opacity-70 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ═══ FOLDER CARD ═══ */
function FolderCard({ project, onClick }: { project: VideoProject; onClick: () => void }) {
  const hasVideos = project.items.some(v => v.video_url);
  const previewItems = project.items.filter(v => v.video_url).slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="group text-left w-full rounded-2xl overflow-hidden border border-[var(--border)] transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:border-[var(--accent)]/40 glass"
    >
      {/* Folder preview area */}
      <div
        className="relative overflow-hidden"
        style={{ height: 160, background: 'linear-gradient(135deg, var(--glass-bg), rgba(0,0,0,0.2))' }}
      >
        {/* macOS-ish stacked video thumbnails */}
        {hasVideos ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 p-4">
            {previewItems.map((item, i) => (
              <div
                key={item.id}
                className="rounded-lg overflow-hidden shadow-lg border border-white/10"
                style={{
                  width: previewItems.length === 1 ? 180 : previewItems.length === 2 ? 120 : 90,
                  height: previewItems.length === 1 ? 100 : 70,
                  transform: `rotate(${(i - Math.floor(previewItems.length / 2)) * 4}deg) translateY(${i % 2 === 0 ? -4 : 4}px)`,
                  zIndex: i,
                  flexShrink: 0,
                }}
              >
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video
                    src={item.video_url!}
                    className="w-full h-full object-cover pointer-events-none"
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}
              </div>
            ))}
          </div>
        ) : project.cover_url ? (
          <img src={project.cover_url} alt={project.title} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="w-10 h-10 text-[var(--text-secondary)] opacity-40" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 duration-200 shadow-lg">
            <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Video count badge */}
        {project.items.length > 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
            style={{ background: 'var(--accent)' }}>
            {project.items.length} video
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-3 border-t border-[var(--border)]">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{project.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {project.year && (
            <span className="text-xs text-[var(--text-secondary)]">{project.year}</span>
          )}
          {project.description && (
            <span className="text-xs text-[var(--text-secondary)] truncate opacity-70">{project.description}</span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ═══ MAIN EXPORT ═══ */
export default function VideoFolderGallery({ projects }: Props) {
  const [openProject, setOpenProject] = useState<VideoProject | null>(null);

  if (projects.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {projects.map(proj => (
          <FolderCard
            key={proj.id}
            project={proj}
            onClick={() => {
              if (proj.items.some(v => v.video_url)) setOpenProject(proj);
            }}
          />
        ))}
      </div>

      {openProject && (
        <VideoModal
          project={openProject}
          startIndex={0}
          onClose={() => setOpenProject(null)}
        />
      )}
    </>
  );
}