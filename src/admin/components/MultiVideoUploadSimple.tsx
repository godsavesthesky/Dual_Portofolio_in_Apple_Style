import { useState } from 'react';
import { Loader2, X, Plus } from 'lucide-react';
import { uploadVideo } from '../../lib/storage';

interface Props {
  videos: string[];
  onChange: (videos: string[]) => void;
  folder: string;
  label?: string;
}

export default function MultiVideoUploadSimple({ videos, onChange, folder, label = 'Video' }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadVideo(f, folder)));
      onChange([...videos, ...urls]);
    } catch {
      alert('Upload gagal, coba lagi.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = (i: number) => onChange(videos.filter((_, idx) => idx !== i));

  return (
    <div>
      <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">{label}</p>
      {videos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {videos.map((url, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden border border-[var(--border)] bg-black/10">
              <video src={url} className="w-full h-24 object-cover" muted playsInline />
              <button
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <p className="text-[10px] text-[var(--text-secondary)] px-2 py-1 truncate border-t border-[var(--border)]">
                Video {i + 1}
              </p>
            </div>
          ))}
        </div>
      )}
      <label className="cursor-pointer">
        <input type="file" accept="video/*" multiple className="hidden" onChange={handleFiles} />
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg glass text-xs font-medium text-[var(--text-primary)] hover:opacity-80 transition-opacity">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading…' : 'Tambah video'}
        </span>
      </label>
      <p className="text-[10px] text-[var(--text-secondary)] mt-1">Bisa pilih beberapa sekaligus</p>
    </div>
  );
}