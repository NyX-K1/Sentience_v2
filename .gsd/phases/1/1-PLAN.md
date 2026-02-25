---
phase: 1
plan: 1
wave: 1
---
# Plan 1.1: Foundation & Data Taxonomy

## Objective
Set up the page structure, routing, navigation, and the core emotion data model.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md

## Tasks
<task type="auto">
  <name>Scaffold Routes and Navigation</name>
  <files>
    - src/App.tsx
    - src/components/CardNav.tsx
    - src/pages/MoodTracker.tsx
  </files>
  <action>
    - Rename "Neural Insights" to "Mood Tracker" in CardNav.tsx (or equivalent nav component).
    - Create a barebones page at `src/pages/MoodTracker.tsx` with a basic sticky 3-tab layout (Log, Trends, Patterns).
    - Update the route in `src/App.tsx`.
  </action>
  <verify>npm run build</verify>
  <done>Navigation bar item is updated and clicking it routes to the new empty Mood Tracker page showing 3 tabs.</done>
</task>

<task type="auto">
  <name>Implement Emotion Taxonomy & State Models</name>
  <files>
    - src/types/mood.ts
    - src/data/emotions.ts
    - src/hooks/useMoodStore.ts
  </files>
  <action>
    - Define TypeScript interfaces `MoodEntry`, `EmotionDef`, and `EmotionFamily` in `src/types/mood.ts` as specified in SPEC.md.
    - Create `src/data/emotions.ts` to export the full array of 150+ emotion definitions with complete metadata (intensity, valence, arousal, colorHex, etc.).
    - Scaffold `src/data/compounds.ts` for combinations mapping.
    - Create `src/hooks/useMoodStore.ts` for managing entries in `localStorage`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Type definitions, massive constants block, and data storage hooks compile without TS errors.</done>
</task>

## Success Criteria
- [ ] App structure is integrated seamlessly into existing routing.
- [ ] Complete taxonomy exists and TS types are robust.
