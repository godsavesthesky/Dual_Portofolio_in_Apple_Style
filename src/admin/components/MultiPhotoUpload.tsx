import { useRef, useState } from 'react';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { uploadPhoto } from '../../lib/storage';

interface MultiPhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  folder: string;
  label?: string;
}

export default function MultiPhotoUpload({
  photos,
  onChange,
  folder,
  label = 'Foto Dokumentasi',
}: MultiPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadPhoto(f, folder)));
      onChange([...photos, ...urls]);
    } catch {
      alert('Upload gagal, coba lagi.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = (i: number) => {
    const next = photos.filter((_, idx) => idx !== i);
    onChange(next);
  };

  return (
    <div>
      <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">{label}</p>

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {photos.map((url, i) => (
            <div key={i} className="relative group">
              <img
                src={url}
                alt=""
                className="w-16 h-16 rounded-lg object-cover border border-[var(--border)]"
              />
              <button
                onClick={() => remove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Hapus foto"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="cursor-pointer">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg glass text-xs font-medium text-[var(--text-primary)] hover:opacity-80 transition-opacity">
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5" />
          )}
          {uploading ? 'Uploading…' : 'Tambah foto'}
          <Upload className="w-3 h-3 opacity-50" />
        </span>
      </label>
      <p className="text-[10px] text-[var(--text-secondary)] mt-1">
        Bisa pilih beberapa foto sekaligus
      </p>
    </div>
  );
}
