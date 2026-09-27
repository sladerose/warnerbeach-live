# Warner Beach Live

A real-time community feed for Warner Beach, KwaZulu-Natal: events, missing pets, burst pipes, hazards, and lost & found, each pinned with a time and location.

Anyone can submit a report. New reports appear on the map and list instantly for everyone viewing the feed, no refresh needed.

## Features

- **Map-first layout** — full-viewport map fit to the Warner Beach area, list and filters float over it
- **Live updates** — new reports appear in real time via Supabase Realtime, no polling
- **Category filters** — event, missing pet, burst pipe, hazard, lost & found, other
- **Public submission form** — category, title, details, location (with a "use my location" option), time, optional contact info
- **Collapsible report list** — sidebar on desktop, bottom sheet on mobile

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) — Postgres + Realtime, public read/insert via row-level security
- [Leaflet](https://leafletjs.com) / [react-leaflet](https://react-leaflet.js.org) with Esri Street Map tiles
- [Motion](https://motion.dev) for the submission drawer and list transitions

## Getting started

```bash
npm install
```

Create `.env.local` with your own Supabase project:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The `reports` table schema (with RLS policies for public read/insert and Realtime enabled) is defined in this repo's migration history — see `src/lib/types.ts` for the shape.

Next 16 defaults to Turbopack, which doesn't play well with this workspace's shared `.claude` symlink, so dev/build are pinned to webpack:

```bash
npm run dev
npm run build
```

Open [http://localhost:3000](http://localhost:3000).

## Known limitations

See open issues — no photo upload yet, no moderation/rate-limiting on public submissions, and no in-app way to mark a report resolved.
