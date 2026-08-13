import type { Hero } from '../types';

interface HeroPortraitProps {
  hero: Hero;
  variant: 'tile' | 'band';
}

function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  return words.map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function HeroPortrait({ hero, variant }: HeroPortraitProps) {
  const imgClass = variant === 'tile' ? 'roster-portrait' : 'hero-band';
  const fallbackClass = variant === 'tile' ? 'roster-portrait-fallback' : 'hero-band-fallback';

  if (hero.portrait_url) {
    return <img src={hero.portrait_url} alt={hero.name} className={imgClass} />;
  }

  return (
    <div className={fallbackClass} style={{ background: hero.accent }}>
      {initials(hero.name)}
    </div>
  );
}
