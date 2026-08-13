import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Tip, TipCategory } from '../types';
import { TIP_CATEGORIES } from '../types';
import StatusPill from '../components/StatusPill';
import TipSheet from '../components/TipSheet';
import '../components/ui.css';

export default function Learn() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTip, setEditingTip] = useState<Tip | 'new' | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('kind', 'learning')
      .order('created_at', { ascending: true });
    if (error) setError(error.message);
    else setTips(data as Tip[]);
    setLoading(false);
  }

  const sections = useMemo(() => {
    return TIP_CATEGORIES.map((cat) => ({
      category: cat,
      tips: tips.filter((t) => t.category === cat),
    })).filter((s) => s.tips.length > 0);
  }, [tips]);

  function handleSaved(saved: Tip) {
    if (saved.kind !== 'learning') return;
    setTips((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [...prev, saved];
    });
  }

  function handleDeleted(id: string) {
    setTips((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span className="accent">LEARN</span>
        </h1>
        <span className="mono-label">{tips.length} tips</span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="spinner-wrap">Loading…</div>
      ) : sections.length === 0 ? (
        <div className="empty-state">No learning tips yet.</div>
      ) : (
        sections.map((section, i) => (
          <SectionBlock
            key={section.category}
            index={i + 1}
            category={section.category}
            tips={section.tips}
            onSelect={setEditingTip}
          />
        ))
      )}

      <button type="button" className="fab" onClick={() => setEditingTip('new')} aria-label="Add tip">
        +
      </button>

      {editingTip && (
        <TipSheet
          mode={editingTip === 'new' ? 'create' : 'edit'}
          tip={editingTip === 'new' ? undefined : editingTip}
          defaultKind="learning"
          onClose={() => setEditingTip(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}

function SectionBlock({
  index,
  category,
  tips,
  onSelect,
}: {
  index: number;
  category: TipCategory;
  tips: Tip[];
  onSelect: (tip: Tip) => void;
}) {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">
          {String(index).padStart(2, '0')} — {category}
        </span>
        <span className="section-count">{tips.length}</span>
      </div>
      {tips.map((tip) => (
        <button key={tip.id} type="button" className="tip-row" onClick={() => onSelect(tip)}>
          <span className="tip-row-text">{tip.text}</span>
          <StatusPill status={tip.status} />
        </button>
      ))}
    </div>
  );
}
