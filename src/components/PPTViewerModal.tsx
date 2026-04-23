import Modal from './Modal';

interface PPTViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null;
  type: 'upload' | 'embed' | null;
  title?: string;
}

/**
 * Converts a Google Slides share URL into its /embed form if needed.
 * Accepts either a raw embed URL or a regular /edit URL and normalises it.
 */
function normaliseSlidesUrl(url: string) {
  if (!url) return url;
  if (url.includes('/embed')) return url;
  // Transform .../presentation/d/XYZ/edit?... -> .../presentation/d/XYZ/embed
  const m = url.match(/(https:\/\/docs\.google\.com\/presentation\/d\/[^/]+)\/?/);
  if (m) return `${m[1]}/embed?start=false&loop=false&delayms=3000`;
  return url;
}

export default function PPTViewerModal({
  isOpen,
  onClose,
  url,
  type,
  title,
}: PPTViewerModalProps) {
  if (!url) return null;

  const isPdf = type === 'upload' && url.toLowerCase().endsWith('.pdf');
  const iframeSrc =
    type === 'embed'
      ? normaliseSlidesUrl(url)
      : isPdf
      ? url
      : // Use Microsoft Office online viewer for .ppt/.pptx
        `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title ?? 'viewer'} maxWidth="max-w-5xl">
      <div className="p-4">
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/60">
          <iframe
            src={iframeSrc}
            title={title ?? 'Document viewer'}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
        <div className="flex justify-end mt-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            Open in new tab ↗
          </a>
        </div>
      </div>
    </Modal>
  );
}
