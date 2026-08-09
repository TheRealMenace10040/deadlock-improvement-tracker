import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Tip, TipStatus } from '../types';
import { TIP_CATEGORIES } from '../types';
import '../components/ui.css';

interface Breakdown {
  total: number;
  learning: number;
  practicing: number;
  mastered: number;
  score: number; // 0-100
}

function computeBreakdown(tips: Tip[]): Breakdown {
  const total = tips.length;
  const counts: Record<TipStatus, number> = { Learning: 0, Practicing: 0, Mastered: 0 };
  tips.forEach((t) => counts[t.status]++);
  const score = total === 0 ? 0 : ((counts.Practicing * 0.5 + counts.Mastered) / total) * 100;
  return {
    total,
    learning: counts.Learning,
    practicing: counts.Practicing,
    mastered: counts.Mastered,
    score: Math.round(score),
  };
}

function ProgressBar({ b }: { b: Breakdown }) {
  if (b.total === 0) {
    return <div className="progress-track" />;
  }
  const pct = (n: number) => (n / b.total) * 100;
  return (
    <div className="progress-track">
      <div className="progress-seg-learning" style={{ width: `${pct(b.learning)}%` }} />
      <div className="progress-seg-practicing" style={{ width: `${pct(b.practicing)}%` }} />
      <div className="progress-seg-mastered" style={{ width: `${pct(b.mastered)}%` }} />
    </div>
  );
}

export default function MasteryOverview() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hero, setHero] = useState<string>('All');

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('tips').select('*');
    if (error) setError(error.message);
    else setTips(data as Tip[]);
    setLoading(false);
  }

  const heroes = useMemo(() => {
    const set = new Set<string>();
    tips.forEach((t) => t.hero && set.add(t.hero));
    return Array.from(set).sort();
  }, [tips]);

  const scoped = useMemo(
    () => (hero === 'All' ? tips : tips.filter((t) => t.hero === hero)),
    [tips, hero]
  );

  const overall = useMemo(() => computeBreakdown(scoped), [scoped]);

  const byCategory = useMemo(() => {
    return TIP_CATEGORIES.map((cat) => ({
      category: cat,
      breakdown: computeBreakdown(scoped.filter((t) => t.category === cat)),
    })).filter((c) => c.breakdown.total > 0);
  }, [scoped]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Mastery <span className="accent">Overview</span>
        </h1>
      </div>

      <div className="filter-bar">
        <select value={hero} onChange={(e) => setHero(e.target.value)}>
          <option value="All">All heroes</option>
          {heroes.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="spinner-wrap">Loading…</div>
      ) : overall.total === 0 ? (
        <div className="empty-state">No tips to show{hero !== 'All' ? ` for ${hero}` : ''}.</div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)' }}>
                {hero === 'All' ? 'Overall Mastery' : `${hero} Mastery`}
              </span>
              <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>{overall.score}%</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <ProgressBar b={overall} />
            </div>
            <Legend b={overall} />
          </div>

          <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            By Category
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {byCategory.map(({ category, breakdown }) => (
              <div className="card" key={category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{category}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)' }}>
                    {breakdown.score}%{' '}
                    <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}>
                      ({breakdown.total})
                    </span>
                  </span>
                </div>
                <ProgressBar b={breakdown} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Legend({ b }: { b: Breakdown }) {
  return (
    <div className="legend">
      <span>
        <span className="legend-dot" style={{ background: 'var(--learning)' }} />
        Learning {b.learning}
      </span>
      <span>
        <span className="legend-dot" style={{ background: 'var(--practicing)' }} />
        Practicing {b.practicing}
      </span>
      <span>
        <span className="legend-dot" style={{ background: 'var(--mastered)' }} />
        Mastered {b.mastered}
      </span>
    </div>
  );
}
