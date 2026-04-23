import { useEffect, useMemo, useState, useRef } from 'react';
import { Building, X, ChevronLeft, ChevronRight, Ruler, Film, Image, VolumeX, Volume2, Maximize2 } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { ArchWork, Category, Drawing, ArchVideo } from '../lib/types';
import FilterTabs from '../components/FilterTabs';
import MacGallery from '../components/MacGallery';

/* ─── Video card with autoplay ─── */
function MiniVideoCard({ video }: { video: ArchVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && ref.current && video.video_url) {
          ref.current.play().catch(() => {});
        } else if (ref.current) {
          ref.current.pause();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [video.video_url]);

  return (
    <div ref={cardRef} className="flex-shrink-0 rounded-xl overflow-hidden border border-[var(--border)] relative" style={{ width: 260, height: 170 }}>
      {video.video_url ? (
        <>
          <video ref={ref} src={video.video_url} muted={muted} loop playsInline className="w-full h-full object-cover" />
          <button onClick={() => setMuted(!muted)} className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white z-10">
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))' }}>
          <Film className="w-6 h-6 text-[var(--text-secondary)] opacity-40" />
        </div>
      )}
      {video.video_type && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-white/90 bg-black/40 backdrop-blur-md">{video.video_type}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-xs font-medium text-white/90 truncate">{video.title}</p>
      </div>
    </div>
  );
}

