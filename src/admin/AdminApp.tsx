import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';

import ProfilePage from './pages/ProfilePage';
import CategoriesPage from './pages/CategoriesPage';
import ExperiencePage from './pages/ExperiencePage';
import CVDownloadsPage from './pages/CVDownloadsPage';
import DesignWorksPage from './pages/DesignWorksPage';
import DesignVideosPage from './pages/DesignVideosPage';
import ZinesPage from './pages/ZinesPage';
import ArchWorksPage from './pages/ArchWorksPage';
import DrawingsPage from './pages/DrawingsPage';
import ArchVideosPage from './pages/ArchVideosPage';

export default function AdminApp() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--text-secondary)]">
        Loading…
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
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/profile" replace />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="experience" element={<ExperiencePage />} />
        <Route path="cv-downloads" element={<CVDownloadsPage />} />
        <Route path="design-works" element={<DesignWorksPage />} />
        <Route path="design-videos" element={<DesignVideosPage />} />
        <Route path="zines" element={<ZinesPage />} />
        <Route path="arch-works" element={<ArchWorksPage />} />
        <Route path="drawings" element={<DrawingsPage />} />
        <Route path="arch-videos" element={<ArchVideosPage />} />
        <Route path="*" element={<Navigate to="/admin/profile" replace />} />
      </Route>
    </Routes>
  );
}