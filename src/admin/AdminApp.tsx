import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';

import ProfilePage from './pages/ProfilePage';
import CategoriesPage from './pages/CategoriesPage';
import ExperiencePage from './pages/ExperiencePage';
import CVDownloadsPage from './pages/CVDownloadsPage';
import DesignWorksPage from './pages/DesignWorksPage';
import DesignVideosPage from './pages/DesignVideosPage';
import ZinesPage from './pages/ZinesPage';
import PhotographyPage from './pages/PhotographyPage';
import ArchWorksPage from './pages/ArchWorksPage';
import DrawingsPage from './pages/DrawingsPage';
import ArchVideosPage from './pages/ArchVideosPage';
import VideoProjectsPage from './pages/VideoProjectsPage';
import PortfolioPDFPage from './pages/PortfolioPDFPage';

export default function AdminApp() {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--text-secondary)]">
        Loading…
      </div>
    );
  }

  // Authenticated but NOT an admin → reject. Sign them out so they don't keep
  // a session that could be exploited if RLS ever weakens.
  if (session && !isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-heavy rounded-2xl p-8 text-center">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Access denied
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Account ini bukan admin. Login dengan akun yang terdaftar di tabel <code>admins</code>.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.replace('/admin/login');
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/admin/profile" replace />} />
      {/* Standalone full-page route — no AdminLayout, so toolbar/sidebar don't intrude */}
      <Route path="portfolio-pdf" element={<PortfolioPDFPage />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/profile" replace />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="experience" element={<ExperiencePage />} />
        <Route path="cv-downloads" element={<CVDownloadsPage />} />
        <Route path="design-works" element={<DesignWorksPage />} />
        <Route path="design-videos" element={<DesignVideosPage />} />
        <Route path="video-projects" element={<VideoProjectsPage />} />
        <Route path="zines" element={<ZinesPage />} />
        <Route path="photography" element={<PhotographyPage />} />
        <Route path="arch-works" element={<ArchWorksPage />} />
        <Route path="drawings" element={<DrawingsPage />} />
        <Route path="arch-videos" element={<ArchVideosPage />} />
        <Route path="*" element={<Navigate to="/admin/profile" replace />} />
      </Route>
    </Routes>
  );
}