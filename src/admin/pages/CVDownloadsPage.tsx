import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { CvDownload } from '../../lib/types';
import { PageHeader } from '../ui';

export default function CVDownloadsPage() {
  const [items, setItems] = useState<CvDownload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('cv_downloads')
        .select('*')
        .order('downloaded_at', { ascending: false });
      setItems((data as CvDownload[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const exportCsv = () => {
    const header = 'Name,Email,Downloaded at\n';
    const rows = items
      .map(
        i =>
          `"${i.name.replace(/"/g, '""')}","${i.email.replace(/"/g, '""')}","${new Date(
            i.downloaded_at
          ).toISOString()}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-downloads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="CV Downloads"
        description="Everyone who has submitted their details to download your CV."
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

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-[var(--text-secondary)]">
          No downloads yet.
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border)]">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Downloaded at</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr
                  key={i.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface)]"
                >
                  <td className="px-5 py-3 text-[var(--text-primary)]">{i.name}</td>
                  <td className="px-5 py-3 text-[var(--text-secondary)]">{i.email}</td>
                  <td className="px-5 py-3 text-[var(--text-secondary)]">
                    {new Date(i.downloaded_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
