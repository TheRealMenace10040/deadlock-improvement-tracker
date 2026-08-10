import HeroIcon from './HeroIcon';

export type HeroFilterValue = string | 'All' | 'General';

interface HeroFilterChipsProps {
  heroes: string[];
  iconMap: Map<string, string>;
  value: HeroFilterValue;
  onChange: (value: HeroFilterValue) => void;
}

export default function HeroFilterChips({ heroes, iconMap, value, onChange }: HeroFilterChipsProps) {
  return (
    <div className="filter-bar chip-row">
      <button
        type="button"
        className={`chip${value === 'All' ? ' active' : ''}`}
        onClick={() => onChange('All')}
      >
        All
      </button>
      <button
        type="button"
        className={`chip${value === 'General' ? ' active' : ''}`}
        onClick={() => onChange('General')}
      >
        General
      </button>
      {heroes.map((h) => (
        <button
          type="button"
          key={h}
          className={`chip${value === h ? ' active' : ''}`}
          onClick={() => onChange(h)}
        >
          <HeroIcon name={h} iconUrl={iconMap.get(h)} size={16} />
          vs {h}
        </button>
      ))}
    </div>
  );
}
