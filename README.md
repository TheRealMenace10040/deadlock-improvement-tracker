# Deadlock Improvement Tracker

A personal, mobile-first web app for tracking skill development in [Deadlock](https://playdeadlock.com) (Valve's MOBA). Built to be opened quickly on a phone right after a game to jot notes and check progress.

## Features

- **Tips Library** — a library of tips with category, optional hero, optional source, and a 3-stage mastery status (`Learning` → `Practicing` → `Mastered`, tap the status pill to cycle). Filterable by category, hero, and status.
- **Mastery Overview** — per-category progress bars, an overall mastery score, and a hero-filtered view.
- **Performance Log** — freeform post-session notes (what went well / poorly / key takeaway), optionally tagged with the tips you were practicing, in a reverse-chronological list.
- **Reading & Knowledge** — general knowledge / patch-note style entries, separate from the mastery-tracked tips. Current-patch entries are pinned to the top.

## Tech stack

- **Frontend**: React 19 + TypeScript + Vite, plain CSS (dark gaming HUD theme), `react-router-dom` (hash routing)
- **Backend/DB**: [Supabase](https://supabase.com) (Postgres + REST API via `@supabase/supabase-js`)
- **Hosting**: Vercel

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

Schema lives in Supabase (see `scripts/seed.mjs` for the shape of the data). Tables:

- `tips` — `id`, `text`, `category` (enum), `hero` (nullable text), `source` (nullable text), `status` (enum: Learning/Practicing/Mastered), `created_at`
- `performance_log` — `id`, `went_well`, `went_poorly`, `key_takeaway`, `created_at`
- `performance_log_tips` — join table linking a log entry to the tips tagged as "practiced"
- `reading` — `id`, `title`, `body`, `is_current_patch` (bool, pins the entry to the top of the Reading tab), `created_at`

RLS is enabled on all tables with an open policy (anon key has full read/write) since this is a single-user personal tool with no login.

### Seeding data

`scripts/seed.mjs` + `scripts/seed-data.json` contain the initial 103 tips + 6 reading entries. Run once against a fresh project with:

```bash
node scripts/seed.mjs
```

## Deployment

Deployed to Vercel: **https://deadlock-improvement-tracker.vercel.app**

Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are configured in the Vercel project settings — the `.env` file is never committed.
