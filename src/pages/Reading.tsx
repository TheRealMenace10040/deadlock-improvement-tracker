import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ReadingEntry } from '../types';
import '../components/ui.css';

export default function Reading() {
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('reading').select('*').order('created_at', { ascending: true });
    if (error) setError(error.message);
    else setEntries(data as ReadingEntry[]);
    setLoading(false);
  }

  const { pinned, rest } = useMemo(() => {
    const pinned = entries.filter((e) => e.is_current_patch);
    const rest = entries.filter((e) => !e.is_current_patch);
    return { pinned, rest };
  }, [entries]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function EntryCard({ e, highlighted }: { e: ReadingEntry; highlighted?: boolean }) {
    const isOpen = expanded.has(e.id);
    return (
      <div
        className="card"
        style={
          highlighted
            ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent-glow)' }
            : undefined
        }
        onClick={() => toggle(e.id)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {highlighted && <span className="pill pill-hero">Current Patch</span>}
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>{e.title}</h3>
          </div>
          <span style={{ color: 'var(--text-faint)', fontSize: 18, lineHeight: 1 }}>{isOpen ? '−' : '+'}</span>
        </div>
        {isOpen && (
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>
            {e.body}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Reading & <span className="accent">Knowledge</span>
        </h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="spinner-wrap">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="empty-state">No reading entries yet.</div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <h2
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--accent)',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                ⚡ Current Patch — read this first
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pinned.map((e) => (
                  <EntryCard e={e} highlighted key={e.id} />
                ))}
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <h2
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: 'var(--text-dim)',
                    marginBottom: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  General Knowledge
                </h2>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rest.map((e) => (
                  <EntryCard e={e} key={e.id} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
