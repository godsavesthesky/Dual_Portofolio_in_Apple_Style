import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Play, Film, VolumeX, Volume2 } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────── */
export interface VideoEntry {
  id: string;
  title: string;
  video_url?: string | null;
  videos?: string[] | null;
  thumbnail_url?: string | null;
  description?: string | null;
  year?: number | null;
  video_type?: string | null;
}

interface Props {
  entries: VideoEntry[];
  windowTitle?: string;
}

/* ─── Lightbox ──────────────────────────────────────────────────────── */
function Lightbox({
  entry,
  onClose,
}: {
  entry: VideoEntry;
  onClose: () => void;
}) {
  const urls = entry.videos?.length
    ? entry.videos
    : entry.video_url
    ? [entry.video_url]
    : [];

  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setIdx(i => Math.min(urls.length - 1, i + 1)),
    [urls.length]
  );

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, prev, next]);

  useEffect(() => {
    videoRef.current?.load();
    videoRef.current?.play().catch(() => {});
  }, [idx]);

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
            onClick={() => setMuted(m => !m)}
            className="w-7 h-7 rounded-full glass flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full glass flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Video */}
        <div className="bg-black" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            key={urls[idx]}
            src={urls[idx]}
            poster={idx === 0 ? (entry.thumbnail_url ?? undefined) : undefined}
            controls
            autoPlay
            muted={muted}
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* iOS-style thumbnail strip */}
        {urls.length > 1 && (
          <div
            className="flex items-center gap-2 px-4 py-3 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              onClick={prev}
              disabled={idx === 0}
              className="shrink-0 w-8 h-8 rounded-full glass flex items-center justify-center disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
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
                  <video
                    src={url}
                    className="w-full h-full object-cover pointer-events-none"
                    muted
                    playsInline
                  />
                </button>
              ))}
            </div>
            <button
              onClick={next}
              disabled={idx === urls.length - 1}
              className="shrink-0 w-8 h-8 rounded-full glass flex items-center justify-center disabled:opacity-30"
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

/* ─── iOS Photos-style album tile ──────────────────────────────────── */
function AlbumTile({
  entry,
  onClick,
}: {
  entry: VideoEntry;
  onClick: () => void;
}) {
  const urls = entry.videos?.length
    ? entry.videos
    : entry.video_url
    ? [entry.video_url]
    : [];

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
          /* Single: full bleed */
          <video
            src={urls[0]}
            poster={entry.thumbnail_url ?? undefined}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        ) : count === 2 ? (
          /* Two: side by side */
          <div className="grid grid-cols-2 h-full gap-px">
            {previews.map((url, i) => (
              <video key={i} src={url} className="w-full h-full object-cover" muted playsInline />
            ))}
          </div>
        ) : count === 3 ? (
          /* Three: big left + two stacked right */
          <div className="grid h-full gap-px" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <video src={previews[0]} className="w-full h-full object-cover row-span-2" muted playsInline />
            <video src={previews[1]} className="w-full h-full object-cover" muted playsInline />
            <video src={previews[2]} className="w-full h-full object-cover" muted playsInline />
          </div>
        ) : (
          /* 4+: 2x2 grid */
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-px">
            {previews.map((url, i) => (
              <div key={i} className="relative">
                <video src={url} className="w-full h-full object-cover" muted playsInline />
                {i === 3 && count > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-base font-bold">+{count - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-200">
          <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 shadow-xl">
            <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Count pill — only if multiple */}
        {count > 1 && (
          <div
            className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          >
            <Film className="w-2.5 h-2.5" />
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
          {[entry.video_type, entry.year?.toString()].filter(Boolean).join(' · ')}
        </p>
      </div>
    </button>
  );
}

/* ─── Main export ───────────────────────────────────────────────────── */
export default function MacVideoGallery({ entries, windowTitle }: Props) {
  const [selected, setSelected] = useState<VideoEntry | null>(null);

  const validEntries = entries.filter(
    e => (e.videos?.length ?? 0) > 0 || e.video_url
  );

  if (validEntries.length === 0) return null;

  const fileCount = validEntries.reduce(
    (sum, e) => sum + (e.videos?.length ?? (e.video_url ? 1 : 0)),
    0
  );

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
            {windowTitle ?? 'Videos'} — {fileCount} file{fileCount !== 1 ? 's' : ''}
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