/* ─── Drawing card with lightbox ─── */
function DrawingCard({ drawing, onClick }: { drawing: Drawing; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex-shrink-0 rounded-xl overflow-hidden border border-[var(--border)] hover:scale-[1.02] transition-transform relative group" style={{ width: 260, height: 170 }}>
      {drawing.image_url ? (
        <img src={drawing.image_url} alt={drawing.title} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, rgba(120,113,108,0.12), rgba(168,162,158,0.08))' }}>
          <Ruler className="w-6 h-6 text-[var(--text-secondary)] opacity-40" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
      </div>
      {drawing.drawing_type && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-white/90 bg-black/40 backdrop-blur-md">{drawing.drawing_type}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-xs font-medium text-white/90 truncate">{drawing.title}</p>
      </div>
    </button>
  );
}

/* ─── Project detail modal with tabs ─── */
function ProjectModal({
  project,
  drawings,
  videos,
  onClose,
}: {
  project: ArchWork | null;
  drawings: Drawing[];
  videos: ArchVideo[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'photos' | 'drawings' | 'videos'>('photos');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (lightboxImg) setLightboxImg(null); else onClose(); } };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose, lightboxImg]);

  useEffect(() => { setTab('photos'); }, [project]);

  if (!project) return null;

  const photos = project.photos ?? [];
  const hasPhotos = photos.length > 0 || !!project.photo_url;
  const hasDrawings = drawings.length > 0;
  const hasVideos = videos.length > 0;

  const scroll = (dir: 'left' | 'right') => {
    trackRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  const tabs = [
    { key: 'photos' as const, label: 'Photos', icon: <Image className="w-3.5 h-3.5" />, count: photos.length + (project.photo_url ? 1 : 0), show: hasPhotos },
    { key: 'drawings' as const, label: 'Gambar Kerja', icon: <Ruler className="w-3.5 h-3.5" />, count: drawings.length, show: hasDrawings },
    { key: 'videos' as const, label: 'Video', icon: <Film className="w-3.5 h-3.5" />, count: videos.length, show: hasVideos },
  ].filter(t => t.show);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div
          className="relative glass-heavy rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* macOS title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#28CA41]" />
            <span className="flex-1 text-center text-xs font-medium text-[var(--text-secondary)] select-none pr-8">
              {project.title}
            </span>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6">
            {/* Project header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{project.title}</h2>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-3">
                {project.year && <span>{project.year}</span>}
              </div>
              {project.description && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{project.description}</p>
              )}
            </div>

            {/* Tabs */}
            {tabs.length > 0 && (
              <div className="flex gap-2 mb-5">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      tab === t.key
                        ? 'text-white shadow-sm'
                        : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    style={tab === t.key ? { background: 'var(--accent)' } : undefined}
                  >
                    {t.icon} {t.label} ({t.count})
                  </button>
                ))}
              </div>
            )}

            {/* Tab content */}
            {tab === 'photos' && hasPhotos && (
              <MacGallery
                photos={[...(project.photo_url ? [project.photo_url] : []), ...photos]}
                title={project.title}
              />
            )}

            {tab === 'drawings' && hasDrawings && (
              <div className="glass rounded-2xl overflow-hidden shadow-xl">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)]">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#28CA41] shadow-sm" />
                  <span className="flex-1 text-center text-xs font-medium text-[var(--text-secondary)] select-none">
                    gambar-kerja — {drawings.length} sheets
                  </span>
                </div>
                <div className="relative p-3 select-none">
                  {drawings.length > 2 && (
                    <button onClick={() => scroll('left')} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div ref={trackRef} className="flex gap-3 overflow-x-auto scroll-smooth pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {drawings.map(d => (
                      <DrawingCard key={d.id} drawing={d} onClick={() => setLightboxImg(d.image_url)} />
                    ))}
                  </div>
                  {drawings.length > 2 && (
                    <button onClick={() => scroll('right')} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {tab === 'videos' && hasVideos && (
              <div className="glass rounded-2xl overflow-hidden shadow-xl">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)]">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#28CA41] shadow-sm" />
                  <span className="flex-1 text-center text-xs font-medium text-[var(--text-secondary)] select-none">
                    renders — {videos.length} videos
                  </span>
                </div>
                <div className="relative p-3 select-none">
                  <div className="flex gap-3 overflow-x-auto scroll-smooth pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {videos.map(v => <MiniVideoCard key={v.id} video={v} />)}
                  </div>
                </div>
              </div>
            )}

            {tabs.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center">
                <p className="text-sm text-[var(--text-secondary)]">No media attached to this project yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawing lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4" onClick={() => setLightboxImg(null)}>
          <button onClick={() => setLightboxImg(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
          <img src={lightboxImg} alt="Drawing" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

/* ─── Main section ─── */
export default function ArchWorks() {
  const ref = useScrollAnimation();
  const [items, setItems] = useState<ArchWork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<string | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // For project modal
  const [selectedProject, setSelectedProject] = useState<ArchWork | null>(null);
  const [projectDrawings, setProjectDrawings] = useState<Drawing[]>([]);
  const [projectVideos, setProjectVideos] = useState<ArchVideo[]>([]);

  useEffect(() => {
    (async () => {
      const { data: works } = await supabase
        .from('arch_works')
        .select('*')
        .order('year', { ascending: false });

      if (works) {
        setItems(works as ArchWork[]);
        const usedIds = [...new Set(works.map(w => w.category_id).filter(Boolean))];
        if (usedIds.length > 0) {
          const { data: cats } = await supabase
            .from('categories')
            .select('*')
            .in('id', usedIds)
            .eq('type', 'arch_work')
            .order('name');
          if (cats) setCategories(cats as Category[]);
        }
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter(i => i.category_id === filter)),
    [filter, items]
  );

  // Load drawings + videos when a project is selected
  const openProject = async (project: ArchWork) => {
    setSelectedProject(project);
    setProjectDrawings([]);
    setProjectVideos([]);

    const [{ data: drawings }, { data: videos }] = await Promise.all([
      supabase.from('drawings').select('*').eq('arch_work_id', project.id).order('created_at'),
      supabase.from('arch_videos').select('*').eq('arch_work_id', project.id).order('created_at'),
    ]);

    if (drawings) setProjectDrawings(drawings as Drawing[]);
    if (videos) setProjectVideos(videos as ArchVideo[]);
  };

  return (
    <section id="works" className="min-h-screen flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Projects</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">
            Architecture & Building Design
          </h2>

          <FilterTabs categories={categories} value={filter} onChange={setFilter} />

          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Building className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No projects yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {filtered.map(w => (
                <article
                  key={w.id}
                  onClick={() => openProject(w)}
                  className="glass rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col cursor-pointer"
                >
                  {w.photo_url ? (
                    <img src={w.photo_url} alt={w.title} className="w-full h-52 object-cover" />
                  ) : (
                    <div className="w-full h-52 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(120,113,108,0.2), rgba(168,162,158,0.15))' }}>
                      <Building className="w-10 h-10 text-stone-500/60" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">{w.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-secondary)]">
                      {w.year && <span>{w.year}</span>}
                    </div>
                    {w.description && (
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">{w.description}</p>
                    )}
                    <span className="mt-auto text-xs font-medium text-[var(--accent)] pt-2">View project →</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        drawings={projectDrawings}
        videos={projectVideos}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}