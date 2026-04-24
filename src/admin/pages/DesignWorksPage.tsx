import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Plus } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import MultiPhotoUpload from '../components/MultiPhotoUpload';

interface Work { id: string; title: string; category_id: string | null; year: number | null; description: string | null; photo_url: string | null; photos: string[]; created_at: string; }
interface Cat { id: string; name: string; }

export default function DesignWorksPage() {
  const [items, setItems] = useState<Work[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: works }, { data: categories }] = await Promise.all([
      supabase.from('design_works').select('*').order('year', { ascending: false }),
      supabase.from('categories').select('id, name').eq('type', 'design_work').order('name'),
    ]);
    if (works) setItems(works as Work[]);
    if (categories) setCats(categories as Cat[]);
    setLoading(false);
  }

  async function add() {
    const { data } = await supabase.from('design_works').insert({ title: 'New Work' }).select().single();
    if (data) setItems(prev => [data as Work, ...prev]);
  }

  async function update(id: string, field: string, value: any) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    await supabase.from('design_works').update({ [field]: value }).eq('id', id);
  }

  async function remove(id: string) {
    if (!confirm('Hapus item ini?')) return;
    await supabase.from('design_works').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Design Works</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Portfolio ilustrasi, logo, branding, social media design, dll.</p>
        </div>
        <button onClick={add} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--accent)' }}>
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="space-y-6">
        {items.map(item => (
          <div key={item.id} className="glass rounded-xl p-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Judul</label>
                  <input type="text" value={item.title} onChange={e => update(item.id, 'title', e.target.value)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Kategori</label>
                  <select value={item.category_id ?? ''} onChange={e => update(item.id, 'category_id', e.target.value || null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none">
                    <option value="">— Pilih kategori —</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Buat kategori baru di menu Categories</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Tahun</label>
                  <input type="number" value={item.year ?? ''} onChange={e => update(item.id, 'year', e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60" placeholder="2024" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Deskripsi</label>
                  <textarea value={item.description ?? ''} onChange={e => update(item.id, 'description', e.target.value || null)} rows={3} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60" placeholder="Ceritain projectnya..." />
                </div>
              </div>

              <div className="space-y-4">
                <ImageUpload url={item.photo_url} onChange={url => update(item.id, 'photo_url', url)} folder="design-works" label="Cover Image" />
                <MultiPhotoUpload photos={item.photos ?? []} onChange={photos => update(item.id, 'photos', photos)} folder="design-works" label="Gallery (bisa multiple)" />
              </div>
            </div>

            <button onClick={() => remove(item.id)} className="mt-4 flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">Belum ada works. Klik "Tambah" untuk mulai.</p>
          </div>
        )}
      </div>
    </div>
  );
}