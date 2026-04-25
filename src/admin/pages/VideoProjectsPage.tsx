import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import MultiVideoUpload from '../components/MultiVideoUpload';

interface VideoProject {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  side: string;
  year: number | null;
  created_at: string;
}

interface VideoItem {
  id: string;
  project_id: string;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  sort_order: number;
}

export default function VideoProjectsPage() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [videoItems, setVideoItems] = useState<Record<string, VideoItem[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: projs } = await supabase
      .from('video_projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (projs) {
      setProjects(projs as VideoProject[]);
      // Load all video items untuk semua projects sekaligus
      const ids = projs.map((p: VideoProject) => p.id);
      if (ids.length > 0) {
        const { data: vids } = await supabase
          .from('video_items')
          .select('*')
          .in('project_id', ids)
          .order('sort_order');
        if (vids) {
          const grouped: Record<string, VideoItem[]> = {};
          for (const v of vids as VideoItem[]) {
            if (!grouped[v.project_id]) grouped[v.project_id] = [];
            grouped[v.project_id].push(v);
          }
          setVideoItems(grouped);
        }
      }
    }
    setLoading(false);
  }

  async function refreshItems(projectId: string) {
    const { data } = await supabase
      .from('video_items')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order');
    setVideoItems(prev => ({ ...prev, [projectId]: (data as VideoItem[]) ?? [] }));
  }

  async function add() {
    setAdding(true);
    const { data, error } = await supabase
      .from('video_projects')
      .insert({ title: 'New Video Project', side: 'both' })
      .select()
      .single();
    if (error) {
      alert(`Gagal: ${error.message}`);
    } else if (data) {
      setProjects(prev => [data as VideoProject, ...prev]);
      setVideoItems(prev => ({ ...prev, [data.id]: [] }));
      setExpanded(prev => new Set([...prev, data.id]));
    }
    setAdding(false);
  }

  async function update(id: string, field: string, value: any) {
    const prev = projects;
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
    const { error } = await supabase.from('video_projects').update({ [field]: value }).eq('id', id);
    if (error) {
      alert(`Gagal menyimpan: ${error.message}`);
      setProjects(prev);
    }
  }

  async function remove(id: string) {
    if (!confirm('Hapus folder video ini beserta semua videonya?')) return;
    const { error } = await supabase.from('video_projects').delete().eq('id', id);
    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }
    setProjects(prev => prev.filter(p => p.id !== id));
    setVideoItems(prev => { const n = { ...prev }; delete n[id]; return n; });
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Video Projects</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Folder video — satu project bisa berisi beberapa video. Bisa ditampilkan di Design, Architecture, atau keduanya.
          </p>
        </div>
        <button
          onClick={add}
          disabled={adding}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
          style={{ background: 'var(--accent)' }}
        >
          <Plus className="w-4 h-4" /> {adding ? 'Menambah…' : 'Tambah Folder'}
        </button>
      </div>

      <div className="space-y-4">
        {projects.map(proj => {
          const isOpen = expanded.has(proj.id);
          const items = videoItems[proj.id] ?? [];

          return (
            <div key={proj.id} className="glass rounded-xl overflow-hidden">
              {/* Header folder */}
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleExpand(proj.id)}
              >
                <div className="text-2xl select-none">📁</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{proj.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {items.length} video · {proj.side === 'both' ? 'Keduanya' : proj.side === 'design' ? 'Design' : 'Architecture'}
                    {proj.year ? ` · ${proj.year}` : ''}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                )}
              </div>

              {/* Detail panel */}
              {isOpen && (
                <div className="border-t border-[var(--border)] p-5 space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Left col */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Nama Folder / Project</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={e => update(proj.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Deskripsi (opsional)</label>
                        <textarea
                          value={proj.description ?? ''}
                          onChange={e => update(proj.id, 'description', e.target.value || null)}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] resize-none focus:outline-none"
                          placeholder="Event, project, atau konteks video ini…"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Tahun</label>
                          <input
                            type="number"
                            value={proj.year ?? ''}
                            onChange={e => update(proj.id, 'year', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none"
                            placeholder="2024"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Tampilkan di sisi</label>
                          <select
                            value={proj.side}
                            onChange={e => update(proj.id, 'side', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] focus:outline-none"
                          >
                            <option value="both">🎨🏗️ Keduanya</option>
                            <option value="design">🎨 Design saja</option>
                            <option value="arch">🏗️ Architecture saja</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right col - cover */}
                    <div>
                      <ImageUpload
                        url={proj.cover_url}
                        onChange={url => update(proj.id, 'cover_url', url)}
                        folder="video-projects"
                        label="Cover Folder (opsional)"
                      />
                    </div>
                  </div>

                  {/* Video items */}
                  <div className="border-t border-[var(--border)] pt-4">
                    <MultiVideoUpload
                      projectId={proj.id}
                      items={items}
                      onRefresh={() => refreshItems(proj.id)}
                    />
                  </div>

                  <button
                    onClick={() => remove(proj.id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus folder ini
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">Belum ada video project. Klik "Tambah Folder" untuk mulai.</p>
          </div>
        )}
      </div>
    </div>
  );
}