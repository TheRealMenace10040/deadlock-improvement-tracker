# Deadlock Improvement Tracker

A personal, mobile-first web app for tracking skill development in [Deadlock](https://playdeadlock.com) (Valve's MOBA). Built to be opened quickly on a phone right after a game to jot notes and check progress. Visual identity: "Old Gods" (bone/gold/rust/sage palette, hairline dividers, per-hero display fonts).

## Features

- **LEARN** — general (non-hero) tips grouped into numbered sections by category, each with a status pill (`LEARNING` → `DRILLING` → `LOCKED IN`). Tap any row to edit it in the tip sheet; `+` adds a new one.
- **ROSTER** — the full hero roster as a 3-column portrait grid, filterable by role. Each tile shows the hero's role and how many tips exist for them (portraits fall back to an accent-colored initials block until art is uploaded).
- **HERO** (tap a roster tile) — portrait band, hero name in a per-hero display font, blurb, a tips/locked-in/mastery stat row, that hero's numbered tips, and an "add a tip for this hero" button.
- **LOG** — freeform post-session notes (what went well / poorly / key takeaway), optionally tagged with tips you were practicing; each entry shows the tagged hero's accent dot and a "working on" line linking back to that tip's home screen.
- **READING** — general knowledge / patch-note style entries, separate from tips. Current-patch entries are pinned to the top.

Every tip is either `learning` (applies regardless of hero — lives on LEARN, has a category) or `character` (fires only when facing/playing a specific hero — lives on that hero's page, has no category).

## Tech stack

- **Frontend**: React 19 + TypeScript + Vite, plain CSS (Old Gods theme), `react-router-dom` (hash routing)
- **Backend/DB**: [Supabase](https://supabase.com) (Postgres + REST API + Storage via `@supabase/supabase-js`)
- **Hosting**: Vercel
- **Fonts**: Archivo (display/body) + JetBrains Mono (labels) + 17 Google Fonts for per-hero display names, loaded in one request in `index.html`

## Local setup

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + publishable key
npm run dev
```

### Environment variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase publishable (anon) key |

### Database schema

- `tips` — `id`, `text`, `category` (enum, meaningful only for `kind='learning'`), `kind` (`learning`/`character`), `hero_id` (nullable FK → `heroes.id`, required when `kind='character'`), `vs_hero_id` (nullable FK → `heroes.id`, reserved for a future "hero you play vs. hero you're playing" matchup note), `status` (enum: `LEARNING`/`DRILLING`/`LOCKED IN`), `note` (nullable freeform text), `created_at`
- `heroes` — `id`, `name`, `slug`, `role` (Hyper-Carry/Anti-Carry/Support/Tank/Bruiser/Avoid for now), `accent` (hex), `blurb`, `portrait_url` (nullable, points into the `hero-portraits` Storage bucket), `font_family`, `letter_spacing`, `sort_order`
- `performance_log` — `id`, `went_well`, `went_poorly`, `key_takeaway`, `created_at`
- `performance_log_tips` — join table linking a log entry to the tips tagged as "practiced" (cascades on tip delete)
- `reading` — `id`, `title`, `body`, `is_current_patch` (bool, pins the entry to the top of the Reading tab), `created_at`

RLS is enabled on all tables with an open policy (anon key has full read/write) since this is a single-user personal tool with no login. The `hero-portraits` Storage bucket is public with open read/write policies for the same reason.

### Seeding data

`scripts/seed.mjs` + `scripts/seed-data.json` are **historical** — they targeted the original pre-"Old Gods" schema (flat `hero`/`source` text columns, `Learning`/`Practicing`/`Mastered` status) and will not run against the current schema. `scripts/backup.mjs` dumps the current `tips`/`heroes`/`performance_log`/`performance_log_tips` tables to `scripts/backups/` — safe to re-run any time as a snapshot before a risky migration.

## Deployment

Deployed to Vercel: **https://deadlock-improvement-tracker.vercel.app**

Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are configured in the Vercel project settings — the `.env` file is never committed.
