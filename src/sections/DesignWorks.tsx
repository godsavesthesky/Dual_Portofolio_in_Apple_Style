import { useEffect, useMemo, useState, useCallback } from 'react';
import { PenTool, Palette, Type, Brush, Printer, Package, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { DesignWork, Category } from '../lib/types';

/* ─── Main category definitions ─── */
const MAIN_CATEGORIES = [
  { key: 'social-media', label: 'Social Media', icon: Palette },
  { key: 'logo-brand', label: 'Logo & Brand Identity', icon: Type },
  { key: 'illustration', label: 'Illustration', icon: Brush },
  { key: 'print', label: 'Print Design', icon: Printer },
  { key: 'packaging', label: 'Packaging', icon: Package },
] as const;

type MainCategoryKey = (typeof MAIN_CATEGORIES)[number]['key'];

/* Maps a category name from DB to our main keys */
function resolveMainCategory(catName: string | undefined): MainCategoryKey | null {
  if (!catName) return null;
  const n = catName.toLowerCase();
  if (n.includes('social media')) return 'social-media';
  if (n.includes('logo') || n.includes('brand')) return 'logo-brand';
  if (n.includes('illustra')) return 'illustration';
  if (n.includes('print')) return 'print';
  if (n.includes('packaging') || n.includes('kemasan')) return 'packaging';
  return null;
}

/* Determine modal presentation type */
function getPresentationType(mainCat: MainCategoryKey | null): 'phone' | 'grid' | 'gallery' {
  if (mainCat === 'social-media') return 'phone';
  if (mainCat === 'logo-brand') return 'grid';
  return 'gallery';
}

export default function DesignWorks() {
  const ref = useScrollAnimation();
  const [items, setItems] = useState<DesignWork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainFilter, setMainFilter] = useState<MainCategoryKey | 'all'>('all');
  const [subFilter, setSubFilter] = useState<string | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<DesignWork | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: works }, { data: cats }] = await Promise.all([
        supabase.from('design_works').select('*').order('year', { ascending: false }),
        supabase.from('categories').select('*').eq('type', 'design_work').order('name'),
      ]);
      if (works) setItems(works as DesignWork[]);
      if (cats) setCategories(cats as Category[]);
      setLoading(false);
    })();
  }, []);

  /* Map category ids to names for lookup */
  const catMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  /* Build active main categories (only show tabs for cats that have items) */
  const activeMainCats = useMemo(() => {
    const found = new Set<MainCategoryKey>();
    items.forEach(w => {
      const catName = w.category_id ? catMap[w.category_id] : undefined;
      const mk = resolveMainCategory(catName);
      if (mk) found.add(mk);
    });
    return MAIN_CATEGORIES.filter(mc => found.has(mc.key));
  }, [items, catMap]);

  /* Get sub-types available for the current main filter */
  const availableSubTypes = useMemo(() => {
    if (mainFilter === 'all') return [];
    const subs = new Set<string>();
    items.forEach(w => {
      const catName = w.category_id ? catMap[w.category_id] : undefined;
      const mk = resolveMainCategory(catName);
      if (mk === mainFilter && w.sub_type) subs.add(w.sub_type);
    });
    return Array.from(subs).sort();
  }, [mainFilter, items, catMap]);

  /* Filtered items */
  const filtered = useMemo(() => {
    let result = items;
    if (mainFilter !== 'all') {
      result = result.filter(w => {
        const catName = w.category_id ? catMap[w.category_id] : undefined;
        return resolveMainCategory(catName) === mainFilter;
      });
    }
    if (subFilter !== 'all') {
      result = result.filter(w => w.sub_type === subFilter);
    }
    return result;
  }, [mainFilter, subFilter, items, catMap]);

  /* Reset sub-filter when main filter changes */
  useEffect(() => { setSubFilter('all'); }, [mainFilter]);

  const getMainCat = useCallback((w: DesignWork) => {
    const catName = w.category_id ? catMap[w.category_id] : undefined;
    return resolveMainCategory(catName);
  }, [catMap]);

  return (
    <section id="works" className="min-h-screen flex items-center">
      <div className="section-container w-full">
        <div ref={ref} className="animate-on-scroll">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Selected Works
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">
            Graphic Design & Illustration
          </h2>

          {/* Main category tabs */}
          {activeMainCats.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setMainFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  mainFilter === 'all'
                    ? 'text-white shadow-sm'
                    : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                style={mainFilter === 'all' ? { background: 'var(--accent)' } : undefined}
              >
                All
              </button>
              {activeMainCats.map(mc => {
                const Icon = mc.icon;
                const active = mainFilter === mc.key;
                return (
                  <button
                    key={mc.key}
                    onClick={() => setMainFilter(mc.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      active
                        ? 'text-white shadow-sm'
                        : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    style={active ? { background: 'var(--accent)' } : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {mc.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sub-type tabs (only when a main category is selected and sub-types exist) */}
          {availableSubTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              <button
                onClick={() => setSubFilter('all')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  subFilter === 'all'
                    ? 'text-white shadow-sm'
                    : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                style={subFilter === 'all' ? { background: 'var(--accent)', opacity: 0.85 } : undefined}
              >
                All
              </button>
              {availableSubTypes.map(st => {
                const active = subFilter === st;
                return (
                  <button
                    key={st}
                    onClick={() => setSubFilter(st)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      active
                        ? 'text-white shadow-sm'
                        : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    style={active ? { background: 'var(--accent)', opacity: 0.85 } : undefined}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <PenTool className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No works yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(w => {
                const catName = w.category_id ? catMap[w.category_id] : undefined;
                return (
                  <article
                    key={w.id}
                    className="glass rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col cursor-pointer group"
                    onClick={() => setSelectedWork(w)}
                  >
                    {w.photo_url ? (
                      <div className="relative overflow-hidden">
                        <img
                          src={w.photo_url}
                          alt={w.title}
                          className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <span className="text-white text-xs font-medium px-3 py-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                            View Project
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full h-44 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))' }}
                      >
                        <PenTool className="w-10 h-10 text-blue-500/60" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col gap-1.5 flex-1">
                      <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                        {w.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-secondary)]">
                        {catName && <span className="px-1.5 py-0.5 rounded glass text-[10px]">{catName}</span>}
                        {w.sub_type && <span className="px-1.5 py-0.5 rounded glass text-[10px]">{w.sub_type}</span>}
                        {w.year && <span>{w.year}</span>}
                      </div>
                      {w.description && (
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 mt-1">
                          {w.description}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Adaptive Project Modal */}
      {selectedWork && (
        <ProjectModal
          work={selectedWork}
          mainCategory={getMainCat(selectedWork)}
          categoryName={selectedWork.category_id ? catMap[selectedWork.category_id] : undefined}
          onClose={() => setSelectedWork(null)}
        />
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────
   Project Modal — adapts presentation per category
───────────────────────────────────────────────────── */

interface ProjectModalProps {
  work: DesignWork;
  mainCategory: MainCategoryKey | null;
  categoryName?: string;
  onClose: () => void;
}

function ProjectModal({ work, mainCategory, categoryName, onClose }: ProjectModalProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const presentationType = getPresentationType(mainCategory);
  const photos = work.photos ?? [];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxIdx !== null) setLightboxIdx(null);
        else onClose();
      }
      if (lightboxIdx !== null && photos.length > 1) {
        if (e.key === 'ArrowLeft') setLightboxIdx(i => (i !== null ? (i - 1 + photos.length) % photos.length : null));
        if (e.key === 'ArrowRight') setLightboxIdx(i => (i !== null ? (i + 1) % photos.length : null));
      }
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, lightboxIdx, photos.length]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        <div
          className="relative glass-heavy rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col animate-modal-in"
          onClick={e => e.stopPropagation()}
        >
          {/* macOS title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#28CA41]" />
            <span className="flex-1 text-center text-xs font-medium text-[var(--text-secondary)] select-none pr-8">
              {work.title}
            </span>
          </div>

          {/* Content — scrollable */}
          <div className="overflow-y-auto p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{work.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                {categoryName && (
                  <span className="px-2 py-0.5 rounded-full glass text-[11px] font-medium">{categoryName}</span>
                )}
                {work.sub_type && (
                  <span className="px-2 py-0.5 rounded-full glass text-[11px] font-medium">{work.sub_type}</span>
                )}
                {work.year && <span>{work.year}</span>}
              </div>
              {work.description && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-3">{work.description}</p>
              )}
            </div>

            {/* Adaptive presentation */}
            {photos.length > 0 && (
              <>
                {presentationType === 'phone' && (
                  <PhoneMockupPresentation photos={photos} onPhotoClick={setLightboxIdx} />
                )}
                {presentationType === 'grid' && (
                  <VariationGridPresentation photos={photos} onPhotoClick={setLightboxIdx} />
                )}
                {presentationType === 'gallery' && (
                  <GalleryPresentation photos={photos} onPhotoClick={setLightboxIdx} />
                )}
              </>
            )}

            {/* Cover image if no gallery photos */}
            {photos.length === 0 && work.photo_url && (
              <div className="rounded-xl overflow-hidden">
                <img src={work.photo_url} alt={work.title} className="w-full object-contain max-h-[60vh]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox overlay */}
      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-lg"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i !== null ? (i - 1 + photos.length) % photos.length : null)); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i !== null ? (i + 1) % photos.length : null)); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-5xl max-h-[90vh] px-16" onClick={e => e.stopPropagation()}>
            <img
              src={photos[lightboxIdx]}
              alt={`Photo ${lightboxIdx + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            {photos.length > 1 && (
              <p className="text-center text-white/50 text-xs mt-3">
                {lightboxIdx + 1} / {photos.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Phone Mockup Presentation (Social Media) ─── */

function PhoneMockupPresentation({ photos, onPhotoClick }: { photos: string[]; onPhotoClick: (i: number) => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phone frame */}
      <div className="relative">
        <div
          className="relative rounded-[2.5rem] border-[6px] border-gray-800 dark:border-gray-600 bg-black overflow-hidden shadow-2xl"
          style={{ width: 280, height: 560 }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />

          {/* Screen */}
          <div className="w-full h-full overflow-hidden">
            <img
              src={photos[currentIdx]}
              alt={`Social media design ${currentIdx + 1}`}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => onPhotoClick(currentIdx)}
            />
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 flex-wrap justify-center max-w-md">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === currentIdx
                  ? 'border-[var(--accent)] shadow-md scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Variation Grid Presentation (Logo / Brand Identity) ─── */

function VariationGridPresentation({ photos, onPhotoClick }: { photos: string[]; onPhotoClick: (i: number) => void }) {
  return (
    <div>
      {/* Primary logo — first image large */}
      {photos.length > 0 && (
        <div
          className="glass rounded-xl overflow-hidden mb-4 cursor-pointer group"
          onClick={() => onPhotoClick(0)}
        >
          <div className="p-8 flex items-center justify-center" style={{ background: 'var(--surface)' }}>
            <img
              src={photos[0]}
              alt="Primary logo"
              className="max-h-64 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>
      )}

      {/* Variations grid */}
      {photos.length > 1 && (
        <div className={`grid gap-3 ${photos.length === 2 ? 'grid-cols-1' : photos.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {photos.slice(1).map((url, i) => (
            <div
              key={i}
              className="glass rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => onPhotoClick(i + 1)}
            >
              <div className="p-4 flex items-center justify-center aspect-square" style={{ background: 'var(--surface)' }}>
                <img
                  src={url}
                  alt={`Variation ${i + 2}`}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="px-3 py-2 text-center">
                <span className="text-[10px] text-[var(--text-secondary)]">
                  Variation {i + 2}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Gallery Presentation (Illustration, Print, Packaging) ─── */

function GalleryPresentation({ photos, onPhotoClick }: { photos: string[]; onPhotoClick: (i: number) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {photos.map((url, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden cursor-pointer group glass"
          onClick={() => onPhotoClick(i)}
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={url}
              alt={`Gallery ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </div>
        </div>
      ))}
    </div>
  );
}