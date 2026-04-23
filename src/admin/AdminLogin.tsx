import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../hooks/useTheme';

export default function AdminLogin() {
  useTheme(); // ensures theme class is applied
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    // Auth state listener will flip the route.
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm glass-heavy rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <span className="w-3 h-3 rounded-full bg-[#28CA41]" />
          <span className="flex-1 text-center text-xs font-medium text-[var(--text-secondary)]">
            admin.login
          </span>
        </div>

        <div className="p-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto mb-4"
            style={{ background: 'var(--accent)' }}
          >
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] text-center mb-1">
            Admin Panel
          </h1>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
            Sign in to manage your portfolio
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
                placeholder="••••••••"
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
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-[11px] text-[var(--text-secondary)] text-center mt-5">
            Create an admin user in the Supabase dashboard (Authentication → Users).
          </p>
        </div>
      </div>
    </div>
  );
}
