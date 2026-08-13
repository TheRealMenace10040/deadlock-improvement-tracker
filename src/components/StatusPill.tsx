import type { TipStatus } from '../types';

const CLASS: Record<TipStatus, string> = {
  LEARNING: 'status-learning',
  DRILLING: 'status-drilling',
  'LOCKED IN': 'status-locked-in',
};

export default function StatusPill({ status }: { status: TipStatus }) {
  return <span className={`status-text ${CLASS[status]}`}>{status}</span>;
}
