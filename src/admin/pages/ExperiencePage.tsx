import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Plus } from 'lucide-react';

interface Exp { id: string; role: string; company: string | null; period: string | null; description: string | null; side: string; created_at: string; }

export default function ExperiencePage() {
  const [items, setItems] = useState<Exp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() { setLoading(true); const { data } = await supabase.from('experience').select('*').order('created_at', { ascending: false }); if (data) setItems(data as Exp[]); setLoading(false); }
  async function add() { const { data } = await supabase.from('experience').insert({ role: 'New Role' }).select().single(); if (data) setItems(prev => [data as Exp, ...prev]); }
  async function update(id: string, field: string, value: any) { setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i)); await supabase.from('experience').update({ [field]: value }).eq('id', id); }
  async function remove(id: string) { if (!confirm('Hapus?')) return; await supabase.from('experience').delete().eq('id', id); setItems(prev => prev.filter(i => i.id !== id)); }

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Experience</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Pengalaman kerja — bisa ditandai untuk sisi Design, Architecture, atau keduanya.</p>
        </div>
        <button onClick={add} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--accent)' }}><Plus className="w-4 h-4" /> Tambah</button>
      </div>
      <div className="space-y-6">
        {items.map(item => (
          <div key={item.id} className="glass rounded-xl p-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Jabatan / Role</label><input type="text" value={item.role} onChange={e => update(item.id, 'role', e.target.value)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60" /></div>
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Perusahaan / Studio</label><input type="text" value={item.company ?? ''} onChange={e => update(item.id, 'company', e.target.value || null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none" placeholder="Nama perusahaan" /></div>
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Periode</label><input type="text" value={item.period ?? ''} onChange={e => update(item.id, 'period', e.target.value || null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none" placeholder="2022 — Present" /></div>
              </div>
              <div className="space-y-3">
                <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Deskripsi</label><textarea value={item.description ?? ''} onChange={e => update(item.id, 'description', e.target.value || null)} rows={3} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] resize-none focus:outline-none" placeholder="Apa yang kamu kerjakan..." /></div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Tampilkan di sisi</label>
                  <select value={item.side} onChange={e => update(item.id, 'side', e.target.value)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none">
                    <option value="both">🎨🏗️ Keduanya</option>
                    <option value="design">🎨 Design saja</option>
                    <option value="arch">🏗️ Architecture saja</option>
                  </select>
                </div>
              </div>
            </div>
            <button onClick={() => remove(item.id)} className="mt-4 flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /> Hapus</button>
          </div>
        ))}
        {items.length === 0 && <div className="glass rounded-xl p-8 text-center"><p className="text-sm text-[var(--text-secondary)]">Belum ada experience.</p></div>}
      </div>
    </div>
  );
}