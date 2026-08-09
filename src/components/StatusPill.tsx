import type { TipStatus } from '../types';
import { TIP_STATUSES } from '../types';

const NEXT: Record<TipStatus, TipStatus> = {
  Learning: 'Practicing',
  Practicing: 'Mastered',
  Mastered: 'Learning',
};

const CLASS: Record<TipStatus, string> = {
  Learning: 'status-learning',
  Practicing: 'status-practicing',
  Mastered: 'status-mastered',
};

export default function StatusPill({
  status,
  onChange,
}: {
  status: TipStatus;
  onChange?: (next: TipStatus) => void;
}) {
  if (!onChange) {
    return <span className={`pill status-pill ${CLASS[status]}`}>{status}</span>;
  }
  return (
    <button
      type="button"
      className={`pill status-pill ${CLASS[status]}`}
      onClick={() => onChange(NEXT[status])}
      title="Tap to advance status"
    >
      {status}
    </button>
  );
}

export { TIP_STATUSES };
