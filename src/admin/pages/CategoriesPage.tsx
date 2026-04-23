import { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../lib/types';
import {
  Field,
  TextInput,
  PrimaryButton,
  DangerButton,
  PageHeader,
} from '../ui';

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState<'competition' | 'organization'>('competition');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('type')
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
    await supabase.from('categories').insert({ name: name.trim(), type });
    setName('');
    setSubmitting(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Items will keep their reference but show — as category.'))
      return;
    await supabase.from('categories').delete().eq('id', id);
    load();
  };

  const competitions = items.filter(i => i.type === 'competition');
  const organizations = items.filter(i => i.type === 'organization');

  return (
    <>
      <PageHeader
        title="Categories"
        description="Tags used to filter Competitions and Organizations."
      />

      <div className="glass rounded-2xl p-5 mb-6">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Add new</p>
        <div className="grid sm:grid-cols-[1fr_160px_auto] gap-3 items-end">
          <Field label="Name">
            <TextInput
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Hackathon"
            />
          </Field>
          <Field label="Type">
            <select
              value={type}
              onChange={e => setType(e.target.value as 'competition' | 'organization')}
              className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
            >
              <option value="competition">Competition</option>
              <option value="organization">Organization</option>
            </select>
          </Field>
          <PrimaryButton onClick={handleAdd} disabled={submitting || !name.trim()}>
            <span className="inline-flex items-center gap-1.5">
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add
            </span>
          </PrimaryButton>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          <CategoryList
            title="Competitions"
            items={competitions}
            onDelete={handleDelete}
          />
          <CategoryList
            title="Organizations"
            items={organizations}
            onDelete={handleDelete}
          />
        </div>
      )}
    </>
  );
}

function CategoryList({
  title,
  items,
  onDelete,
}: {
  title: string;
  items: Category[];
  onDelete: (id: string) => void;
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
          {items.map(c => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg glass"
            >
              <span className="text-sm text-[var(--text-primary)] truncate">{c.name}</span>
              <DangerButton onClick={() => onDelete(c.id)}>Delete</DangerButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
