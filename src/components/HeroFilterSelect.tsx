import type { HeroFilterValue } from '../types';

interface HeroFilterSelectProps {
  heroes: string[];
  value: HeroFilterValue;
  onChange: (value: HeroFilterValue) => void;
}

export default function HeroFilterSelect({ heroes, value, onChange }: HeroFilterSelectProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as HeroFilterValue)}>
      <option value="All">All heroes</option>
      <option value="General">General (no hero)</option>
      {heroes.map((h) => (
        <option key={h} value={h}>
          {h}
        </option>
      ))}
    </select>
  );
}
