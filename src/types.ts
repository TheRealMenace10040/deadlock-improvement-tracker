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

export type TipStatus = 'Learning' | 'Practicing' | 'Mastered';

export const TIP_STATUSES: TipStatus[] = ['Learning', 'Practicing', 'Mastered'];

export interface Tip {
  id: string;
  text: string;
  category: TipCategory;
  hero: string | null;
  source: string | null;
  status: TipStatus;
  created_at: string;
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
