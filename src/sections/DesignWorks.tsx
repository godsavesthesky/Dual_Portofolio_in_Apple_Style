import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  PenTool, Palette, Type, Brush, Printer, Package, Heart,
  X, ChevronLeft, ChevronRight, MoreHorizontal, Search, PlusSquare, User,
  MessageCircle, Send, Bookmark, Home as HomeIcon, Film,
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import type { DesignWork, Category } from '../lib/types';

/* ─────────────────────────────────────────────────────
   Predefined main categories (dengan icon & presentation default)
   Kategori lain yang kamu bikin di admin akan di-pick up
   secara OTOMATIS sebagai kategori tambahan.
───────────────────────────────────────────────────── */
const PREDEFINED_CATEGORIES = [
  { key: 'social-media', label: 'Social Media', icon: Palette, match: ['social media', 'instagram', 'feed'] },
  { key: 'logo-brand', label: 'Logo & Brand Identity', icon: Type, match: ['logo', 'brand'] },
  { key: 'illustration', label: 'Illustration', icon: Brush, match: ['illustra'] },
  { key: 'fanart', label: 'Fanart', icon: Heart, match: ['fanart', 'fan art'] },
  { key: 'print', label: 'Print Design', icon: Printer, match: ['print'] },
  { key: 'packaging', label: 'Packaging', icon: Package, match: ['packaging', 'kemasan'] },
] as const;

type PresentationType = 'phone' | 'grid' | 'gallery';

interface ResolvedCategory {
  key: string;           // unique key untuk filter tab
  label: string;         // ditampilkan di tab
  icon: React.ComponentType<{ className?: string }>;
  presentation: PresentationType;
  catIds: string[];      // semua category_id yang masuk bucket ini
}

/* Cari predefined category yg match dengan nama kategori di DB */
function matchPredefined(name: string) {
  const n = name.toLowerCase();
  for (const p of PREDEFINED_CATEGORIES) {
    if (p.match.some(m => n.includes(m))) return p;
  }
  return null;
}

/* Tentukan tipe presentasi per kategori */
function pickPresentation(predefKey: string | null, name: string): PresentationType {
  if (predefKey === 'social-media') return 'phone';
  if (predefKey === 'logo-brand') return 'grid';
  // Default untuk Fanart, Illustration, Print, Packaging, atau kategori custom apa pun
  return 'gallery';
  void name;
}

