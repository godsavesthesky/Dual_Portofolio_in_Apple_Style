import { useState } from 'react';
import { Loader2, X, Film } from 'lucide-react';
import { uploadVideo } from '../../lib/storage';

interface VideoUploadProps {
  url: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  label?: string;
}

export default function VideoUpload({ url, onChange, folder, label = 'Video' }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await uploadVideo(file, folder);
      onChange(publicUrl);
    } catch {
      alert('Upload gagal, coba lagi.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">{label}</p>
      {url ? (
        <div className="relative inline-block group">
          <video src={url} className="w-full max-w-xs h-32 rounded-lg object-cover border border-[var(--border)]" muted />
          <button
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <input type="file" accept="video/*" className="hidden" onChange={handleFile} />
          <div className="w-full max-w-xs h-32 rounded-lg border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 hover:border-[var(--accent)] transition-colors">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[var(--text-secondary)]" />
            ) : (
              <>
                <Film className="w-5 h-5 text-[var(--text-secondary)]" />
                <span className="text-xs text-[var(--text-secondary)]">Klik untuk upload video</span>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}