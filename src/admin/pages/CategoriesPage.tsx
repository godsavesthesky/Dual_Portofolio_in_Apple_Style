import { useEffect, useState } from 'react';
import { Plus, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../lib/types';
import {
  Field,
  TextInput,
  PrimaryButton,
  DangerButton,
  PageHeader,
} from '../ui';

const CATEGORY_TYPES = [
  { value: 'design_work', label: 'Design Work', emoji: '🎨' },
  { value: 'arch_work', label: 'Architecture', emoji: '🏗️' },
  { value: 'zine', label: 'Zine', emoji: '📖' },
  { value: 'drawing', label: 'Drawing', emoji: '✏️' },
] as const;

type CategoryType = (typeof CATEGORY_TYPES)[number]['value'];

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('design_work');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('type')
      .order('display_order')
      .order('name');
    setItems((data as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    // Hitung display_order untuk kategori baru = max + 1 dari type yang sama
    const same = items.filter(i => i.type === type);
    const nextOrder = same.length === 0
      ? 0
      : Math.max(...same.map(s => s.display_order ?? 0)) + 1;
    const { error } = await supabase
      .from('categories')
      .insert({ name: name.trim(), type, display_order: nextOrder });
    if (error) alert(`Gagal: ${error.message}`);
    setName('');
    setSubmitting(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Items will keep their reference but show — as category.'))
      return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }
    load();
  };

  // Swap display_order dengan tetangga (move up/down)
  const handleMove = async (categoryId: string, direction: 'up' | 'down') => {
    const cur = items.find(i => i.id === categoryId);
    if (!cur) return;
    const sameType = items
      .filter(i => i.type === cur.type)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    const idx = sameType.findIndex(i => i.id === categoryId);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameType.length) return;
    const neighbor = sameType[swapIdx];
    const curOrder = cur.display_order ?? 0;
    const neighborOrder = neighbor.display_order ?? 0;

    // Optimistic update
    const prevItems = items;
    setItems(prev =>
      prev.map(i => {
        if (i.id === cur.id) return { ...i, display_order: neighborOrder };
        if (i.id === neighbor.id) return { ...i, display_order: curOrder };
        return i;
      })
    );

    // Persist
    const [r1, r2] = await Promise.all([
      supabase.from('categories').update({ display_order: neighborOrder }).eq('id', cur.id),
      supabase.from('categories').update({ display_order: curOrder }).eq('id', neighbor.id),
    ]);
    if (r1.error || r2.error) {
      alert(`Gagal reorder: ${r1.error?.message ?? r2.error?.message}`);
      setItems(prevItems);
      return;
    }
    load();
  };

  return (
    <>
      <PageHeader
        title="Categories"
        description="Kategori untuk Design Works, Architecture, Zines, dan Drawings. Pakai panah untuk atur urutan tampil di website & PDF."
      />

      <div className="glass rounded-2xl p-5 mb-6">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Add new</p>
        <div className="grid sm:grid-cols-[1fr_200px_auto] gap-3 items-end">
          <Field label="Name">
            <TextInput
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Social Media Design"
            />
          </Field>
          <Field label="Type">
            <select
              value={type}
              onChange={e => setType(e.target.value as CategoryType)}
              className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
            >
              {CATEGORY_TYPES.map(ct => (
                <option key={ct.value} value={ct.value}>
                  {ct.emoji} {ct.label}
                </option>
              ))}
            </select>
          </Field>
          <PrimaryButton onClick={handleAdd} disabled={submitting || !name.trim()}>
            <span className="inline-flex items-center gap-1.5">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </span>
          </PrimaryButton>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {CATEGORY_TYPES.map(ct => {
            const filtered = items
              .filter(i => i.type === ct.value)
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
            return (
              <CategoryList
                key={ct.value}
                title={`${ct.emoji} ${ct.label}`}
                items={filtered}
                onDelete={handleDelete}
                onMove={handleMove}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function CategoryList({
  title,
  items,
  onDelete,
  onMove,
}: {
  title: string;
  items: Category[];
  onDelete: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-3">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-[var(--text-secondary)]">No categories yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((c, idx) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg glass"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => onMove(c.id, 'up')}
                    disabled={idx === 0}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Pindah ke atas"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onMove(c.id, 'down')}
                    disabled={idx === items.length - 1}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Pindah ke bawah"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-sm text-[var(--text-primary)] truncate">{c.name}</span>
              </div>
              <DangerButton onClick={() => onDelete(c.id)}>Delete</DangerButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}