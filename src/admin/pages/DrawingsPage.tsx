import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Plus } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import MultiPhotoUpload from '../components/MultiPhotoUpload';

interface Drawing { id: string; title: string; arch_work_id: string | null; drawing_type: string | null; image_url: string | null; photos: string[]; created_at: string; }
interface Work { id: string; title: string; }

export default function DrawingsPage() {
  const [items, setItems] = useState<Drawing[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const [{ data: drawings }, { data: aw }] = await Promise.all([
      supabase.from('drawings').select('*').order('created_at', { ascending: false }),
      supabase.from('arch_works').select('id, title').order('title'),
    ]);
    if (drawings) setItems(drawings as Drawing[]);
    if (aw) setWorks(aw as Work[]);
    setLoading(false);
  }
  async function add() { const { data } = await supabase.from('drawings').insert({ title: 'New Drawing' }).select().single(); if (data) setItems(prev => [data as Drawing, ...prev]); }
  async function update(id: string, field: string, value: any) { setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i)); await supabase.from('drawings').update({ [field]: value }).eq('id', id); }
  async function remove(id: string) { if (!confirm('Hapus?')) return; await supabase.from('drawings').delete().eq('id', id); setItems(prev => prev.filter(i => i.id !== id)); }

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Gambar Kerja</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Denah, potongan, tampak, detail — linked ke project arsitektur.</p>
        </div>
        <button onClick={add} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--accent)' }}><Plus className="w-4 h-4" /> Tambah</button>
      </div>
      <div className="space-y-6">
        {items.map(item => (
          <div key={item.id} className="glass rounded-xl p-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Judul</label><input type="text" value={item.title} onChange={e => update(item.id, 'title', e.target.value)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60" placeholder="Denah Lantai 1" /></div>
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Project</label>
                  <select value={item.arch_work_id ?? ''} onChange={e => update(item.id, 'arch_work_id', e.target.value || null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none">
                    <option value="">— Pilih project —</option>
                    {works.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                  </select>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Gambar ini akan muncul di dalam project yang dipilih</p>
                </div>
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Tipe Gambar</label><input type="text" value={item.drawing_type ?? ''} onChange={e => update(item.id, 'drawing_type', e.target.value || null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none" placeholder="Floor Plan / Section / Elevation / Detail" /></div>
              </div>
              <div className="space-y-4">
                <ImageUpload url={item.image_url} onChange={url => update(item.id, 'image_url', url)} folder="drawings" label="Gambar Utama" />
                <MultiPhotoUpload photos={item.photos ?? []} onChange={photos => update(item.id, 'photos', photos)} folder="drawings" label="Lembar Tambahan (opsional)" />
              </div>
            </div>
            <button onClick={() => remove(item.id)} className="mt-4 flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /> Hapus</button>
          </div>
        ))}
        {items.length === 0 && <div className="glass rounded-xl p-8 text-center"><p className="text-sm text-[var(--text-secondary)]">Belum ada gambar kerja.</p></div>}
      </div>
    </div>
  );
}