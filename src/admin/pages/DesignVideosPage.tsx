import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Plus } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import VideoUpload from '../components/VideoUpload';

interface Vid { id: string; title: string; design_work_id: string | null; video_type: string | null; video_url: string | null; thumbnail_url: string | null; description: string | null; year: number | null; created_at: string; }
interface Work { id: string; title: string; }

export default function DesignVideosPage() {
  const [items, setItems] = useState<Vid[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const [{ data: vids }, { data: dw }] = await Promise.all([
      supabase.from('design_videos').select('*').order('year', { ascending: false }),
      supabase.from('design_works').select('id, title').order('title'),
    ]);
    if (vids) setItems(vids as Vid[]);
    if (dw) setWorks(dw as Work[]);
    setLoading(false);
  }
  async function add() {
    setAdding(true);
    const { data, error } = await supabase.from('design_videos').insert({ title: 'New Video' }).select().single();
    if (error) {
      alert(`Gagal menambah: ${error.message}`);
      console.error('[DesignVideos] insert error:', error);
    } else if (data) {
      setItems(prev => [data as Vid, ...prev]);
    }
    setAdding(false);
  }
  async function update(id: string, field: string, value: any) { setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i)); await supabase.from('design_videos').update({ [field]: value }).eq('id', id); }
  async function remove(id: string) { if (!confirm('Hapus video ini?')) return; await supabase.from('design_videos').delete().eq('id', id); setItems(prev => prev.filter(i => i.id !== id)); }

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Design Videos</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Video konten, reels, motion graphics, dll.</p>
        </div>
        <button onClick={add} disabled={adding} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60" style={{ background: 'var(--accent)' }}>
          <Plus className="w-4 h-4" /> {adding ? 'Menambah…' : 'Tambah'}
        </button>
      </div>
      <div className="space-y-6">
        {items.map(item => (
          <div key={item.id} className="glass rounded-xl p-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Judul</label><input type="text" value={item.title} onChange={e => update(item.id, 'title', e.target.value)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60" /></div>
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Tipe Video</label><input type="text" value={item.video_type ?? ''} onChange={e => update(item.id, 'video_type', e.target.value || null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60" placeholder="Brand Video / Reels / Motion Graphics" /></div>
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Bagian dari Project (opsional)</label>
                  <select value={item.design_work_id ?? ''} onChange={e => update(item.id, 'design_work_id', e.target.value || null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none">
                    <option value="">— Berdiri sendiri —</option>
                    {works.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Tahun</label><input type="number" value={item.year ?? ''} onChange={e => update(item.id, 'year', e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none" placeholder="2024" /></div>
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Deskripsi</label><textarea value={item.description ?? ''} onChange={e => update(item.id, 'description', e.target.value || null)} rows={2} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] resize-none focus:outline-none" placeholder="Opsional" /></div>
              </div>
              <div className="space-y-4">
                <VideoUpload url={item.video_url} onChange={url => update(item.id, 'video_url', url)} folder="design-videos" label="Upload Video" />
                <ImageUpload url={item.thumbnail_url} onChange={url => update(item.id, 'thumbnail_url', url)} folder="design-videos" label="Thumbnail (opsional)" />
              </div>
            </div>
            <button onClick={() => remove(item.id)} className="mt-4 flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /> Hapus</button>
          </div>
        ))}
        {items.length === 0 && <div className="glass rounded-xl p-8 text-center"><p className="text-sm text-[var(--text-secondary)]">Belum ada video. Klik "Tambah" untuk mulai.</p></div>}
      </div>
    </div>
  );
}