export default function DesignWorks() {
  const ref = useScrollAnimation();
  const [items, setItems] = useState<DesignWork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainFilter, setMainFilter] = useState<string>('all');
  const [subFilter, setSubFilter] = useState<string>('all');
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

  /* Map id -> category row */
  const catById = useMemo(() => {
    const m = new Map<string, Category>();
    categories.forEach(c => m.set(c.id, c));
    return m;
  }, [categories]);

  /* Bangun daftar "resolved categories" berdasarkan kategori yg dipakai di works */
  const resolvedCategories = useMemo<ResolvedCategory[]>(() => {
    const bucketByKey = new Map<string, ResolvedCategory>();

    // Kumpulkan hanya kategori yang benar-benar dipakai oleh minimal 1 work
    const usedCatIds = new Set<string>();
    items.forEach(w => { if (w.category_id) usedCatIds.add(w.category_id); });

    usedCatIds.forEach(id => {
      const cat = catById.get(id);
      if (!cat) return;

      const predef = matchPredefined(cat.name);
      if (predef) {
        const existing = bucketByKey.get(predef.key);
        if (existing) {
          existing.catIds.push(id);
        } else {
          bucketByKey.set(predef.key, {
            key: predef.key,
            label: predef.label,
            icon: predef.icon,
            presentation: pickPresentation(predef.key, cat.name),
            catIds: [id],
          });
        }
      } else {
        // Kategori custom dari admin → bikin tab sendiri dengan nama kategorinya
        const customKey = `custom:${cat.id}`;
        bucketByKey.set(customKey, {
          key: customKey,
          label: cat.name,
          icon: PenTool,
          presentation: 'gallery',
          catIds: [id],
        });
      }
    });

    // Urutkan: predefined dulu (sesuai urutan PREDEFINED_CATEGORIES), baru custom
    const predefOrder = PREDEFINED_CATEGORIES.map(p => p.key);
    return Array.from(bucketByKey.values()).sort((a, b) => {
      const ai = predefOrder.indexOf(a.key);
      const bi = predefOrder.indexOf(b.key);
      if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [items, catById]);

  /* Bucket aktif (yg dipilih) */
  const activeBucket = useMemo(
    () => resolvedCategories.find(r => r.key === mainFilter) ?? null,
    [resolvedCategories, mainFilter]
  );

  /* Sub-types yg tersedia di bucket aktif */
  const availableSubTypes = useMemo(() => {
    if (!activeBucket) return [];
    const subs = new Set<string>();
    items.forEach(w => {
      if (w.category_id && activeBucket.catIds.includes(w.category_id) && w.sub_type) {
        subs.add(w.sub_type);
      }
    });
    return Array.from(subs).sort();
  }, [activeBucket, items]);

  /* Works yang difilter */
  const filtered = useMemo(() => {
    let result = items;
    if (activeBucket) {
      result = result.filter(w => w.category_id && activeBucket.catIds.includes(w.category_id));
    }
    if (subFilter !== 'all') {
      result = result.filter(w => w.sub_type === subFilter);
    }
    return result;
  }, [items, activeBucket, subFilter]);

  /* Reset sub-filter tiap ganti main filter */
  useEffect(() => { setSubFilter('all'); }, [mainFilter]);

  /* Cari bucket untuk satu work (buat nentuin presentation di modal) */
  const getBucketForWork = useCallback(
    (w: DesignWork): ResolvedCategory | null => {
      if (!w.category_id) return null;
      return resolvedCategories.find(r => r.catIds.includes(w.category_id!)) ?? null;
    },
    [resolvedCategories]
  );

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
          {resolvedCategories.length > 0 && (
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
              {resolvedCategories.map(rc => {
                const Icon = rc.icon;
                const active = mainFilter === rc.key;
                return (
                  <button
                    key={rc.key}
                    onClick={() => setMainFilter(rc.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      active
                        ? 'text-white shadow-sm'
                        : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    style={active ? { background: 'var(--accent)' } : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {rc.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sub-type tabs */}
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
                const catName = w.category_id ? catById.get(w.category_id)?.name : undefined;
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
          bucket={getBucketForWork(selectedWork)}
          categoryName={selectedWork.category_id ? catById.get(selectedWork.category_id)?.name : undefined}
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
  bucket: ResolvedCategory | null;
  categoryName?: string;
  onClose: () => void;
}

function ProjectModal({ work, bucket, categoryName, onClose }: ProjectModalProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const presentationType: PresentationType = bucket?.presentation ?? 'gallery';
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
                  <InstagramPhonePresentation
                    photos={photos}
                    username={work.title}
                    onPhotoClick={setLightboxIdx}
                  />
                )}
                {presentationType === 'grid' && (
                  <VariationGridPresentation photos={photos} onPhotoClick={setLightboxIdx} />
                )}
                {presentationType === 'gallery' && (
                  <GalleryPresentation photos={photos} onPhotoClick={setLightboxIdx} />
                )}
              </>
            )}

            {/* Cover image kalau ga ada gallery */}
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

/* ─────────────────────────────────────────────────────
   Instagram Post Style Phone Mockup (Social Media)
   — Tampil kayak buka 1 postingan di Instagram
───────────────────────────────────────────────────── */

function InstagramPhonePresentation({
  photos,
  username,
  onPhotoClick,
}: {
  photos: string[];
  username: string;
  onPhotoClick: (i: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const handle = '@' + username.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 20);

  const goPrev = () => setCurrentIdx(i => (i - 1 + photos.length) % photos.length);
  const goNext = () => setCurrentIdx(i => (i + 1) % photos.length);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-[6px] border-gray-800 dark:border-gray-600 bg-white dark:bg-neutral-900 overflow-hidden shadow-2xl"
        style={{ width: 320, height: 640 }}
      >
        {/* Dynamic island / notch */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20" />

        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-6 text-[10px] font-semibold text-black dark:text-white z-10 pt-1">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2 border border-current rounded-sm" />
          </span>
        </div>

        {/* Instagram "post" screen */}
        <div className="absolute inset-0 pt-9 flex flex-col bg-white dark:bg-neutral-900">
          {/* IG app header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-neutral-800">
            <span
              className="text-[15px] font-bold text-black dark:text-white"
              style={{ fontFamily: 'Billabong, cursive, system-ui' }}
            >
              Instagram
            </span>
            <div className="flex items-center gap-3 text-black dark:text-white">
              <Heart className="w-4 h-4" />
              <Send className="w-4 h-4" />
            </div>
          </div>

          {/* Post header */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full p-[1.5px]" style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-pink-400" />
                </div>
              </div>
              <span className="text-[11px] font-semibold text-black dark:text-white truncate max-w-[150px]">
                {handle}
              </span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-black dark:text-white" />
          </div>

          {/* Post image — aspect 1:1 seperti feed Instagram (contain, bukan zoom) */}
          <div className="relative w-full aspect-square bg-gray-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
            <img
              src={photos[currentIdx]}
              alt={`Post ${currentIdx + 1}`}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => onPhotoClick(currentIdx)}
            />

            {/* Carousel arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-800" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow"
                  aria-label="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-800" />
                </button>

                {/* Carousel indicator (pill) */}
                <div className="absolute top-2 right-2 bg-black/55 text-white text-[9px] font-medium rounded-full px-1.5 py-0.5">
                  {currentIdx + 1}/{photos.length}
                </div>
              </>
            )}
          </div>

          {/* Action row */}
          <div className="px-3 py-2 flex items-center justify-between text-black dark:text-white">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5" />
              <MessageCircle className="w-5 h-5" />
              <Send className="w-5 h-5" />
            </div>
            {photos.length > 1 && (
              <div className="flex items-center gap-1">
                {photos.map((_, i) => (
                  <span
                    key={i}
                    className={`rounded-full transition-all ${i === currentIdx ? 'bg-blue-500 w-1.5 h-1.5' : 'bg-gray-300 dark:bg-neutral-600 w-1 h-1'}`}
                  />
                ))}
              </div>
            )}
            <Bookmark className="w-5 h-5" />
          </div>

          {/* Caption */}
          <div className="px-3 pb-2 flex-1">
            <p className="text-[11px] text-black dark:text-white">
              <span className="font-semibold">{handle}</span>{' '}
              <span className="text-gray-700 dark:text-gray-300 line-clamp-2">
                {username}
              </span>
            </p>
          </div>

          {/* IG bottom nav */}
          <div className="border-t border-gray-200 dark:border-neutral-800 px-4 py-2 flex items-center justify-between text-black dark:text-white">
            <HomeIcon className="w-5 h-5" />
            <Search className="w-5 h-5" />
            <PlusSquare className="w-5 h-5" />
            <Film className="w-5 h-5" />
            <User className="w-5 h-5" />
          </div>

          {/* Home indicator */}
          <div className="mx-auto w-24 h-1 bg-black dark:bg-white rounded-full mb-1.5" />
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

/* ─── Gallery Presentation (Illustration, Fanart, Print, Packaging, Custom) ─── */

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