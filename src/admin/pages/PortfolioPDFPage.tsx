import { useEffect, useState, useMemo } from 'react';
import { Printer, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../lib/useProfile';
import type { DesignWork, ArchWork, Experience } from '../../lib/types';

type Side = 'design' | 'arch' | 'both';

interface FeaturedWork {
  id: string;
  title: string;
  year: number | null;
  description: string | null;
  photo_url: string | null;
  side: 'design' | 'arch';
}

export default function PortfolioPDFPage() {
  const { profile } = useProfile();
  const [side, setSide] = useState<Side>('both');
  const [designWorks, setDesignWorks] = useState<DesignWork[]>([]);
  const [archWorks, setArchWorks] = useState<ArchWork[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: dw }, { data: aw }, { data: exp }] = await Promise.all([
        supabase.from('design_works').select('*').eq('featured', true).order('year', { ascending: false }),
        supabase.from('arch_works').select('*').eq('featured', true).order('year', { ascending: false }),
        supabase.from('experience').select('*').order('created_at', { ascending: false }),
      ]);
      if (dw) setDesignWorks(dw as DesignWork[]);
      if (aw) setArchWorks(aw as ArchWork[]);
      if (exp) setExperiences(exp as Experience[]);
      setLoading(false);
    })();
  }, []);

  const works: FeaturedWork[] = useMemo(() => {
    const designItems = designWorks.map(d => ({
      id: d.id, title: d.title, year: d.year, description: d.description,
      photo_url: d.photo_url, side: 'design' as const,
    }));
    const archItems = archWorks.map(a => ({
      id: a.id, title: a.title, year: a.year, description: a.description,
      photo_url: a.photo_url, side: 'arch' as const,
    }));
    if (side === 'design') return designItems;
    if (side === 'arch') return archItems;
    return [...designItems, ...archItems];
  }, [side, designWorks, archWorks]);

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

  const handlePrint = () => window.print();

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
        <button onClick={handlePrint} className="toolbar-btn primary">
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Hint banner */}
      <div className="pdf-hint print:hidden">
        💡 Klik <strong>Print / Save as PDF</strong> untuk download.
        Di dialog print, pilih <strong>"Save as PDF"</strong> sebagai destination.
        Biar header/footer browser ga muncul, uncheck "Headers and footers" di More settings.
        {works.length === 0 && (
          <div className="mt-2 text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            ⚠️ Belum ada karya yang ditandai <strong>Featured</strong>. Tandai dulu di admin (Design Works / Arch Projects) dengan checkbox "⭐ Featured".
          </div>
        )}
      </div>

      {/* ─── PDF CONTENT ─── */}
      <div className="pdf-document">
        {/* Page 1: Cover */}
        <section className="pdf-page pdf-cover">
          <div className="pdf-cover-inner">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={displayName} className="pdf-cover-photo" crossOrigin="anonymous" />
            ) : (
              <div className="pdf-cover-photo pdf-cover-placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
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

        {/* Page 2: About + Skills + Experience */}
        <section className="pdf-page">
          <header className="pdf-section-header">
            <span className="pdf-eyebrow">01</span>
            <h2 className="pdf-h2">About</h2>
          </header>

          {profile.bio && (
            <div className="pdf-bio">
              {profile.bio.split(/\n\s*\n/).filter(Boolean).map((p, i) => (
                <p key={i}>{p.trim()}</p>
              ))}
            </div>
          )}

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
        </section>

        {/* Pages 3+: Selected Works */}
        {works.length > 0 && (
          <section className="pdf-page">
            <header className="pdf-section-header">
              <span className="pdf-eyebrow">02</span>
              <h2 className="pdf-h2">Selected Works</h2>
            </header>
          </section>
        )}

        {works.map((work) => (
          <section key={work.id} className="pdf-page pdf-work-page">
            <div className="pdf-work-image-wrap">
              {work.photo_url ? (
                <img
                  src={work.photo_url}
                  alt={work.title}
                  className="pdf-work-image"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="pdf-work-image pdf-work-image-placeholder">No image</div>
              )}
            </div>
            <div className="pdf-work-meta">
              <div className="pdf-work-meta-head">
                <span className="pdf-work-side">
                  {work.side === 'design' ? '🎨 Design' : '🏗️ Architecture'}
                </span>
                {work.year && <span className="pdf-work-year">{work.year}</span>}
              </div>
              <h3 className="pdf-work-title">{work.title}</h3>
              {work.description && (
                <p className="pdf-work-desc">{work.description}</p>
              )}
            </div>
          </section>
        ))}

        {/* Closing page */}
        <section className="pdf-page pdf-closing">
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
        </section>
      </div>

      <style>{PDF_STYLES}</style>
    </div>
  );
}

