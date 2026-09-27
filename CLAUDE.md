# warnerbeach-live

A real-time community feed for Warner Beach: events, missing pets, burst pipes, and other local happenings, each with a time and location.

## Skill Routing

- Stage: greenfield.
- Style authority: locked. Clean minimalist (calm, editorial, off-white base, single blue accent, category-colored badges, Geist font). Do not switch to another taste skill for this project without the user asking again.
- Theme: light only. No dark mode, no `prefers-color-scheme` handling, no `dark:` Tailwind variants anywhere in this app. Do not reintroduce it.
- Map: Esri World Street Map tiles (colorful, roads/parks/water, no API key). Not a gray/minimal canvas style.
- Layout: map-first. The map fills the full viewport at all times; the report list is a collapsible overlay (sidebar on desktop, bottom sheet on mobile), not a fixed always-visible column.
- Content width: full-bleed, no max-width container, fills the whole browser window including ultra-wide monitors.
- Motion & density: Moderate/balanced — new feed items animate in, hover states on cards, no aggressive scroll-jacking or scroll-triggered pinning.
- Impeccable: Run /impeccable audit and /impeccable polish proactively at natural checkpoints (a section or view finished, before calling work done).
- Process note: this project's design/layout decisions are made WITH the user, one question batch at a time. Do not make unilateral visual direction changes (theme, map style, layout structure) without asking first, even if a prior audit or taste skill would normally justify it.
