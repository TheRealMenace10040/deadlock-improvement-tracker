import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Tip, TipCategory, TipStatus } from '../types';
import { TIP_CATEGORIES, TIP_STATUSES } from '../types';
import HeroIcon from './HeroIcon';
import './ui.css';

interface TipEditorSheetProps {
  mode: 'create' | 'edit';
  tip?: Tip;
  heroSuggestions: string[];
  iconMap: Map<string, string>;
  onClose: () => void;
  onSaved: (tip: Tip) => void;
  onDeleted?: (id: string) => void;
  upsertIcon: (name: string, file: File) => Promise<string>;
}

export default function TipEditorSheet({
  mode,
  tip,
  heroSuggestions,
  iconMap,
  onClose,
  onSaved,
  onDeleted,
  upsertIcon,
}: TipEditorSheetProps) {
  const [text, setText] = useState(tip?.text ?? '');
  const [category, setCategory] = useState<TipCategory>(tip?.category ?? TIP_CATEGORIES[0]);
  const [heroInput, setHeroInput] = useState(tip?.hero ?? '');
  const [source, setSource] = useState(tip?.source ?? '');
  const [status, setStatus] = useState<TipStatus>(tip?.status ?? 'Learning');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedHero = heroInput.trim();

  async function handleSave() {
    if (!text.trim()) {
      setError('Tip text is required.');
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      text: text.trim(),
      category,
      hero: trimmedHero || null,
      source: source.trim() || null,
      status,
    };

    const query =
      mode === 'create'
        ? supabase.from('tips').insert(payload).select().single()
        : supabase.from('tips').update(payload).eq('id', tip!.id).select().single();

    const { data, error: saveError } = await query;
    if (saveError || !data) {
      setError(saveError?.message ?? 'Failed to save tip.');
      setSaving(false);
      return;
    }

    onSaved(data as Tip);
    setSaving(false);
    onClose();
  }

  async function handleDelete() {
    if (!tip) return;
    if (!window.confirm('Delete this tip? This cannot be undone.')) return;
    setDeleting(true);
    setError(null);
    const { error: deleteError } = await supabase.from('tips').delete().eq('id', tip.id);
    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }
    onDeleted?.(tip.id);
    setDeleting(false);
    onClose();
  }

  async function handleIconFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!trimmedHero) {
      setError('Type a hero name before uploading an icon.');
      return;
    }
    setUploadingIcon(true);
    setError(null);
    try {
      await upsertIcon(trimmedHero, file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Icon upload failed.');
    } finally {
      setUploadingIcon(false);
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="page-header" style={{ marginBottom: 12 }}>
          <h2 className="page-title" style={{ fontSize: 17 }}>
            {mode === 'create' ? 'Add Tip' : 'Edit Tip'}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="field">
          <label>Tip</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What's the tip?" />
        </div>

        <div className="field">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as TipCategory)}>
            {TIP_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Hero (leave blank for a general tip)</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              list="hero-suggestions"
              value={heroInput}
              onChange={(e) => setHeroInput(e.target.value)}
              placeholder="e.g. Abrams"
              style={{ flex: 1 }}
            />
            <datalist id="hero-suggestions">
              {heroSuggestions.map((h) => (
                <option key={h} value={h} />
              ))}
            </datalist>
            {trimmedHero && (
              <>
                <HeroIcon name={trimmedHero} iconUrl={iconMap.get(trimmedHero)} size={28} />
                <label className="icon-btn" title="Upload icon for this hero">
                  {uploadingIcon ? '…' : '📷'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconFile}
                    style={{ display: 'none' }}
                    disabled={uploadingIcon}
                  />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="field">
          <label>Source</label>
          <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Optional" />
        </div>

        <div className="field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as TipStatus)}>
            {TIP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {mode === 'edit' && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleDelete}
              disabled={deleting || saving}
              style={{ color: 'var(--danger)' }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleSave}
            disabled={saving || deleting}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
