import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Tip, TipCategory, TipStatus } from '../types';
import { TIP_CATEGORIES, TIP_STATUSES } from '../types';
import StatusPill from '../components/StatusPill';
import HeroFilterChips, { type HeroFilterValue } from '../components/HeroFilterChips';
import TipEditorSheet from '../components/TipEditorSheet';
import HeroIcon from '../components/HeroIcon';
import { useHeroIcons } from '../hooks/useHeroIcons';
import '../components/ui.css';

export default function TipsLibrary() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<TipCategory | 'All'>('All');
  const [hero, setHero] = useState<HeroFilterValue>('All');
  const [status, setStatus] = useState<TipStatus | 'All'>('All');

  const [editingTip, setEditingTip] = useState<Tip | 'new' | null>(null);

  const { iconMap, upsertIcon } = useHeroIcons();

  useEffect(() => {
    void loadTips();
  }, []);

  async function loadTips() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setTips(data as Tip[]);
    setLoading(false);
  }

  const heroes = useMemo(() => {
    const set = new Set<string>();
    tips.forEach((t) => t.hero && set.add(t.hero));
    return Array.from(set).sort();
  }, [tips]);

  const filtered = useMemo(() => {
    return tips.filter((t) => {
      if (category !== 'All' && t.category !== category) return false;
      if (hero === 'General' && t.hero !== null) return false;
      if (hero !== 'All' && hero !== 'General' && t.hero !== hero) return false;
      if (status !== 'All' && t.status !== status) return false;
      return true;
    });
  }, [tips, category, hero, status]);

  function handleSaved(saved: Tip) {
    setTips((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev];
    });
  }

  function handleDeleted(id: string) {
    setTips((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Tips <span className="accent">Library</span>
        </h1>
        <span style={{ color: 'var(--text-faint)', fontSize: 12, fontWeight: 700 }}>
          {filtered.length}/{tips.length}
        </span>
      </div>

      <div className="filter-bar">
        <select value={category} onChange={(e) => setCategory(e.target.value as TipCategory | 'All')}>
          <option value="All">All categories</option>
          {TIP_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as TipStatus | 'All')}>
          <option value="All">All statuses</option>
          {TIP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <HeroFilterChips heroes={heroes} iconMap={iconMap} value={hero} onChange={setHero} />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="spinner-wrap">Loading tips…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No tips match these filters.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((tip) => (
            <div className="card" key={tip.id}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                <span className="pill pill-category">{tip.category}</span>
                {tip.hero ? (
                  <span className="pill pill-hero">
                    <HeroIcon name={tip.hero} iconUrl={iconMap.get(tip.hero)} size={14} />
                    vs {tip.hero}
                  </span>
                ) : (
                  <span className="pill pill-general">General</span>
                )}
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.45, color: 'var(--text)' }}>{tip.text}</p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 10,
                  gap: 8,
                }}
              >
                {tip.source ? (
                  <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>via {tip.source}</span>
                ) : (
                  <span />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusPill status={tip.status} />
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setEditingTip(tip)}
                    aria-label="Edit tip"
                    title="Edit tip"
                  >
                    ✏️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="fab" onClick={() => setEditingTip('new')} aria-label="Add tip">
        +
      </button>

      {editingTip && (
        <TipEditorSheet
          mode={editingTip === 'new' ? 'create' : 'edit'}
          tip={editingTip === 'new' ? undefined : editingTip}
          heroSuggestions={heroes}
          iconMap={iconMap}
          onClose={() => setEditingTip(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          upsertIcon={upsertIcon}
        />
      )}
    </div>
  );
}
