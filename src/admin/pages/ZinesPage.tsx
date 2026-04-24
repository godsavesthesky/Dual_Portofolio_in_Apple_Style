import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Plus } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import MultiPhotoUpload from '../components/MultiPhotoUpload';

interface Zine { id: string; title: string; issue: string | null; year: number | null; cover_url: string | null; photos: string[]; description: string | null; page_count: number | null; pdf_url: string | null; created_at: string; }

export default function ZinesPage() {
  const [items, setItems] = useState<Zine[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() { setLoading(true); const { data } = await supabase.from('zines').select('*').order('year', { ascending: false }); if (data) setItems(data as Zine[]); setLoading(false); }
  async function add() {
    setAdding(true);
    const { data, error } = await supabase.from('zines').insert({ title: 'New Zine' }).select().single();
    if (error) {
      alert(`Gagal menambah: ${error.message}`);
      console.error('[Zines] insert error:', error);
    } else if (data) {
      setItems(prev => [data as Zine, ...prev]);
    }
    setAdding(false);
  }
  async function update(id: string, field: string, value: any) { setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i)); await supabase.from('zines').update({ [field]: value }).eq('id', id); }
  async function remove(id: string) { if (!confirm('Hapus?')) return; await supabase.from('zines').delete().eq('id', id); setItems(prev => prev.filter(i => i.id !== id)); }

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Zines</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Self-published works, zine collections.</p>
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
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Issue / Vol</label><input type="text" value={item.issue ?? ''} onChange={e => update(item.id, 'issue', e.target.value || null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none" placeholder="Vol. 1" /></div>
                  <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Tahun</label><input type="number" value={item.year ?? ''} onChange={e => update(item.id, 'year', e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none" placeholder="2024" /></div>
                </div>
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Jumlah Halaman</label><input type="number" value={item.page_count ?? ''} onChange={e => update(item.id, 'page_count', e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none" placeholder="24" /></div>
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Deskripsi</label><textarea value={item.description ?? ''} onChange={e => update(item.id, 'description', e.target.value || null)} rows={3} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] resize-none focus:outline-none" placeholder="Tentang zine ini..." /></div>
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Link PDF (opsional)</label><input type="text" value={item.pdf_url ?? ''} onChange={e => update(item.id, 'pdf_url', e.target.value || null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none" placeholder="https://..." /></div>
              </div>
              <div className="space-y-4">
                <ImageUpload url={item.cover_url} onChange={url => update(item.id, 'cover_url', url)} folder="zines" label="Cover Zine" />
                <MultiPhotoUpload photos={item.photos ?? []} onChange={photos => update(item.id, 'photos', photos)} folder="zines" label="Halaman Interior (opsional)" />
              </div>
            </div>
            <button onClick={() => remove(item.id)} className="mt-4 flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /> Hapus</button>
          </div>
        ))}
        {items.length === 0 && <div className="glass rounded-xl p-8 text-center"><p className="text-sm text-[var(--text-secondary)]">Belum ada zine.</p></div>}
      </div>
    </div>
  );
}