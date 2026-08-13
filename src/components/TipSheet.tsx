import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Tip, TipCategory, TipKind, TipStatus } from '../types';
import { TIP_CATEGORIES, TIP_STATUSES } from '../types';
import './ui.css';

interface TipSheetProps {
  mode: 'create' | 'edit';
  tip?: Tip;
  defaultKind?: TipKind;
  defaultHeroId?: string | null;
  onClose: () => void;
  onSaved: (tip: Tip) => void;
  onDeleted?: (id: string) => void;
}

const STATUS_LABEL_CLASS: Record<TipStatus, string> = {
  LEARNING: 'status-learning',
  DRILLING: 'status-drilling',
  'LOCKED IN': 'status-locked-in',
};

export default function TipSheet({
  mode,
  tip,
  defaultKind = 'learning',
  defaultHeroId = null,
  onClose,
  onSaved,
  onDeleted,
}: TipSheetProps) {
  const kind: TipKind = tip?.kind ?? defaultKind;

  const [text, setText] = useState(tip?.text ?? '');
  const [category, setCategory] = useState<TipCategory>(tip?.category ?? TIP_CATEGORIES[0]);
  const [status, setStatus] = useState<TipStatus>(tip?.status ?? 'LEARNING');
  const [note, setNote] = useState(tip?.note ?? '');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!text.trim()) {
      setError('Tip text is required.');
      return;
    }
    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = {
      text: text.trim(),
      status,
      note: note.trim() || null,
    };
    if (kind === 'learning') payload.category = category;

    if (mode === 'create') {
      payload.kind = kind;
      payload.hero_id = defaultHeroId;
      if (kind === 'character') payload.category = 'Laning';
    }

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

        {kind === 'learning' && (
          <div style={{ marginBottom: 12 }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TipCategory)}
              style={{ width: '100%' }}
            >
              {TIP_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label>Tip</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's the tip?"
            style={{ fontSize: 16 }}
          />
        </div>

        <div className="field">
          <label>Status</label>
          <div className="status-btn-row">
            {TIP_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={`status-btn ${STATUS_LABEL_CLASS[s]}${status === s ? ' active' : ''}`}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {mode === 'edit' && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleDelete}
              disabled={deleting || saving}
              style={{ color: 'var(--rust)' }}
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
