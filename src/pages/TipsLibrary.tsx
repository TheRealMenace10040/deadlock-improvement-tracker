import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Tip, TipCategory, TipStatus } from '../types';
import { TIP_CATEGORIES, TIP_STATUSES } from '../types';
import StatusPill from '../components/StatusPill';
import '../components/ui.css';

export default function TipsLibrary() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<TipCategory | 'All'>('All');
  const [hero, setHero] = useState<string | 'All'>('All');
  const [status, setStatus] = useState<TipStatus | 'All'>('All');

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

  async function updateStatus(tip: Tip, next: TipStatus) {
    setTips((prev) => prev.map((t) => (t.id === tip.id ? { ...t, status: next } : t)));
    const { error } = await supabase.from('tips').update({ status: next }).eq('id', tip.id);
    if (error) {
      setError(error.message);
      setTips((prev) => prev.map((t) => (t.id === tip.id ? { ...t, status: tip.status } : t)));
    }
  }

  const heroes = useMemo(() => {
    const set = new Set<string>();
    tips.forEach((t) => t.hero && set.add(t.hero));
    return Array.from(set).sort();
  }, [tips]);

  const filtered = useMemo(() => {
    return tips.filter((t) => {
      if (category !== 'All' && t.category !== category) return false;
      if (hero !== 'All' && t.hero !== hero) return false;
      if (status !== 'All' && t.status !== status) return false;
      return true;
    });
  }, [tips, category, hero, status]);

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
        <select value={hero} onChange={(e) => setHero(e.target.value)}>
          <option value="All">All heroes</option>
          {heroes.map((h) => (
            <option key={h} value={h}>
              {h}
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
                {tip.hero && <span className="pill pill-hero">{tip.hero}</span>}
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
                <StatusPill status={tip.status} onChange={(next) => updateStatus(tip, next)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
