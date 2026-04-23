# Dual Portfolio — Design & Architecture

Personal portfolio website with **two switching sides**:
- 🎨 **Design & Illustration** — graphic design works, video content (autoplay), self-published zines
- 🏗️ **Architecture** — building design projects, gambar kerja (technical drawings), 3D walkthroughs

Built with React + Vite + Tailwind CSS + Supabase. Apple-inspired glass morphism UI with macOS-style dock navigation.

## Features

- **Side Switcher** — toggle between Design and Architecture portfolios
- **Video Gallery** — macOS window-style with autoplay on scroll
- **Drawing Viewer** — lightbox zoom for technical drawings
- **Zine Section** — showcase self-published works with page gallery
- **Admin Panel** — full CRUD for all content via `/admin`
- **Dark/Light mode** — system preference + manual toggle
- **Responsive** — dock on desktop, hamburger nav on mobile

## Setup

### 1. Clone & Install

```bash
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Create storage buckets: `photos`, `documents`, `videos` (all public)
4. Copy `.env.example` to `.env` and fill in your keys:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Admin Auth

Create a user in Supabase Dashboard > Authentication for admin access.

### 4. Run

```bash
npm run dev
```

- Public site: `http://localhost:5173`
- Admin panel: `http://localhost:5173/#/admin`

## Project Structure

```
src/
├── PublicSite.tsx          # Main layout with side switching
├── sections/
│   ├── Home.tsx            # Hero (adapts to active side)
│   ├── About.tsx           # Shared about section
│   ├── Experience.tsx      # Shared experience
│   ├── DesignWorks.tsx     # 🎨 Design portfolio grid
│   ├── DesignVideos.tsx    # 🎨 Video content gallery
│   ├── Zines.tsx           # 🎨 Self-published zines
│   ├── ArchWorks.tsx       # 🏗️ Architecture projects
│   ├── Drawings.tsx        # 🏗️ Gambar kerja
│   └── ArchVideos.tsx      # 🏗️ 3D walkthroughs
├── components/
│   ├── SideSwitcher.tsx    # Design ↔ Architecture toggle
│   ├── VideoGallery.tsx    # macOS-style video gallery
│   ├── DrawingViewer.tsx   # Technical drawing viewer + lightbox
│   ├── Dock.tsx            # macOS dock (desktop)
│   ├── Navbar.tsx          # Mobile navigation
│   ├── Footer.tsx          # Adaptive footer
│   ├── MacWindow.tsx       # macOS window chrome
│   ├── MacGallery.tsx      # Photo gallery in mac window
│   └── ...                 # Modals, filters, etc.
├── admin/
│   ├── AdminApp.tsx        # Admin router
│   └── pages/              # CRUD pages for each table
├── hooks/
│   ├── useTheme.ts
│   └── useScrollAnimation.ts
└── lib/
    ├── supabase.ts
    ├── types.ts
    └── useProfile.ts
```
