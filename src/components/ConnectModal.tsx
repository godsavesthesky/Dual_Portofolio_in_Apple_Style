import { useState } from 'react';
import { Send, Loader2, CheckCircle2, Mail } from 'lucide-react';
import emailjs from '@emailjs/browser';
import Modal from './Modal';
import { useProfile } from '../lib/useProfile';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectModal({ isOpen, onClose }: ConnectModalProps) {
  const { profile } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName(''); setEmail(''); setSubject(''); setMessage('');
    setError(null); setSent(false); setSubmitting(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

    // Fallback: buka mailto kalau EmailJS belum dikonfigurasi
    if (!serviceId || !templateId || !publicKey) {
      const to = profile?.email ?? '';
      if (to) {
        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        window.open(
          `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
          '_blank'
        );
        setSent(true);
      } else {
        setError('Email service is not configured yet. Please contact the site owner directly.');
      }
      return;
    }

    setSubmitting(true);
    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: name,
          from_email: email,
          // "subject" sesuai template EmailJS field {{subject}}
          subject,
          message,
          // alias juga untuk template yang pakai {{name}} dan {{email}}
          name,
          email,
        },
        { publicKey }
      );
      setSent(true);
    } catch (err) {
      console.error(err);
      setError('Failed to send. Please try again or email me directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="connect" maxWidth="max-w-lg">
      <div className="p-6">
        {sent ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Message sent!</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Thanks for reaching out. I'll get back to you soon.
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
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Let's connect</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Drop a message and I'll reply via email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Name</label>
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
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60 resize-none"
                  placeholder="Write your message..."
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'var(--accent)' }}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send message</>
                )}
              </button>

              {/* Fallback langsung email kalau ada email di profile */}
              {profile?.email && (
                <p className="text-center text-xs text-[var(--text-secondary)]">
                  or email directly at{' '}
                  <a
                    href={`mailto:${profile.email}`}
                    className="underline hover:text-[var(--accent)] transition-colors"
                  >
                    <Mail className="w-3 h-3 inline mr-0.5" />
                    {profile.email}
                  </a>
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}