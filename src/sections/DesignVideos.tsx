import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Film, X, ChevronLeft, ChevronRight, Play, VolumeX, Volume2 } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import VideoFolderGallery from '../components/VideoFolderGallery';

interface DesignVideo {
  id: string;
  title: string;
  video_type: string | null;
  video_url: string | null;
  videos: string[] | null;
  thumbnail_url: string | null;
  description: string | null;
  year: number | null;
  design_work_id: string | null;
}

interface VideoProject {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  year: number | null;
  items: { id: string; title: string; video_url: string | null; thumbnail_url: string | null; sort_order: number }[];
}

/* ── iOS-style lightbox ── */
function VideoLightbox({ entry, onClose }: { entry: DesignVideo; onClose: () => void }) {
  const urls = entry.videos?.length ? entry.videos : entry.video_url ? [entry.video_url] : [];
  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx(i => Math.min(urls.length - 1, i + 1)), [urls.length]);

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

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(16px)' }} onClick={onClose}>
      <div className="relative w-full max-w-3xl mx-4 rounded-2xl overflow-hidden" style={{ background: 'var(--glass-bg)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{entry.title}</p>
            {entry.video_type && <p className="text-xs text-[var(--text-secondary)]">{entry.video_type}</p>}
          </div>
          <div className="flex items-center gap-2">
            {urls.length > 1 && <span className="text-xs text-[var(--text-secondary)]">{idx + 1} / {urls.length}</span>}
            <button onClick={() => setMuted(m => !m)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Video */}
        <div className="bg-black" style={{ aspectRatio: '16/9' }}>
          <video ref={videoRef} key={urls[idx]} src={urls[idx]} poster={idx === 0 ? (entry.thumbnail_url ?? undefined) : undefined} controls autoPlay muted={muted} playsInline className="w-full h-full object-contain" />
        </div>
        {/* Thumbnail strip - iOS style */}
        {urls.length > 1 && (
          <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border)]">
            <button onClick={prev} disabled={idx === 0} className="shrink-0 w-8 h-8 rounded-full glass flex items-center justify-center disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex gap-2 overflow-x-auto flex-1">
              {urls.map((url, i) => (
                <button key={i} onClick={() => setIdx(i)} className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? 'border-[var(--accent)]' : 'border-transparent opacity-50 hover:opacity-80'}`} style={{ width: 64, height: 44 }}>
                  <video src={url} className="w-full h-full object-cover pointer-events-none" muted />
                </button>
              ))}
            </div>
            <button onClick={next} disabled={idx === urls.length - 1} className="shrink-0 w-8 h-8 rounded-full glass flex items-center justify-center disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ── iOS-style grid group ── */
function VideoGroup({ entry, onClick }: { entry: DesignVideo; onClick: () => void }) {
  const urls = entry.videos?.length ? entry.videos : entry.video_url ? [entry.video_url] : [];
  if (!urls.length) return null;

  const count = urls.length;
  const previews = urls.slice(0, Math.min(count, 4));

  return (
    <button onClick={onClick} className="group text-left w-full glass rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all hover:scale-[1.01] hover:shadow-xl">
      {/* Grid preview ala iOS */}
      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        {count === 1 ? (
          <video src={urls[0]} poster={entry.thumbnail_url ?? undefined} className="w-full h-full object-cover" muted playsInline />
        ) : count === 2 ? (
          <div className="grid grid-cols-2 h-full gap-0.5">
            {previews.map((url, i) => <video key={i} src={url} className="w-full h-full object-cover" muted playsInline />)}
          </div>
        ) : count === 3 ? (
          <div className="grid h-full gap-0.5" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
            <video src={previews[0]} className="w-full h-full object-cover row-span-2" muted playsInline />
            <video src={previews[1]} className="w-full h-full object-cover" muted playsInline />
            <video src={previews[2]} className="w-full h-full object-cover" muted playsInline />
          </div>
        ) : (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
            {previews.map((url, i) => (
              <div key={i} className="relative">
                <video src={url} className="w-full h-full object-cover" muted playsInline />
                {i === 3 && count > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">+{count - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 shadow-lg">
            <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
          </div>
        </div>
        {/* Count badge */}
        {count > 1 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ background: 'var(--accent)' }}>
            {count} video
          </div>
        )}
      </div>
      {/* Info */}
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{entry.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {entry.video_type && <span className="text-xs text-[var(--text-secondary)]">{entry.video_type}</span>}
          {entry.year && <span className="text-xs text-[var(--text-secondary)] opacity-60">{entry.year}</span>}
        </div>
        {entry.description && <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 opacity-70">{entry.description}</p>}
      </div>
    </button>
  );
}

export default function DesignVideos() {
  const ref = useScrollAnimation();
  const [videos, setVideos] = useState<DesignVideo[]>([]);
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DesignVideo | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: vids }, { data: projs }, { data: vitems }] = await Promise.all([
        supabase.from('design_videos').select('*').order('year', { ascending: false }),
        supabase.from('video_projects').select('*').in('side', ['design', 'both']).order('created_at', { ascending: false }),
        supabase.from('video_items').select('*').order('sort_order'),
      ]);
      if (vids) setVideos(vids as DesignVideo[]);
      if (projs && vitems) {
        const byProject: Record<string, any[]> = {};
        for (const item of vitems as any[]) {
          if (!byProject[item.project_id]) byProject[item.project_id] = [];
          byProject[item.project_id].push(item);
        }
        setProjects((projs as any[]).map(p => ({ ...p, items: byProject[p.id] ?? [] })));
      }
      setLoading(false);
    })();
  }, []);

  const hasVideos = videos.some(v => (v.videos?.length ?? 0) > 0 || v.video_url);
  const hasContent = hasVideos || projects.length > 0;

  // Group by year
  const byYear = videos.reduce<Record<string, DesignVideo[]>>((acc, v) => {
    const y = v.year?.toString() ?? 'Other';
    if (!acc[y]) acc[y] = [];
    acc[y].push(v);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => (b === 'Other' ? -1 : a === 'Other' ? 1 : parseInt(b) - parseInt(a)));

  return (
    <section id="videos" className="min-h-[70vh] flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Video Content</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">Motion & Reels</h2>

          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : !hasContent ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Film className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No videos yet.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Video Projects (folder cards) */}
              {projects.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">Projects</p>
                  <VideoFolderGallery projects={projects} />
                </div>
              )}

              {/* Individual videos grouped by year - iOS style */}
              {hasVideos && years.map(year => (
                <div key={year}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">{year}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {byYear[year].filter(v => (v.videos?.length ?? 0) > 0 || v.video_url).map(v => (
                      <VideoGroup key={v.id} entry={v} onClick={() => setSelected(v)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && <VideoLightbox entry={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}