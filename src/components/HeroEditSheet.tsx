import { useState } from 'react';
import type { Hero, HeroRole } from '../types';
import { HERO_ROLES } from '../types';
import HeroPortrait from './HeroPortrait';
import './ui.css';

interface HeroEditSheetProps {
  hero: Hero;
  onClose: () => void;
  onSaved: (hero: Hero) => void;
  uploadPortrait: (heroId: string, file: File) => Promise<string>;
  updateHero: (heroId: string, patch: Partial<Pick<Hero, 'role' | 'blurb'>>) => Promise<Hero>;
}

export default function HeroEditSheet({ hero, onClose, onSaved, uploadPortrait, updateHero }: HeroEditSheetProps) {
  const [role, setRole] = useState<HeroRole>(hero.role);
  const [blurb, setBlurb] = useState(hero.blurb ?? '');
  const [portraitUrl, setPortraitUrl] = useState(hero.portrait_url);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadPortrait(hero.id, file);
      setPortraitUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateHero(hero.id, { role, blurb: blurb.trim() || null });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save hero.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="page-header" style={{ marginBottom: 12 }}>
          <h2 className="page-title" style={{ fontSize: 17 }}>
            Edit {hero.name}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="field">
          <label>Photo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 64 }}>
              <HeroPortrait hero={{ ...hero, portrait_url: portraitUrl }} variant="tile" />
            </div>
            <label className="btn" style={{ cursor: 'pointer' }}>
              {uploading ? 'Uploading…' : 'Choose Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoFile}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className="field">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as HeroRole)}>
            {HERO_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Blurb</label>
          <textarea value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder="One or two sentences" />
        </div>

        {error && <div className="error-banner">{error}</div>}

        <button type="button" className="btn btn-primary btn-block" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
