import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { PerformanceLogEntry, Tip } from '../types';
import '../components/ui.css';

export default function PerformanceLog() {
  const [entries, setEntries] = useState<PerformanceLogEntry[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [wentWell, setWentWell] = useState('');
  const [wentPoorly, setWentPoorly] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [selectedTipIds, setSelectedTipIds] = useState<string[]>([]);
  const [tagOpen, setTagOpen] = useState(false);
  const [tipSearch, setTipSearch] = useState('');

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    const [logRes, tagsRes, tipsRes] = await Promise.all([
      supabase.from('performance_log').select('*').order('created_at', { ascending: false }),
      supabase.from('performance_log_tips').select('*'),
      supabase.from('tips').select('*'),
    ]);
    if (logRes.error) setError(logRes.error.message);
    if (tipsRes.data) setTips(tipsRes.data as Tip[]);

    if (logRes.data) {
      const tagMap = new Map<string, string[]>();
      (tagsRes.data ?? []).forEach((row: any) => {
        const list = tagMap.get(row.performance_log_id) ?? [];
        list.push(row.tip_id);
        tagMap.set(row.performance_log_id, list);
      });
      const merged = (logRes.data as PerformanceLogEntry[]).map((e) => ({
        ...e,
        tip_ids: tagMap.get(e.id) ?? [],
      }));
      setEntries(merged);
    }
    setLoading(false);
  }

  const tipsById = useMemo(() => {
    const m = new Map<string, Tip>();
    tips.forEach((t) => m.set(t.id, t));
    return m;
  }, [tips]);

  const filteredTips = useMemo(() => {
    const q = tipSearch.trim().toLowerCase();
    if (!q) return tips.slice(0, 8);
    return tips.filter((t) => t.text.toLowerCase().includes(q) || t.hero?.toLowerCase().includes(q)).slice(0, 8);
  }, [tips, tipSearch]);

  function toggleTip(id: string) {
    setSelectedTipIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function submit() {
    if (!wentWell.trim() && !wentPoorly.trim() && !keyTakeaway.trim()) return;
    setSaving(true);
    setError(null);
    const { data, error } = await supabase
      .from('performance_log')
      .insert({
        went_well: wentWell.trim() || null,
        went_poorly: wentPoorly.trim() || null,
        key_takeaway: keyTakeaway.trim() || null,
      })
      .select()
      .single();

    if (error || !data) {
      setError(error?.message ?? 'Failed to save entry');
      setSaving(false);
      return;
    }

    if (selectedTipIds.length > 0) {
      const rows = selectedTipIds.map((tip_id) => ({ performance_log_id: data.id, tip_id }));
      const { error: tagError } = await supabase.from('performance_log_tips').insert(rows);
      if (tagError) setError(tagError.message);
    }

    setWentWell('');
    setWentPoorly('');
    setKeyTakeaway('');
    setSelectedTipIds([]);
    setTagOpen(false);
    setTipSearch('');
    setSaving(false);
    void load();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Performance <span className="accent">Log</span>
        </h1>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="field">
          <label>What went well</label>
          <textarea value={wentWell} onChange={(e) => setWentWell(e.target.value)} placeholder="Good reads, clean rotations, farm..." />
        </div>
        <div className="field">
          <label>What went poorly</label>
          <textarea value={wentPoorly} onChange={(e) => setWentPoorly(e.target.value)} placeholder="Mistakes, deaths, missed calls..." />
        </div>
        <div className="field">
          <label>Key takeaway</label>
          <textarea value={keyTakeaway} onChange={(e) => setKeyTakeaway(e.target.value)} placeholder="One thing to fix next game" />
        </div>

        <div className="field">
          <button type="button" className="btn btn-ghost" onClick={() => setTagOpen((v) => !v)}>
            {selectedTipIds.length > 0 ? `${selectedTipIds.length} tip(s) tagged` : 'Tag tips practiced (optional)'}
          </button>
        </div>

        {tagOpen && (
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder="Search tips or hero..."
              value={tipSearch}
              onChange={(e) => setTipSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, marginBottom: 8 }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {filteredTips.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => toggleTip(t.id)}
                  className="pill"
                  style={{
                    cursor: 'pointer',
                    borderColor: selectedTipIds.includes(t.id) ? 'var(--accent)' : undefined,
                    color: selectedTipIds.includes(t.id) ? 'var(--accent)' : undefined,
                  }}
                  title={t.text}
                >
                  {t.text.length > 34 ? t.text.slice(0, 34) + '…' : t.text}
                </button>
              ))}
              {filteredTips.length === 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>No matches</span>
              )}
            </div>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        <button type="button" className="btn btn-primary btn-block" onClick={submit} disabled={saving}>
          {saving ? 'Saving…' : 'Log Session'}
        </button>
      </div>

      {loading ? (
        <div className="spinner-wrap">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="empty-state">No sessions logged yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map((e) => (
            <div className="card" key={e.id}>
              <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginBottom: 8, fontWeight: 700 }}>
                {new Date(e.created_at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
              {e.went_well && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ color: 'var(--mastered)', fontSize: 12, fontWeight: 700 }}>Went well: </span>
                  <span style={{ fontSize: 14 }}>{e.went_well}</span>
                </div>
              )}
              {e.went_poorly && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ color: 'var(--learning)', fontSize: 12, fontWeight: 700 }}>Went poorly: </span>
                  <span style={{ fontSize: 14 }}>{e.went_poorly}</span>
                </div>
              )}
              {e.key_takeaway && (
                <div style={{ marginBottom: e.tip_ids?.length ? 8 : 0 }}>
                  <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>Takeaway: </span>
                  <span style={{ fontSize: 14 }}>{e.key_takeaway}</span>
                </div>
              )}
              {e.tip_ids && e.tip_ids.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {e.tip_ids.map((id) => {
                    const t = tipsById.get(id);
                    if (!t) return null;
                    return (
                      <span key={id} className="pill pill-hero" style={{ cursor: 'default' }}>
                        {t.text.length > 28 ? t.text.slice(0, 28) + '…' : t.text}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
