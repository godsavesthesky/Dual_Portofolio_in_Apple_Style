import { useState } from 'react';
import { Loader2, X, Film, Plus } from 'lucide-react';
import { uploadVideo } from '../../lib/storage';
import { supabase } from '../../lib/supabase';

interface VideoItem {
  id: string;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  sort_order: number;
}

interface Props {
  projectId: string;
  items: VideoItem[];
  onRefresh: () => void;
}

export default function MultiVideoUpload({ projectId, items, onRefresh }: Props) {
  const [uploading, setUploading] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadVideo(file, 'video-projects');
        await supabase.from('video_items').insert({
          project_id: projectId,
          title: file.name.replace(/\.[^.]+$/, ''),
          video_url: url,
          sort_order: items.length + i,
        });
      }
      onRefresh();
    } catch {
      alert('Upload gagal, coba lagi.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const updateTitle = async (id: string, title: string) => {
    await supabase.from('video_items').update({ title }).eq('id', id);
    setEditingTitle(null);
    onRefresh();
  };

  const removeItem = async (id: string) => {
    if (!confirm('Hapus video ini?')) return;
    await supabase.from('video_items').delete().eq('id', id);
    onRefresh();
  };

  return (
    <div>
      <p className="text-xs font-medium text-[var(--text-secondary)] mb-3">
        Video dalam folder ini ({items.length})
      </p>

      {/* Grid video */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {items.map(item => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-[var(--border)] bg-black/10">
              {item.video_url ? (
                <video
                  src={item.video_url}
                  className="w-full h-24 object-cover"
                  muted
                  playsInline
                />
              ) : (
                <div className="w-full h-24 flex items-center justify-center">
                  <Film className="w-6 h-6 text-[var(--text-secondary)]" />
                </div>
              )}

              {/* Hapus button */}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Title editable */}
              {editingTitle === item.id ? (
                <input
                  autoFocus
                  defaultValue={item.title}
                  onBlur={e => updateTitle(item.id, e.target.value || item.title)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') updateTitle(item.id, (e.target as HTMLInputElement).value || item.title);
                    if (e.key === 'Escape') setEditingTitle(null);
                  }}
                  className="w-full px-2 py-1 text-[10px] bg-[var(--bg)] text-[var(--text-primary)] border-t border-[var(--border)] focus:outline-none"
                />
              ) : (
                <div
                  onClick={() => setEditingTitle(item.id)}
                  className="px-2 py-1 text-[10px] text-[var(--text-secondary)] truncate cursor-text hover:text-[var(--text-primary)] transition-colors border-t border-[var(--border)]"
                  title={item.title}
                >
                  {item.title}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <label className="cursor-pointer">
        <input
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg glass text-xs font-medium text-[var(--text-primary)] hover:opacity-80 transition-opacity">
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          {uploading ? 'Uploading…' : 'Tambah video'}
        </span>
      </label>
      <p className="text-[10px] text-[var(--text-secondary)] mt-1">Bisa pilih beberapa video sekaligus</p>
    </div>
  );
}