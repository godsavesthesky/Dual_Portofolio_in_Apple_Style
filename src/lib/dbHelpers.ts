import { supabase } from './supabase';

/**
 * Safely update a row by id. If the server rejects the change, the previous
 * snapshot is restored in local state and an alert is shown.
 *
 * Usage:
 *   await safeUpdate('design_works', id, { title: 'Foo' }, prevSnapshot, setItems);
 */
export async function safeUpdate<T extends { id: string }>(
  table: string,
  id: string,
  patch: Record<string, unknown>,
  previousItems: T[],
  setItems: (items: T[]) => void,
  onError?: (msg: string) => void
): Promise<boolean> {
  const { error } = await supabase.from(table).update(patch).eq('id', id);
  if (error) {
    // Roll back
    setItems(previousItems);
    const msg = `Gagal menyimpan: ${error.message}`;
    if (onError) onError(msg);
    else alert(msg);
    console.error(`[safeUpdate ${table}]`, error);
    return false;
  }
  return true;
}

/**
 * Safely delete a row by id. Only mutates local state if the server confirms.
 */
export async function safeDelete<T extends { id: string }>(
  table: string,
  id: string,
  items: T[],
  setItems: (items: T[]) => void,
  onError?: (msg: string) => void
): Promise<boolean> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    const msg = `Gagal menghapus: ${error.message}`;
    if (onError) onError(msg);
    else alert(msg);
    console.error(`[safeDelete ${table}]`, error);
    return false;
  }
  setItems(items.filter(i => i.id !== id));
  return true;
}