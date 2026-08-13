import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useHeroes } from '../hooks/useHeroes';
import type { Tip } from '../types';
import HeroPortrait from '../components/HeroPortrait';
import StatusPill from '../components/StatusPill';
import TipSheet from '../components/TipSheet';
import HeroEditSheet from '../components/HeroEditSheet';
import '../components/ui.css';

export default function HeroDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { bySlug, loading: heroesLoading, uploadPortrait, updateHero } = useHeroes();
  const hero = slug ? bySlug.get(slug) : undefined;

  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTip, setEditingTip] = useState<Tip | 'new' | null>(null);
  const [editingHero, setEditingHero] = useState(false);

  useEffect(() => {
    if (hero) void load(hero.id);
  }, [hero?.id]);

  async function load(heroId: string) {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('kind', 'character')
      .eq('hero_id', heroId)
      .order('created_at', { ascending: true });
    if (error) setError(error.message);
    else setTips(data as Tip[]);
    setLoading(false);
  }

  function handleSaved(saved: Tip) {
    setTips((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [...prev, saved];
    });
  }

  function handleDeleted(id: string) {
    setTips((prev) => prev.filter((t) => t.id !== id));
  }

  if (heroesLoading) {
    return <div className="spinner-wrap">Loading…</div>;
  }

  if (!hero) {
    return (
      <div>
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/roster')}>
          ← Back to Roster
        </button>
        <div className="empty-state">Hero not found.</div>
      </div>
    );
  }

  const total = tips.length;
  const lockedIn = tips.filter((t) => t.status === 'LOCKED IN').length;
  const drilling = tips.filter((t) => t.status === 'DRILLING').length;
  const masteryScore = total === 0 ? 0 : Math.round(((drilling * 0.5 + lockedIn) / total) * 100);

  return (
    <div>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => navigate('/roster')}
        style={{ marginBottom: 12 }}
      >
        ← Roster
      </button>

      <HeroPortrait hero={hero} variant="band" />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <h1 className="hero-name" style={{ fontFamily: hero.font_family ?? undefined, letterSpacing: hero.letter_spacing ?? undefined }}>
            {hero.name}
          </h1>
          <div className="mono-label" style={{ marginTop: 4 }}>{hero.role}</div>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setEditingHero(true)}
          aria-label="Edit hero"
          title="Edit hero"
          style={{ marginTop: 16 }}
        >
          ✏️
        </button>
      </div>
      {hero.blurb && <p className="hero-blurb">{hero.blurb}</p>}

      <div className="hero-stat-row">
        <div className="hero-stat">
          <span className="hero-stat-value">{total}</span>
          <span className="hero-stat-label">Tips</span>
        </div>
        <div className="hero-stat">
          <span className="hero-stat-value">{lockedIn}</span>
          <span className="hero-stat-label">Locked In</span>
        </div>
        <div className="hero-stat">
          <span className="hero-stat-value">{masteryScore}%</span>
          <span className="hero-stat-label">Mastery</span>
        </div>
      </div>
      <div className="mastery-track">
        <div className="mastery-fill" style={{ width: `${masteryScore}%`, background: hero.accent }} />
      </div>

      {error && <div className="error-banner" style={{ marginTop: 14 }}>{error}</div>}

      <div style={{ marginTop: 18 }}>
        {loading ? (
          <div className="spinner-wrap">Loading…</div>
        ) : tips.length === 0 ? (
          <div className="empty-state">No tips for {hero.name} yet.</div>
        ) : (
          tips.map((tip, i) => (
            <button key={tip.id} type="button" className="tip-row" onClick={() => setEditingTip(tip)}>
              <span className="tip-row-index">{String(i + 1).padStart(2, '0')}</span>
              <span className="tip-row-text">{tip.text}</span>
              <StatusPill status={tip.status} />
            </button>
          ))
        )}
      </div>

      <button
        type="button"
        className="btn btn-block"
        style={{ marginTop: 16, borderColor: hero.accent, color: hero.accent }}
        onClick={() => setEditingTip('new')}
      >
        + Add a tip for {hero.name}
      </button>

      {editingTip && (
        <TipSheet
          mode={editingTip === 'new' ? 'create' : 'edit'}
          tip={editingTip === 'new' ? undefined : editingTip}
          defaultKind="character"
          defaultHeroId={hero.id}
          onClose={() => setEditingTip(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}

      {editingHero && (
        <HeroEditSheet
          hero={hero}
          onClose={() => setEditingHero(false)}
          onSaved={() => setEditingHero(false)}
          uploadPortrait={uploadPortrait}
          updateHero={updateHero}
        />
      )}
    </div>
  );
}
