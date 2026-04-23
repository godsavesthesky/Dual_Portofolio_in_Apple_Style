interface FilterTabsProps {
  categories: { id: string; name: string }[];
  value: string | 'all';
  onChange: (v: string | 'all') => void;
}

export default function FilterTabs({ categories, value, onChange }: FilterTabsProps) {
  if (categories.length === 0) return null;

  const items = [{ id: 'all' as const, name: 'All' }, ...categories];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {items.map(c => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              active
                ? 'text-white shadow-sm'
                : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            style={active ? { background: 'var(--accent)' } : undefined}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
