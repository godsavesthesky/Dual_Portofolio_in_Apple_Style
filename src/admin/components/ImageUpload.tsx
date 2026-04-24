import { useRef, useState } from 'react';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { uploadPhoto } from '../../lib/storage';

interface ImageUploadProps {
  url: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  label?: string;
}

export default function ImageUpload({ url, onChange, folder, label = 'Cover / Thumbnail' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await uploadPhoto(file, folder);
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
          <img src={url} alt="" className="w-full max-w-xs h-32 rounded-lg object-cover border border-[var(--border)]" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <div className="w-full max-w-xs h-32 rounded-lg border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 hover:border-[var(--accent)] transition-colors">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[var(--text-secondary)]" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-[var(--text-secondary)]" />
                <span className="text-xs text-[var(--text-secondary)]">Klik untuk upload</span>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}