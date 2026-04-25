import { useEffect, useState } from 'react';
import { Download, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase, BUCKET_DOCS } from '../../lib/supabase';
import { PageHeader } from '../ui';

interface CvDownload {
  id: string;
  name: string | null;
  email: string | null;
  cv_type: 'design' | 'arch' | null;
  downloaded_at: string;
}

interface CvFile {
  id: string;
  cv_type: 'design' | 'arch';
  file_url: string | null;
  label: string | null;
  updated_at: string;
}

export default function CVDownloadsPage() {
  const [items, setItems]       = useState<CvDownload[]>([]);
  const [cvFiles, setCvFiles]   = useState<CvFile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState<'design' | 'arch' | null>(null);
  const [uploadOk, setUploadOk] = useState<'design' | 'arch' | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: downloads }, { data: files }] = await Promise.all([
      supabase.from('cv_downloads').select('*').order('downloaded_at', { ascending: false }),
      supabase.from('cv_files').select('*').order('cv_type'),
    ]);
    setItems((downloads as CvDownload[]) ?? []);
    setCvFiles((files as CvFile[]) ?? []);
    setLoading(false);
  }

  async function handleUpload(cvType: 'design' | 'arch', file: File) {
    setUploading(cvType);
    setUploadOk(null);
    try {
      const ext = file.name.split('.').pop();
      const path = `cv/cv_${cvType}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET_DOCS)
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET_DOCS).getPublicUrl(path);

      const { error: updateErr } = await supabase
        .from('cv_files')
        .update({ file_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('cv_type', cvType);
      if (updateErr) throw updateErr;

      setCvFiles(prev => prev.map(f => f.cv_type === cvType ? { ...f, file_url: publicUrl } : f));
      setUploadOk(cvType);
      setTimeout(() => setUploadOk(null), 3000);
    } catch (err: any) {
      alert(`Upload gagal: ${err.message}`);
    } finally {
      setUploading(null);
    }
  }

  const exportCsv = () => {
    const header = 'Name,Email,CV Type,Downloaded at\n';
    const rows = items
      .map(i =>
        `"${(i.name ?? '').replace(/"/g, '""')}","${(i.email ?? '').replace(/"/g, '""')}","${i.cv_type ?? ''}","${new Date(i.downloaded_at).toISOString()}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-downloads-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Some browsers cancel the download if we revoke too soon.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const badge = (type: string | null) =>
    type === 'design'
      ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium">Design</span>
      : type === 'arch'
      ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">Architecture</span>
      : <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-secondary)]">—</span>;

  return (
    <>
      <PageHeader
        title="CV Downloads"
        description="Upload file CV & lihat siapa aja yang sudah download."
        action={
          items.length > 0 && (
            <button
              onClick={exportCsv}
              className="px-4 py-2 rounded-lg text-sm font-medium glass text-[var(--text-primary)] hover:opacity-80 transition-opacity inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )
        }
      />

      {/* Upload CV Files */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {(['design', 'arch'] as const).map(type => {
          const cvFile = cvFiles.find(f => f.cv_type === type);
          const isUploading = uploading === type;
          const isOk = uploadOk === type;
          return (
            <div key={type} className="glass rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                {type === 'design' ? '🎨 CV Design' : '🏗️ CV Architecture'}
              </p>
              {cvFile?.file_url ? (
                <a
                  href={cvFile.file_url}
                  target="_blank"
                  rel="noopener"
                  className="text-xs text-[var(--accent)] underline truncate block mb-3"
                >
                  File tersimpan ✓
                </a>
              ) : (
                <p className="text-xs text-[var(--text-secondary)] mb-3">Belum ada file.</p>
              )}
              <label className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 text-white ${isUploading ? 'opacity-60 pointer-events-none' : ''}`} style={{ background: 'var(--accent)' }}>
                {isUploading ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</>
                ) : isOk ? (
                  <><CheckCircle2 className="w-3 h-3" /> Tersimpan!</>
                ) : (
                  <><Upload className="w-3 h-3" /> {cvFile?.file_url ? 'Ganti File' : 'Upload PDF'}</>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(type, f); e.target.value = ''; }}
                  disabled={isUploading}
                />
              </label>
            </div>
          );
        })}
      </div>

      {/* Download Log */}
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-3">
        Log Download ({items.length})
      </p>
      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-[var(--text-secondary)]">
          Belum ada yang download.
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border)]">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">CV</th>
                <th className="px-5 py-3 font-semibold">Downloaded at</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface)]">
                  <td className="px-5 py-3 text-[var(--text-primary)]">{i.name ?? '—'}</td>
                  <td className="px-5 py-3 text-[var(--text-secondary)]">{i.email ?? '—'}</td>
                  <td className="px-5 py-3">{badge(i.cv_type)}</td>
                  <td className="px-5 py-3 text-[var(--text-secondary)]">{new Date(i.downloaded_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}