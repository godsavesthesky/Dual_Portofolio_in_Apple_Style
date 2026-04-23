import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      <div
        className={`relative glass-heavy rounded-2xl w-full ${maxWidth} shadow-2xl animate-modal-in max-h-[90vh] flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        {/* macOS traffic lights */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all"
          />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <span className="w-3 h-3 rounded-full bg-[#28CA41]" />
          {title && (
            <span className="flex-1 text-center text-xs font-medium text-[var(--text-secondary)] select-none pr-8">
              {title}
            </span>
          )}
        </div>

        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
