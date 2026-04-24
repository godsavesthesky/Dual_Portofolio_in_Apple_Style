import { useState, useEffect, useRef } from 'react';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import { supabase } from '../lib/supabase';

interface CVDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvType: 'design' | 'arch';
  /** Kalau true, langsung download tanpa perlu klik tombol (setelah OAuth redirect) */
  autoDownload?: boolean;
}

export default function CVDownloadModal({ isOpen, onClose, cvType, autoDownload = false }: CVDownloadModalProps) {
  const [step, setStep] = useState<'login' | 'loading' | 'done' | 'error'>('login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const didAutoDownload = useRef(false);

  // Kalau modal dibuka dengan autoDownload=true, langsung cek session & download
  useEffect(() => {
    if (!isOpen || !autoDownload || didAutoDownload.current) return;
    didAutoDownload.current = true;
    doDownload();
  }, [isOpen, autoDownload]);

  // Reset state kalau modal ditutup
  useEffect(() => {
    if (!isOpen) {
      didAutoDownload.current = false;
    }
  }, [isOpen]);

  const handleClose = () => {
    setStep('login');
    setErrorMsg(null);
    onClose();
  };

  const handleGoogleLogin = async () => {
    setStep('loading');
    setErrorMsg(null);
    try {
      const redirectTo = `${window.location.origin}/?cv=${cvType}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
          scopes: 'email profile',
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Gagal login. Coba lagi.');
      setStep('error');
    }
  };

  /**
   * Trigger download dari URL dengan fetch → blob → createObjectURL.
   * Cara ini bypass cross-origin limitation pada attribute `download`,
   * dan memaksa browser untuk save file (bukan preview).
   */
  const triggerBlobDownload = async (fileUrl: string, filename: string) => {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Fetch gagal: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    // JANGAN pakai target="_blank" — bikin popup blocker jalan
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Bersihin blob URL setelah delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  const doDownload = async () => {
    setStep('loading');
    setErrorMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStep('login');
        return;
      }

      const { data: cvFile, error: fetchErr } = await supabase
        .from('cv_files')
        .select('file_url, label')
        .eq('cv_type', cvType)
        .single();

      if (fetchErr || !cvFile?.file_url) {
        throw new Error('File CV belum tersedia. Coba lagi nanti.');
      }

      // Log download dulu (biar ke-record meskipun user cancel di browser)
      const user = session.user;
      await supabase.from('cv_downloads').insert({
        cv_type: cvType,
        user_id: user.id,
        name: user.user_metadata?.full_name ?? user.email,
        email: user.email,
      });

      // Tentukan ekstensi dari URL (jangan hardcode .pdf — bisa jadi .docx)
      const urlPath = new URL(cvFile.file_url).pathname;
      const ext = urlPath.split('.').pop() || 'pdf';
      const filename = `CV_${cvType === 'design' ? 'Design' : 'Architecture'}.${ext}`;

      try {
        // Coba blob download dulu (paling reliable)
        await triggerBlobDownload(cvFile.file_url, filename);
      } catch (blobErr) {
        // Fallback: kalau fetch gagal (misal CORS block), buka di tab baru
        console.warn('Blob download gagal, fallback ke tab baru:', blobErr);
        window.open(cvFile.file_url, '_blank', 'noopener,noreferrer');
      }

      setStep('done');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Terjadi kesalahan. Coba lagi.');
      setStep('error');
    }
  };

  const cvLabel = cvType === 'design' ? 'CV Design' : 'CV Architecture';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="download-cv" maxWidth="max-w-md">
      <div className="p-6">

        {step === 'done' && (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Download started!</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{cvLabel} sedang didownload.</p>
            </div>
            <button onClick={handleClose} className="mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90" style={{ background: 'var(--accent)' }}>
              Close
            </button>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center py-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            <p className="text-sm text-[var(--text-secondary)]">Sebentar…</p>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <p className="text-sm text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">{errorMsg}</p>
            <button onClick={() => setStep('login')} className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90" style={{ background: 'var(--accent)' }}>
              Coba lagi
            </button>
          </div>
        )}

        {step === 'login' && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--accent)' }}>
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Download {cvLabel}</h3>
                <p className="text-xs text-[var(--text-secondary)]">Login dulu biar aku tau siapa yang minta 👀</p>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] glass text-sm font-medium text-[var(--text-primary)] hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-[11px] text-[var(--text-secondary)] text-center mt-3">
              Nama & email dari Google account kamu akan disimpan sebagai catatan download.
            </p>
          </>
        )}

      </div>
    </Modal>
  );
}