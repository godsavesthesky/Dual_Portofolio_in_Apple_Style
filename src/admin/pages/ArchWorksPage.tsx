import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Plus } from 'lucide-react';

interface Item { id: string; [key: string]: any; }

export default function ArchWorksPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const table = 'arch_works';

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  async function addItem() {
    const defaults: any = {};
    if (table === 'experience') defaults.role = 'New Role';
    else defaults.title = 'New Item';
    const { data } = await supabase.from(table).insert(defaults).select().single();
    if (data) setItems(prev => [data, ...prev]);
  }

  async function updateItem(id: string, field: string, value: any) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    await supabase.from(table).update({ [field]: value }).eq('id', id);
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this item?')) return;
    await supabase.from(table).delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Arch Projects</h2>
        <button onClick={addItem} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--accent)' }}>
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="glass rounded-xl p-4">
            <div className="grid gap-3">
              {Object.keys(item).filter(k => !['id','created_at','updated_at','photos'].includes(k)).map(key => (
                <div key={key}>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                  {key === 'description' ? (
                    <textarea value={item[key] ?? ''} onChange={e => updateItem(item.id, key, e.target.value || null)} rows={3} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60" />
                  ) : key === 'side' ? (
                    <select value={item[key] ?? 'both'} onChange={e => updateItem(item.id, key, e.target.value)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none">
                      <option value="both">Both</option>
                      <option value="design">Design</option>
                      <option value="arch">Architecture</option>
                    </select>
                  ) : key === 'year' || key === 'page_count' ? (
                    <input type="number" value={item[key] ?? ''} onChange={e => updateItem(item.id, key, e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60" />
                  ) : (
                    <input type="text" value={item[key] ?? ''} onChange={e => updateItem(item.id, key, e.target.value || null)} className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60" placeholder={key.replace(/_/g, ' ')} />
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => deleteItem(item.id)} className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No items yet. Click "Add New" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
