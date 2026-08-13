export type TipCategory =
  | 'Laning'
  | 'Movement/Mechanics'
  | 'Economy/Farming'
  | 'Itemization'
  | 'Macro/Objectives'
  | 'Teamfighting'
  | 'Mindset';

export const TIP_CATEGORIES: TipCategory[] = [
  'Laning',
  'Movement/Mechanics',
  'Economy/Farming',
  'Itemization',
  'Macro/Objectives',
  'Teamfighting',
  'Mindset',
];

export type TipStatus = 'LEARNING' | 'DRILLING' | 'LOCKED IN';

export const TIP_STATUSES: TipStatus[] = ['LEARNING', 'DRILLING', 'LOCKED IN'];

export type TipKind = 'learning' | 'character';

export interface Tip {
  id: string;
  text: string;
  category: TipCategory;
  kind: TipKind;
  hero_id: string | null;
  vs_hero_id: string | null;
  status: TipStatus;
  note: string | null;
  created_at: string;
}

export type HeroRole = 'Hyper-Carry' | 'Anti-Carry' | 'Support' | 'Tank' | 'Bruiser' | 'Avoid for now';

export const HERO_ROLES: HeroRole[] = ['Hyper-Carry', 'Anti-Carry', 'Support', 'Tank', 'Bruiser', 'Avoid for now'];

export interface Hero {
  id: string;
  name: string;
  slug: string;
  role: HeroRole;
  accent: string;
  blurb: string | null;
  portrait_url: string | null;
  font_family: string | null;
  letter_spacing: string | null;
  sort_order: number;
}

export interface PerformanceLogEntry {
  id: string;
  went_well: string | null;
  went_poorly: string | null;
  key_takeaway: string | null;
  created_at: string;
  tip_ids?: string[];
}

export interface ReadingEntry {
  id: string;
  title: string;
  body: string;
  is_current_patch: boolean;
  created_at: string;
}
