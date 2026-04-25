import { useEffect, useState, useMemo } from 'react';
import { Printer, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../lib/useProfile';
import type { DesignWork, ArchWork, Experience, Category } from '../../lib/types';

type Side = 'design' | 'arch' | 'both';

interface FeaturedWork {
  id: string;
  title: string;
  year: number | null;
  description: string | null;
  photo_url: string | null;
  photos: string[];
  category_id: string | null;
  side: 'design' | 'arch';
}

interface CategoryGroup {
  categoryId: string | null;
  categoryName: string;
  works: FeaturedWork[];
}

export default function PortfolioPDFPage() {
  const { profile } = useProfile();
  const [side, setSide] = useState<Side>('both');
  const [designWorks, setDesignWorks] = useState<DesignWork[]>([]);
  const [archWorks, setArchWorks] = useState<ArchWork[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [dw, aw, exp, cats] = await Promise.all([
        supabase.from('design_works').select('*').eq('featured', true).order('year', { ascending: false }),
        supabase.from('arch_works').select('*').eq('featured', true).order('year', { ascending: false }),
        supabase.from('experience').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order').order('name'),
      ]);
      if (dw.data) setDesignWorks(dw.data as DesignWork[]);
      if (aw.data) setArchWorks(aw.data as ArchWork[]);
      if (exp.data) setExperiences(exp.data as Experience[]);
      if (cats.data) setCategories(cats.data as Category[]);
      setLoading(false);
    })();
  }, []);

  // Group works by category, ordered by display_order
  const groups: CategoryGroup[] = useMemo(() => {
    const allWorks: FeaturedWork[] = [];
    if (side !== 'arch') {
      designWorks.forEach(d => {
        allWorks.push({
          id: d.id, title: d.title, year: d.year, description: d.description,
          photo_url: d.photo_url, photos: (d.photos ?? []).filter(Boolean),
          category_id: d.category_id, side: 'design',
        });
      });
    }
    if (side !== 'design') {
      archWorks.forEach(a => {
        allWorks.push({
          id: a.id, title: a.title, year: a.year, description: a.description,
          photo_url: a.photo_url, photos: (a.photos ?? []).filter(Boolean),
          category_id: a.category_id, side: 'arch',
        });
      });
    }

    // Map category_id → list of works
    const byCat = new Map<string | null, FeaturedWork[]>();
    allWorks.forEach(w => {
      const list = byCat.get(w.category_id) ?? [];
      list.push(w);
      byCat.set(w.category_id, list);
    });

    // Build groups in display_order
    const result: CategoryGroup[] = [];
    const relevantCats = categories.filter(c => {
      if (side === 'design') return c.type === 'design_work';
      if (side === 'arch') return c.type === 'arch_work';
      return c.type === 'design_work' || c.type === 'arch_work';
    });

    relevantCats.forEach(cat => {
      const works = byCat.get(cat.id);
      if (works && works.length > 0) {
        result.push({ categoryId: cat.id, categoryName: cat.name, works });
        byCat.delete(cat.id);
      }
    });

    // Uncategorized last
    const uncategorized = byCat.get(null);
    if (uncategorized && uncategorized.length > 0) {
      result.push({ categoryId: null, categoryName: 'Other Works', works: uncategorized });
    }
    return result;
  }, [side, designWorks, archWorks, categories]);

  const filteredExperiences = useMemo(() => {
    if (side === 'both') return experiences;
    return experiences.filter(e => e.side === 'both' || e.side === side);
  }, [side, experiences]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const displayName = profile.name || 'Your Name';
  const tagline =
    side === 'design' ? 'Graphic Designer · Illustrator'
    : side === 'arch' ? 'Building Designer · Visualizer'
    : (profile.tagline || 'Designer');

  const softwareSkills = profile.software_skills ?? [];
  const softSkills = profile.soft_skills ?? [];
  const legacySkills = profile.skills ?? [];
  const useLegacy = softwareSkills.length === 0 && softSkills.length === 0 && legacySkills.length > 0;

  const totalWorks = groups.reduce((sum, g) => sum + g.works.length, 0);

  return (
    <div className="portfolio-pdf-root">
      {/* Toolbar — hidden when printing */}
      <div className="pdf-toolbar print:hidden">
        <Link to="/admin/profile" className="toolbar-btn">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sisi:</span>
          <select
            value={side}
            onChange={e => setSide(e.target.value as Side)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm bg-white"
          >
            <option value="both">🎨🏗️ Gabungan</option>
            <option value="design">🎨 Design</option>
            <option value="arch">🏗️ Architecture</option>
          </select>
        </div>
        <div className="flex-1" />
        <button onClick={() => window.print()} className="toolbar-btn primary">
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      <div className="pdf-hint print:hidden">
        💡 <strong>Untuk hasil terbaik:</strong> klik Print → Destination <strong>Save as PDF</strong> → 
        Layout <strong>Landscape</strong> → More settings: uncheck "Headers and footers", Background graphics ON, Margins None.
        {totalWorks === 0 && (
          <div className="mt-2 text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            ⚠️ Belum ada karya yang ditandai <strong>Featured</strong>. Tandai dulu di admin (Design Works / Arch Projects) dengan checkbox "⭐ Featured".
          </div>
        )}
      </div>

      <div className="pdf-document">
        {/* ─── COVER ─── */}
        <section className="pdf-page pdf-cover">
          <div className="pdf-cover-left">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={displayName} className="pdf-cover-photo" crossOrigin="anonymous" />
            ) : (
              <div className="pdf-cover-photo pdf-cover-placeholder">{displayName.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className="pdf-cover-right">
            <div className="pdf-accent-bar" />
            <h1 className="pdf-cover-name">{displayName}</h1>
            <p className="pdf-cover-tagline">{tagline}</p>
            <div className="pdf-cover-contact">
              {profile.email && <span>{profile.email}</span>}
              {profile.linkedin && <span>{cleanUrl(profile.linkedin)}</span>}
              {profile.instagram && <span>{cleanUrl(profile.instagram)}</span>}
            </div>
            <p className="pdf-cover-label">PORTFOLIO {new Date().getFullYear()}</p>
          </div>
        </section>

        {/* ─── ABOUT ─── */}
        <section className="pdf-page pdf-about">
          <header className="pdf-section-header">
            <span className="pdf-eyebrow">01</span>
            <h2 className="pdf-h2">About</h2>
          </header>

          <div className="pdf-about-grid">
            <div>
              {profile.bio && (
                <div className="pdf-bio">
                  {profile.bio.split(/\n\s*\n/).filter(Boolean).map((p, i) => (
                    <p key={i}>{p.trim()}</p>
                  ))}
                </div>
              )}
              {filteredExperiences.length > 0 && (
                <div className="pdf-experience">
                  <h3 className="pdf-h3">Experience</h3>
                  <ul>
                    {filteredExperiences.map(exp => (
                      <li key={exp.id}>
                        <div className="pdf-exp-head">
                          <strong>{exp.role}</strong>
                          {exp.company && <span> · {exp.company}</span>}
                          {exp.period && <span className="pdf-exp-period">{exp.period}</span>}
                        </div>
                        {exp.description && <p>{exp.description}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div>
              {(softwareSkills.length > 0 || softSkills.length > 0 || useLegacy) && (
                <div className="pdf-skills">
                  {useLegacy ? (
                    <div className="pdf-skill-group">
                      <h3 className="pdf-h3">Skills & Tools</h3>
                      <div className="pdf-tags">{legacySkills.map(s => <span key={s} className="pdf-tag">{s}</span>)}</div>
                    </div>
                  ) : (
                    <>
                      {softwareSkills.length > 0 && (
                        <div className="pdf-skill-group">
                          <h3 className="pdf-h3">Software & Tools</h3>
                          <div className="pdf-tags">{softwareSkills.map(s => <span key={s} className="pdf-tag">{s}</span>)}</div>
                        </div>
                      )}
                      {softSkills.length > 0 && (
                        <div className="pdf-skill-group">
                          <h3 className="pdf-h3">Soft Skills</h3>
                          <div className="pdf-tags">{softSkills.map(s => <span key={s} className="pdf-tag">{s}</span>)}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── WORKS BY CATEGORY ─── */}
        {groups.map((group, gIdx) => (
          <CategoryGroupRender key={group.categoryId ?? 'uncat'} group={group} groupIndex={gIdx} />
        ))}

        {/* ─── CLOSING ─── */}
        <section className="pdf-page pdf-closing">
          <div className="pdf-closing-inner">
            <div className="pdf-accent-bar" />
            <h2 className="pdf-closing-title">Let's work together.</h2>
            <p className="pdf-closing-sub">Tertarik kolaborasi atau punya project? Mari ngobrol.</p>
            <div className="pdf-closing-contact">
              {profile.email && <div><strong>Email</strong><span>{profile.email}</span></div>}
              {profile.linkedin && <div><strong>LinkedIn</strong><span>{cleanUrl(profile.linkedin)}</span></div>}
              {profile.instagram && <div><strong>Instagram</strong><span>{cleanUrl(profile.instagram)}</span></div>}
              {profile.tiktok && <div><strong>TikTok</strong><span>{cleanUrl(profile.tiktok)}</span></div>}
            </div>
            <p className="pdf-closing-thanks">Thank you for reading.</p>
          </div>
        </section>
      </div>

      <style>{PDF_STYLES}</style>
    </div>
  );
}

// ─── Category group renderer (divider + each work) ──────────────
function CategoryGroupRender({ group, groupIndex }: { group: CategoryGroup; groupIndex: number }) {
  return (
    <>
      {/* Section divider page */}
      <section className="pdf-page pdf-divider">
        <span className="pdf-divider-num">{String(groupIndex + 2).padStart(2, '0')}</span>
        <h2 className="pdf-divider-title">{group.categoryName}</h2>
        <p className="pdf-divider-count">
          {group.works.length} {group.works.length === 1 ? 'project' : 'projects'}
        </p>
        <div className="pdf-accent-bar pdf-divider-bar" />
      </section>

      {/* Each work */}
      {group.works.map(work => <WorkRender key={work.id} work={work} categoryName={group.categoryName} />)}
    </>
  );
}

// ─── Work renderer (hybrid single-page or multi-page) ──────────
function WorkRender({ work, categoryName }: { work: FeaturedWork; categoryName: string }) {
  // Collect all valid images: prefer photos[] array, fall back to photo_url
  const allImages = work.photos.length > 0 ? work.photos : (work.photo_url ? [work.photo_url] : []);
  const hasMulti = allImages.length >= 3;

  if (!hasMulti) {
    // ─── 1-2 images: single landscape page ───
    return (
      <section className="pdf-page pdf-work-page-single">
        <div className="pdf-work-corner-tag">{categoryName}</div>
        <div className="pdf-work-single-grid">
          <div className="pdf-work-images">
            {allImages.length === 0 ? (
              <div className="pdf-work-image-placeholder">No image</div>
            ) : allImages.length === 1 ? (
              <img src={allImages[0]} alt={work.title} className="pdf-work-image" crossOrigin="anonymous" />
            ) : (
              <div className="pdf-work-images-2">
                <img src={allImages[0]} alt={work.title} className="pdf-work-image" crossOrigin="anonymous" />
                <img src={allImages[1]} alt={work.title} className="pdf-work-image" crossOrigin="anonymous" />
              </div>
            )}
          </div>
          <aside className="pdf-work-meta">
            <div className="pdf-work-meta-head">
              <span className="pdf-work-side">{work.side === 'design' ? '🎨 Design' : '🏗️ Architecture'}</span>
              {work.year && <span className="pdf-work-year">{work.year}</span>}
            </div>
            <h3 className="pdf-work-title">{work.title}</h3>
            {work.description && <p className="pdf-work-desc">{work.description}</p>}
          </aside>
        </div>
      </section>
    );
  }

  // ─── 3+ images: multi-page (cover + gallery pages) ───
  const [hero, ...rest] = allImages;
  // Chunk rest into pages of 2 images each (landscape, side-by-side)
  const galleryPages: string[][] = [];
  for (let i = 0; i < rest.length; i += 2) {
    galleryPages.push(rest.slice(i, i + 2));
  }

  return (
    <>
      {/* Cover page: hero + meta */}
      <section className="pdf-page pdf-work-page-single">
        <div className="pdf-work-corner-tag">{categoryName}</div>
        <div className="pdf-work-single-grid">
          <div className="pdf-work-images">
            <img src={hero} alt={work.title} className="pdf-work-image" crossOrigin="anonymous" />
          </div>
          <aside className="pdf-work-meta">
            <div className="pdf-work-meta-head">
              <span className="pdf-work-side">{work.side === 'design' ? '🎨 Design' : '🏗️ Architecture'}</span>
              {work.year && <span className="pdf-work-year">{work.year}</span>}
            </div>
            <h3 className="pdf-work-title">{work.title}</h3>
            {work.description && <p className="pdf-work-desc">{work.description}</p>}
            <p className="pdf-work-imgcount">+{rest.length} more {rest.length === 1 ? 'image' : 'images'} →</p>
          </aside>
        </div>
      </section>

      {/* Gallery pages */}
      {galleryPages.map((imgs, pIdx) => (
        <section key={pIdx} className="pdf-page pdf-work-gallery">
          <div className="pdf-work-corner-tag">{work.title} — {pIdx + 1}/{galleryPages.length}</div>
          <div className={`pdf-gallery-grid ${imgs.length === 1 ? 'single' : 'double'}`}>
            {imgs.map((src, i) => (
              <img key={i} src={src} alt={`${work.title} ${pIdx * 2 + i + 2}`} className="pdf-gallery-image" crossOrigin="anonymous" />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

const PDF_STYLES = `
  /* ─── A4 LANDSCAPE: 297mm × 210mm ─── */
  .portfolio-pdf-root {
    background: #f5f5f7;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1d1d1f;
    -webkit-font-smoothing: antialiased;
  }

  /* Toolbar */
  .pdf-toolbar {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; gap: 12px;
    padding: 12px 24px;
    background: white;
    border-bottom: 1px solid #e5e5ea;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .toolbar-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px; font-weight: 500;
    background: white;
    border: 1px solid #d2d2d7;
    color: #1d1d1f;
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.15s ease;
  }
  .toolbar-btn:hover { opacity: 0.7; }
  .toolbar-btn.primary { background: #007AFF; border-color: #007AFF; color: white; }
  .pdf-hint {
    max-width: 1100px;
    margin: 16px auto;
    padding: 12px 16px;
    background: #fff8e6;
    border: 1px solid #ffd966;
    border-radius: 8px;
    font-size: 12.5px;
    color: #5d4500;
    line-height: 1.6;
  }

  /* Document */
  .pdf-document {
    max-width: 1100px;
    margin: 24px auto;
    padding-bottom: 80px;
  }

  /* PAGE: A4 landscape */
  .pdf-page {
    background: white;
    width: 297mm;
    min-height: 210mm;
    height: 210mm;
    padding: 18mm 22mm;
    margin: 0 auto 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    box-sizing: border-box;
    page-break-after: always;
    break-after: page;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .pdf-page:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  /* ─── COVER (landscape, photo left + name right) ─── */
  .pdf-cover {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 0;
    padding: 0;
    background: linear-gradient(135deg, #fafbff 0%, #ffffff 60%);
  }
  .pdf-cover-left {
    background: linear-gradient(135deg, #007AFF, #00c6ff);
    display: flex; align-items: center; justify-content: center;
    padding: 30mm;
  }
  .pdf-cover-photo {
    width: 140px; height: 140px;
    border-radius: 50%;
    object-fit: cover;
    border: 6px solid white;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  }
  .pdf-cover-placeholder {
    background: white;
    color: #007AFF;
    display: flex; align-items: center; justify-content: center;
    font-size: 64px; font-weight: 700;
  }
  .pdf-cover-right {
    padding: 30mm 28mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .pdf-accent-bar { width: 56px; height: 4px; background: #007AFF; border-radius: 2px; margin-bottom: 18px; }
  .pdf-cover-name {
    font-size: 56px; font-weight: 800; line-height: 1.05;
    letter-spacing: -0.02em; margin: 0 0 12px;
  }
  .pdf-cover-tagline { font-size: 18px; color: #6e6e73; margin: 0 0 36px; }
  .pdf-cover-contact { display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
  .pdf-cover-label {
    margin-top: auto; margin-bottom: 0;
    font-size: 11px; letter-spacing: 0.2em;
    color: #98989f; font-weight: 600;
  }

  /* ─── SECTION HEADER ─── */
  .pdf-section-header {
    display: flex; align-items: baseline; gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e5ea;
  }
  .pdf-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #007AFF; }
  .pdf-h2 { font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -0.02em; }
  .pdf-h3 {
    font-size: 11px; font-weight: 700; letter-spacing: 0.15em;
    text-transform: uppercase; color: #6e6e73; margin: 0 0 12px;
  }

  /* ─── ABOUT (landscape: 2 cols) ─── */
  .pdf-about-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 36px;
    flex: 1;
  }
  .pdf-bio p {
    font-size: 13px; line-height: 1.7;
    color: #1d1d1f; margin: 0 0 12px;
    text-align: justify; hyphens: auto;
  }
  .pdf-skills { display: flex; flex-direction: column; gap: 20px; }
  .pdf-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .pdf-tag {
    font-size: 11px; padding: 4px 10px;
    border-radius: 999px;
    background: #f0f4ff;
    color: #1d1d1f;
    border: 1px solid #d6e0ff;
  }
  .pdf-experience { margin-top: 24px; }
  .pdf-experience ul { list-style: none; padding: 0; margin: 0; }
  .pdf-experience li {
    margin-bottom: 12px; padding-bottom: 12px;
    border-bottom: 1px dashed #e5e5ea;
  }
  .pdf-experience li:last-child { border-bottom: none; }
  .pdf-exp-head { font-size: 13px; margin-bottom: 4px; display: flex; flex-wrap: wrap; gap: 6px; align-items: baseline; }
  .pdf-exp-period { margin-left: auto; font-size: 11px; color: #98989f; }
  .pdf-experience p { font-size: 12px; color: #6e6e73; margin: 0; line-height: 1.55; }

  /* ─── DIVIDER (full-page section cover) ─── */
  .pdf-divider {
    background: linear-gradient(135deg, #007AFF 0%, #5856d6 100%);
    color: white;
    align-items: flex-start;
    justify-content: center;
    padding: 30mm 30mm;
  }
  .pdf-divider-num {
    font-size: 13px;
    letter-spacing: 0.3em;
    font-weight: 700;
    opacity: 0.85;
  }
  .pdf-divider-title {
    font-size: 88px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    margin: 16px 0 12px;
    max-width: 80%;
  }
  .pdf-divider-count {
    font-size: 16px;
    opacity: 0.85;
    margin: 0;
  }
  .pdf-divider-bar { background: white; margin-top: 32px; }

  /* ─── WORK PAGE: SINGLE (1-2 images, landscape grid) ─── */
  .pdf-work-page-single { padding: 0; }
  .pdf-work-corner-tag {
    position: absolute; top: 12mm; right: 16mm;
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: #98989f;
  }
  .pdf-work-single-grid {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    height: 100%;
    width: 100%;
  }
  .pdf-work-images {
    background: #f5f5f7;
    overflow: hidden;
    display: flex;
  }
  .pdf-work-image { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pdf-work-image-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    color: #98989f; font-size: 12px;
  }
  .pdf-work-images-2 {
    width: 100%; height: 100%;
    display: grid; grid-template-rows: 1fr 1fr; gap: 1px;
  }
  .pdf-work-meta {
    padding: 24mm 18mm;
    display: flex; flex-direction: column; gap: 12px;
    overflow: hidden;
  }
  .pdf-work-meta-head {
    display: flex; gap: 12px; align-items: center;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: #6e6e73;
  }
  .pdf-work-side { color: #007AFF; }
  .pdf-work-title {
    font-size: 32px; font-weight: 700;
    letter-spacing: -0.01em; margin: 0;
    line-height: 1.1;
  }
  .pdf-work-desc {
    font-size: 12.5px; line-height: 1.65;
    color: #1d1d1f; margin: 0;
    text-align: justify; hyphens: auto;
    /* Keep description from overflowing the page */
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 14;
    -webkit-box-orient: vertical;
  }
  .pdf-work-imgcount {
    margin-top: auto;
    font-size: 11px;
    color: #007AFF;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  /* ─── WORK GALLERY (multi-page: 1-2 images per page) ─── */
  .pdf-work-gallery {
    padding: 12mm;
    background: #f5f5f7;
  }
  .pdf-gallery-grid {
    flex: 1;
    display: grid;
    gap: 8px;
  }
  .pdf-gallery-grid.single { grid-template-columns: 1fr; }
  .pdf-gallery-grid.double { grid-template-columns: 1fr 1fr; }
  .pdf-gallery-image {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    background: white;
  }

  /* ─── CLOSING ─── */
  .pdf-closing {
    background: linear-gradient(135deg, #fafbff 0%, #ffffff 60%);
    justify-content: center;
    align-items: center;
  }
  .pdf-closing-inner { max-width: 560px; }
  .pdf-closing-title {
    font-size: 56px; font-weight: 800;
    letter-spacing: -0.02em; margin: 16px 0 12px;
  }
  .pdf-closing-sub {
    font-size: 16px; color: #6e6e73; margin: 0 0 32px;
  }
  .pdf-closing-contact {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    margin-bottom: 40px;
  }
  .pdf-closing-contact > div { display: flex; flex-direction: column; gap: 2px; }
  .pdf-closing-contact strong {
    font-size: 10px; letter-spacing: 0.15em;
    text-transform: uppercase; color: #98989f; font-weight: 600;
  }
  .pdf-closing-contact span { font-size: 13px; color: #1d1d1f; }
  .pdf-closing-thanks {
    margin-top: 24px;
    font-size: 11px; letter-spacing: 0.2em;
    color: #98989f; font-weight: 600;
  }

  /* ─── PRINT STYLES ─── */
  @media print {
    @page { size: A4 landscape; margin: 0; }
    body { background: white !important; margin: 0; }
    .portfolio-pdf-root { background: white !important; }
    .pdf-toolbar, .pdf-hint { display: none !important; }
    .pdf-document { margin: 0 !important; padding: 0 !important; max-width: none; }
    .pdf-page {
      width: 100%;
      min-height: 100vh;
      height: 100vh;
      margin: 0;
      box-shadow: none;
      page-break-after: always;
      break-after: page;
    }
    .pdf-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
  }

  /* ─── On-screen mobile fallback ─── */
  @media screen and (max-width: 1100px) {
    .pdf-page {
      width: 100%;
      min-height: 0;
      height: auto;
      padding: 24px;
    }
    .pdf-cover, .pdf-work-single-grid, .pdf-about-grid {
      grid-template-columns: 1fr;
    }
    .pdf-cover-left { padding: 24px; }
    .pdf-cover-right { padding: 24px; }
    .pdf-cover-name { font-size: 36px; }
    .pdf-divider-title { font-size: 48px; }
    .pdf-closing-title { font-size: 36px; }
    .pdf-closing-contact { grid-template-columns: 1fr; }
    .pdf-work-meta { padding: 24px; }
    .pdf-work-images { min-height: 240px; }
  }
`;