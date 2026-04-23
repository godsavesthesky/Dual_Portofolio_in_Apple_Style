import { useState } from 'react';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import { supabase } from '../lib/supabase';

interface CVDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvUrl: string | null;
}

export default function CVDownloadModal({ isOpen, onClose, cvUrl }: CVDownloadModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setEmail('');
    setDone(false);
    setError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cvUrl) {
      setError('CV file is not available yet. Please try again later.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertErr } = await supabase
        .from('cv_downloads')
        .insert({ name: name.trim(), email: email.trim() });

      if (insertErr) throw insertErr;

      // Trigger the download
      const a = document.createElement('a');
      a.href = cvUrl;
      a.download = 'CV.pdf';
      a.rel = 'noopener';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDone(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="download-cv" maxWidth="max-w-md">
      <div className="p-6">
        {done ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Download started
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Thanks! Your CV should start downloading in a moment.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'var(--accent)' }}
              >
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Download CV</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  A few details before you go
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'var(--accent)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Preparing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download CV
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