function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

const PDF_STYLES = `
  /* ─── Reset for the PDF view ─── */
  .portfolio-pdf-root {
    background: #f5f5f7;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1d1d1f;
    -webkit-font-smoothing: antialiased;
  }

  /* ─── Toolbar ─── */
  .pdf-toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 24px;
    background: white;
    border-bottom: 1px solid #e5e5ea;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .toolbar-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    background: white;
    border: 1px solid #d2d2d7;
    color: #1d1d1f;
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.15s ease;
  }
  .toolbar-btn:hover { opacity: 0.7; }
  .toolbar-btn.primary {
    background: #007AFF;
    border-color: #007AFF;
    color: white;
  }
  .pdf-hint {
    max-width: 800px;
    margin: 16px auto;
    padding: 12px 16px;
    background: #fff8e6;
    border: 1px solid #ffd966;
    border-radius: 8px;
    font-size: 12.5px;
    color: #5d4500;
    line-height: 1.6;
  }

  /* ─── Document container ─── */
  .pdf-document {
    max-width: 800px;
    margin: 24px auto;
    padding-bottom: 80px;
  }

  /* ─── Pages ─── */
  .pdf-page {
    background: white;
    width: 210mm;
    min-height: 297mm;
    padding: 24mm 22mm;
    margin: 0 auto 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    box-sizing: border-box;
    page-break-after: always;
    break-after: page;
    display: flex;
    flex-direction: column;
  }
  .pdf-page:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  /* ─── Cover ─── */
  .pdf-cover {
    background: linear-gradient(135deg, #fafbff 0%, #ffffff 60%);
  }
  .pdf-cover-inner {
    margin: auto 0;
    text-align: left;
  }
  .pdf-cover-photo {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 32px;
    border: 3px solid #e5e5ea;
  }
  .pdf-cover-placeholder {
    background: linear-gradient(135deg, #007AFF, #00c6ff);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 48px;
    font-weight: 700;
  }
  .pdf-accent-bar {
    width: 56px;
    height: 4px;
    background: #007AFF;
    border-radius: 2px;
    margin-bottom: 18px;
  }
  .pdf-cover-name {
    font-size: 56px;
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 12px;
  }
  .pdf-cover-tagline {
    font-size: 18px;
    color: #6e6e73;
    margin: 0 0 36px;
    font-weight: 400;
  }
  .pdf-cover-contact {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    color: #1d1d1f;
  }
  .pdf-cover-label {
    margin-top: auto;
    margin-bottom: 0;
    font-size: 11px;
    letter-spacing: 0.2em;
    color: #98989f;
    font-weight: 600;
    align-self: flex-start;
  }

  /* ─── Section header ─── */
  .pdf-section-header {
    display: flex;
    align-items: baseline;
    gap: 16px;
    margin-bottom: 28px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e5ea;
  }
  .pdf-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: #007AFF;
  }
  .pdf-h2 {
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.02em;
  }
  .pdf-h3 {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #6e6e73;
    margin: 0 0 12px;
  }

  /* ─── Bio / About ─── */
  .pdf-bio p {
    font-size: 13.5px;
    line-height: 1.7;
    color: #1d1d1f;
    margin: 0 0 12px;
    text-align: justify;
    hyphens: auto;
  }

  /* ─── Skills ─── */
  .pdf-skills {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .pdf-skill-group {
    break-inside: avoid;
  }
  .pdf-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .pdf-tag {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #f0f4ff;
    color: #1d1d1f;
    border: 1px solid #d6e0ff;
  }

  /* ─── Experience ─── */
  .pdf-experience {
    margin-top: 28px;
  }
  .pdf-experience ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .pdf-experience li {
    margin-bottom: 14px;
    padding-bottom: 14px;
    border-bottom: 1px dashed #e5e5ea;
    break-inside: avoid;
  }
  .pdf-experience li:last-child { border-bottom: none; }
  .pdf-exp-head {
    font-size: 13px;
    margin-bottom: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: baseline;
  }
  .pdf-exp-period {
    margin-left: auto;
    font-size: 11px;
    color: #98989f;
  }
  .pdf-experience p {
    font-size: 12px;
    color: #6e6e73;
    margin: 0;
    line-height: 1.55;
  }

  /* ─── Work pages ─── */
  .pdf-work-page {
    padding: 0;
  }
  .pdf-work-image-wrap {
    height: 65%;
    flex-shrink: 0;
    overflow: hidden;
    background: #f5f5f7;
  }
  .pdf-work-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .pdf-work-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #98989f;
    font-size: 12px;
  }
  .pdf-work-meta {
    padding: 24mm 22mm;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .pdf-work-meta-head {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6e6e73;
  }
  .pdf-work-side {
    color: #007AFF;
  }
  .pdf-work-title {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0;
    line-height: 1.15;
  }
  .pdf-work-desc {
    font-size: 13px;
    line-height: 1.65;
    color: #1d1d1f;
    margin: 0;
    text-align: justify;
    hyphens: auto;
  }

  /* ─── Closing ─── */
  .pdf-closing {
    background: linear-gradient(135deg, #fafbff 0%, #ffffff 60%);
    justify-content: center;
  }
  .pdf-closing-title {
    font-size: 44px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 16px 0 12px;
  }
  .pdf-closing-sub {
    font-size: 15px;
    color: #6e6e73;
    margin: 0 0 32px;
  }
  .pdf-closing-contact {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 40px;
  }
  .pdf-closing-contact > div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .pdf-closing-contact strong {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #98989f;
    font-weight: 600;
  }
  .pdf-closing-contact span {
    font-size: 13px;
    color: #1d1d1f;
  }
  .pdf-closing-thanks {
    margin-top: auto;
    font-size: 11px;
    letter-spacing: 0.2em;
    color: #98989f;
    font-weight: 600;
  }

  /* ─── PRINT STYLES ─── */
  @media print {
    @page { size: A4; margin: 0; }
    body { background: white !important; margin: 0; }
    .portfolio-pdf-root { background: white !important; }
    .pdf-toolbar, .pdf-hint { display: none !important; }
    .pdf-document { margin: 0 !important; padding: 0 !important; max-width: none; }
    .pdf-page {
      width: 100%;
      min-height: 100vh;
      margin: 0;
      box-shadow: none;
      page-break-after: always;
      break-after: page;
    }
    .pdf-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .pdf-bio, .pdf-experience li, .pdf-skill-group, .pdf-work-page {
      break-inside: avoid;
    }
  }

  /* ─── Mobile responsive view ─── */
  @media screen and (max-width: 820px) {
    .pdf-page {
      width: 100%;
      min-height: 0;
      padding: 28px 24px;
    }
    .pdf-cover-name { font-size: 36px; }
    .pdf-h2 { font-size: 24px; }
    .pdf-skills { grid-template-columns: 1fr; }
    .pdf-closing-title { font-size: 28px; }
    .pdf-closing-contact { grid-template-columns: 1fr; }
    .pdf-work-meta { padding: 24px; }
  }
`;