import { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import { useAuth } from './useAuth';

// Admin pages
import ProfilePage from './pages/ProfilePage';
import CategoriesPage from './pages/CategoriesPage';
import DesignWorksPage from './pages/DesignWorksPage';
import DesignVideosPage from './pages/DesignVideosPage';
import ZinesPage from './pages/ZinesPage';
import ArchWorksPage from './pages/ArchWorksPage';
import DrawingsPage from './pages/DrawingsPage';
import ArchVideosPage from './pages/ArchVideosPage';
import ExperiencePage from './pages/ExperiencePage';
import CVDownloadsPage from './pages/CVDownloadsPage';

const pages = [
  { id: 'profile', label: 'Profile', group: 'General' },
  { id: 'categories', label: 'Categories', group: 'General' },
  { id: 'design-works', label: 'Design Works', group: '🎨 Design' },
  { id: 'design-videos', label: 'Design Videos', group: '🎨 Design' },
  { id: 'zines', label: 'Zines', group: '🎨 Design' },
  { id: 'arch-works', label: 'Arch Projects', group: '🏗️ Architecture' },
  { id: 'drawings', label: 'Drawings', group: '🏗️ Architecture' },
  { id: 'arch-videos', label: 'Arch Videos', group: '🏗️ Architecture' },
  { id: 'experience', label: 'Experience', group: 'General' },
  { id: 'cv-downloads', label: 'CV Downloads', group: 'General' },
];

export default function AdminApp() {
  const { session, loading } = useAuth();
  const [activePage, setActivePage] = useState('profile');

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)] text-sm">Loading…</p>
      </div>
    );
  }

  if (!session) return <AdminLogin />;

  const renderPage = () => {
    switch (activePage) {
      case 'profile': return <ProfilePage />;
      case 'categories': return <CategoriesPage />;
      case 'design-works': return <DesignWorksPage />;
      case 'design-videos': return <DesignVideosPage />;
      case 'zines': return <ZinesPage />;
      case 'arch-works': return <ArchWorksPage />;
      case 'drawings': return <DrawingsPage />;
      case 'arch-videos': return <ArchVideosPage />;
      case 'experience': return <ExperiencePage />;
      case 'cv-downloads': return <CVDownloadsPage />;
      default: return <ProfilePage />;
    }
  };

  return (
    <AdminLayout pages={pages} activePage={activePage} onPageChange={setActivePage}>
      {renderPage()}
    </AdminLayout>
  );
}
