# Deadlock Improvement Tracker — restructure brief

Goal: split the flat 102-tip library into two homes, and make heroes browsable as portraits.

## 1. The split

Every tip becomes one of two kinds:

- **`learning`** — a concept that applies in any match on any hero. Mindset, macro, laning, teamfighting, itemisation.
- **`character`** — anything that only fires when you load in as a specific hero. It must name a hero.

Rule of thumb for the migration: if the tip text names a hero, it's `character` and that hero is its owner. If it doesn't, it's `learning`. Tips that name two heroes (matchup notes) get `kind: 'character'`, `hero_id` = the hero you play, `vs_hero_id` = the other one.

The existing `category` field stays, but only on `learning` tips (Mindset / Macro / Laning / Teamfighting / Itemisation). The current "All heroes" filter on the tips screen goes away — hero is no longer a filter, it's a destination.

## 2. Schema (Supabase)

```sql
alter table tips add column kind text not null default 'learning'
  check (kind in ('learning','character'));
alter table tips add column hero_id uuid references heroes(id);
alter table tips add column vs_hero_id uuid references heroes(id);
-- enforce: kind='character' requires hero_id
alter table tips add constraint tips_hero_required
  check (kind = 'learning' or hero_id is not null);

create table heroes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  role text not null,          -- Hyper-Carry | Anti-Carry | Support | Tank | Bruiser | Avoid for now
  accent text not null,        -- hex, pulled from the portrait art
  blurb text,                  -- one or two sentences, shown under the name
  portrait_url text,           -- Supabase Storage public URL
  font_family text,            -- display face for the hero's name
  letter_spacing text default '0',
  sort_order int default 0
);
```

Status stays as-is but relabel the three values: `LEARNING` → `DRILLING` → `LOCKED IN`. Mastery per hero = locked-in tips ÷ total tips for that hero.

Migration script: read every existing tip, match its text against the hero name list (case-insensitive, whole word, longest match first — "Mo & Krill" and "Grey Talon" before single-word names), set `kind`/`hero_id`, leave the rest as `learning`. Print anything ambiguous for manual review rather than guessing.

## 3. Portraits

Storage bucket `hero-portraits`, one image per hero, square-ish (the source art is roughly 1:1.16), named by slug: `seven.png`, `mo-krill.png`. Serve via public URL into `heroes.portrait_url`.

- Grid tile renders the portrait at `aspect-ratio: 1 / 1.16`, `object-fit: cover`, no border radius.
- Hero detail renders the same image full-bleed at 238px tall, `object-fit: cover`, `object-position: top`.
- While `portrait_url` is null, fall back to a flat block in `heroes.accent` with the hero's initials — that's exactly what the mockup shows, so the app is usable before all art is loaded.
- Load the display fonts in one Google Fonts request at app start; hero names should render in Archivo 800 until they arrive (`display=swap`).
- Optional later: a second `art_url` per hero for a wider splash on the detail screen.

## 4. Screens

**LEARN** (default tab) — sections by category, each with a numbered header and a count. Rows are the tip text plus a status pill. Tap opens the tip sheet.

**ROSTER** — role filter chips, then a 3-column grid of portraits. Each tile: portrait, hero name, role, and the count of tips logged for that hero (dimmed when zero). Tap opens the hero.

**HERO** — portrait band, big name, blurb, a stat row (tips / locked in / mastery bar), then that hero's tips numbered, then "add a tip for X" which pre-fills `hero_id`.

**LOG** — unchanged in structure; add the hero accent dot and a "working on" line that links to a tip.

**TIP SHEET** — bottom sheet: category tag, the tip large, three status buttons, note, source line. Replaces the tiny pencil icon; the whole row is the tap target now.

## 5. Visual system

- Old Gods palette: ground `#16130F`, raised surfaces `#1E1A15`, bone `#EDE4D2`, body text `#DCD3C1`, muted `#8A8073` / `#6E6558`, gold `#D9A441`, rust `#C1502E`, sage `#8FA35C`.
- Gold is the only interactive colour: active nav tab, active filter chip, tip numbers, sheet rule, primary button.
- Type: Archivo (800 display, 400/600 body), JetBrains Mono for all labels, counts and pills — uppercase, `letter-spacing: .12em`, 8–10px.
- **Hero names are set in a per-hero display face**, standing in for the official wordmarks. `heroes.font_family` + `heroes.letter_spacing` drive it; the mockup uses Google Fonts (Anton, Cinzel, Bebas Neue, Black Ops One, Bowlby One, Bungee, Alfa Slab One, Rye, Faster One, Pirata One, Metal Mania, Rubik Wet Paint, Playfair Display, Abril Fatface, Ultra, Righteous, Lobster, Bevan). If you can get the real wordmark SVGs, swap them in as images and keep the font as fallback. Hero names appear in their own face in three places: roster tile, hero page headline, log entry.
- No rounded corners, no shadows, no gradients. Separation is 1px hairlines at `rgba(237,228,210,.08–.16)` and a 1px grid gap on the roster.
- Hero accent colour is used only for that hero's portrait fallback, mastery bar and log dot.
- Status colours: LEARNING `#D9A441`, DRILLING `#C1502E`, LOCKED IN `#8FA35C`. Pills are outlined when inactive, filled when selected.
- Tap targets: every tip row and grid tile is at least 44px tall.

## 6. Add-tip flow

The floating "+" becomes two entry points: "+ Add a tip" on LEARN (asks for category) and "+ Add a tip for X" on a hero page (hero pre-filled, no category needed). Keep the form itself as it is.
