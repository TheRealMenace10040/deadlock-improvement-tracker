import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useHeroes } from '../hooks/useHeroes';
import { HERO_ROLES, type HeroRole } from '../types';
import HeroPortrait from '../components/HeroPortrait';
import '../components/ui.css';

export default function Roster() {
  const { heroes, loading: heroesLoading, error: heroesError } = useHeroes();
  const [tipCounts, setTipCounts] = useState<Map<string, number>>(new Map());
  const [role, setRole] = useState<HeroRole | 'All'>('All');
  const navigate = useNavigate();

  useEffect(() => {
    void loadCounts();
  }, []);

  async function loadCounts() {
    const { data } = await supabase.from('tips').select('hero_id').eq('kind', 'character');
    if (!data) return;
    const counts = new Map<string, number>();
    data.forEach((row: { hero_id: string | null }) => {
      if (!row.hero_id) return;
      counts.set(row.hero_id, (counts.get(row.hero_id) ?? 0) + 1);
    });
    setTipCounts(counts);
  }

  const filtered = useMemo(
    () => (role === 'All' ? heroes : heroes.filter((h) => h.role === role)),
    [heroes, role]
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span className="accent">ROSTER</span>
        </h1>
        <span className="mono-label">{heroes.length} heroes</span>
      </div>

      <div className="filter-bar">
        <button type="button" className={`chip${role === 'All' ? ' active' : ''}`} onClick={() => setRole('All')}>
          All
        </button>
        {HERO_ROLES.map((r) => (
          <button
            key={r}
            type="button"
            className={`chip${role === r ? ' active' : ''}`}
            onClick={() => setRole(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {heroesError && <div className="error-banner">{heroesError}</div>}

      {heroesLoading ? (
        <div className="spinner-wrap">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No heroes match this role.</div>
      ) : (
        <div className="roster-grid">
          {filtered.map((hero) => {
            const count = tipCounts.get(hero.id) ?? 0;
            return (
              <button
                key={hero.id}
                type="button"
                className="roster-tile"
                onClick={() => navigate(`/hero/${hero.slug}`)}
              >
                <HeroPortrait hero={hero} variant="tile" />
                <div className="roster-tile-info">
                  <div className="roster-tile-name" style={{ fontFamily: hero.font_family ?? undefined }}>
                    {hero.name}
                  </div>
                  <div className="roster-tile-meta">{hero.role}</div>
                  <div className="roster-tile-meta" style={{ opacity: count === 0 ? 0.4 : 1 }}>
                    {count} tip{count === 1 ? '' : 's'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
