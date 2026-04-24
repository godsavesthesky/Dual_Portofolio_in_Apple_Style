import { useEffect, useState } from 'react';
import { Upload, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadPhoto, uploadDocument } from '../../lib/storage';
import { refreshProfile } from '../../lib/useProfile';
import type { Profile } from '../../lib/types';
import { Field, TextInput, TextArea, PrimaryButton, PageHeader } from '../ui';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [skillsRaw, setSkillsRaw] = useState('');
  const [softwareSkillsRaw, setSoftwareSkillsRaw] = useState('');
  const [softSkillsRaw, setSoftSkillsRaw] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError(null);

      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        setLoadError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        const p = data as Profile;
        setProfile(p);
        setSkillsRaw((p.skills ?? []).join(', '));
        setSoftwareSkillsRaw((p.software_skills ?? []).join(', '));
        setSoftSkillsRaw((p.soft_skills ?? []).join(', '));
        setLoading(false);
        return;
      }

      const { data: inserted, error: insertError } = await supabase
        .from('profile')
        .insert({ name: '', tagline: '', bio: '' })
        .select()
        .single();

      if (insertError) {
        setLoadError(`Profile not found and could not be created: ${insertError.message}`);
      } else if (inserted) {
        setProfile(inserted as Profile);
        setSkillsRaw('');
        setSoftwareSkillsRaw('');
        setSoftSkillsRaw('');
      }

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] py-10">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading profile…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="glass rounded-2xl p-6 text-sm text-red-400">
        <p className="font-semibold mb-1">Failed to load profile</p>
        <p className="text-xs opacity-80">{loadError}</p>
        <p className="text-xs mt-3 text-[var(--text-secondary)]">
          Pastikan tabel <code>profile</code> sudah ada di Supabase dan RLS policy sudah benar.
          Kalau baru upgrade schema, jalankan dulu ALTER TABLE buat kolom{' '}
          <code>software_skills</code> dan <code>soft_skills</code>.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass rounded-2xl p-6 text-sm text-[var(--text-secondary)]">
        No profile found. Pastikan schema Supabase sudah di-run.
      </div>
    );
  }

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile(p => (p ? { ...p, [key]: value } : p));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadPhoto(file, 'profile');
      update('photo_url', url);
    } catch (err) {
      console.error(err);
      alert('Upload failed. Pastikan storage bucket "photos" sudah dibuat di Supabase.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    try {
      const url = await uploadDocument(file, 'cv');
      update('cv_url', url);
    } catch (err) {
      console.error(err);
      alert('Upload failed. Pastikan storage bucket "documents" sudah dibuat di Supabase.');
    } finally {
      setUploadingCv(false);
      e.target.value = '';
    }
  };

  const parseCSV = (raw: string) =>
    raw.split(',').map(s => s.trim()).filter(Boolean);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const skills = parseCSV(skillsRaw);
    const software_skills = parseCSV(softwareSkillsRaw);
    const soft_skills = parseCSV(softSkillsRaw);

    const { error } = await supabase
      .from('profile')
      .update({
        name: profile.name,
        tagline: profile.tagline,
        bio: profile.bio,
        photo_url: profile.photo_url,
        cv_url: profile.cv_url,
        linkedin: profile.linkedin,
        instagram: profile.instagram,
        tiktok: profile.tiktok,
        email: profile.email,
        skills,
        software_skills,
        soft_skills,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);
    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }
    setSaved(true);
    refreshProfile();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <PageHeader title="Profile" description="Manage your hero, bio, social links, and CV file." />

      <div className="space-y-6">
        {/* Photo + CV row */}
        <div className="glass rounded-2xl p-6 grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Profile photo</p>
            <div className="flex items-center gap-4">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border border-[var(--border)]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full glass" />
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg glass text-xs font-medium text-[var(--text-primary)] hover:opacity-80 transition-opacity">
                  {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload photo
                </span>
              </label>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">CV file</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 text-xs text-[var(--text-secondary)] truncate">
                {profile.cv_url ? (
                  <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] underline">
                    {profile.cv_url.split('/').pop()}
                  </a>
                ) : (
                  'No CV uploaded'
                )}
              </div>
              <label className="cursor-pointer">
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvUpload} />
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg glass text-xs font-medium text-[var(--text-primary)] hover:opacity-80 transition-opacity">
                  {uploadingCv ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload CV
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Basic info</h2>
          <Field label="Name">
            <TextInput value={profile.name ?? ''} onChange={e => update('name', e.target.value)} placeholder="Your full name" />
          </Field>
          <Field label="Tagline">
            <TextInput value={profile.tagline ?? ''} onChange={e => update('tagline', e.target.value)} placeholder="Short tagline shown on hero" />
          </Field>
          <Field label="Bio">
            <TextArea rows={5} value={profile.bio ?? ''} onChange={e => update('bio', e.target.value)} placeholder="Tell your story…" />
          </Field>
        </div>

        {/* Skills — split jadi 2 kategori */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Skills</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Pisahin pake koma. Kategori-kategori ini bakal tampil terpisah di halaman About.
            </p>
          </div>

          <Field label="Software Tools (comma-separated)">
            <TextInput
              value={softwareSkillsRaw}
              onChange={e => setSoftwareSkillsRaw(e.target.value)}
              placeholder="Adobe Photoshop, Adobe Illustrator, Figma, AutoCAD, SketchUp, Procreate"
            />
          </Field>

          <Field label="Soft Skills (comma-separated)">
            <TextInput
              value={softSkillsRaw}
              onChange={e => setSoftSkillsRaw(e.target.value)}
              placeholder="Teamwork, Communication, Problem Solving, Time Management"
            />
          </Field>

          {/* Legacy skills field — disembunyikan di UI tapi masih bisa dilihat kalau ada datanya */}
          {skillsRaw && (
            <details className="pt-2">
              <summary className="text-[11px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                Legacy skills (comma-separated)
              </summary>
              <div className="mt-2">
                <TextInput
                  value={skillsRaw}
                  onChange={e => setSkillsRaw(e.target.value)}
                  placeholder="(kosongkan kalau sudah pindah ke Software Tools / Soft Skills)"
                />
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                  Field ini dipakai dulu sebelum skills dipisah. Kalau Software Tools & Soft Skills
                  di atas sudah diisi, field ini akan diabaikan di halaman About.
                </p>
              </div>
            </details>
          )}
        </div>

        {/* Socials */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Social links</h2>
          <Field label="Contact email (used in footer & Connect)">
            <TextInput type="email" value={profile.email ?? ''} onChange={e => update('email', e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="LinkedIn URL">
            <TextInput value={profile.linkedin ?? ''} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" />
          </Field>
          <Field label="Instagram URL">
            <TextInput value={profile.instagram ?? ''} onChange={e => update('instagram', e.target.value)} placeholder="https://instagram.com/…" />
          </Field>
          <Field label="TikTok URL">
            <TextInput value={profile.tiktok ?? ''} onChange={e => update('tiktok', e.target.value)} placeholder="https://tiktok.com/@…" />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
            ) : (
              <span className="inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save changes</span>
            )}
          </PrimaryButton>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </div>
    </>
  );
}