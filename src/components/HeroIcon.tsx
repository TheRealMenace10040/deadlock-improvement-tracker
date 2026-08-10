import { useState } from 'react';

interface HeroIconProps {
  name: string;
  iconUrl?: string | null;
  size?: number;
}

export default function HeroIcon({ name, iconUrl, size = 16 }: HeroIconProps) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, fontSize: Math.max(9, size * 0.5) };

  if (iconUrl && !failed) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className="hero-icon"
        style={style}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className="hero-icon-fallback" style={style}>
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}
