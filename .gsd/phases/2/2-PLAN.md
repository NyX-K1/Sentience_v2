---
phase: 2
plan: 1
wave: 1
---
# Plan 2.1: The Log Tab (Compass & Selection Flow)

## Objective
Implement the highly interactive emotion logging UI.

## Context
- .gsd/SPEC.md

## Tasks
<task type="auto">
  <name>Build Mood Compass and Emotion Wheel</name>
  <files>
    - src/components/MoodCompass.tsx
    - src/components/EmotionWheel.tsx
  </files>
  <action>
    - Build `MoodCompass.tsx`: A large circular gradient dial for the 4 quadrants (Tense, Energized, Low, Calm) that pulses on selection.
    - Build `EmotionWheel.tsx`: The Petal Layout displaying relevant emotion families based on the chosen quadrant.
    - Ensure smooth Framer Motion (or GSAP) transitions when interacting (e.g. shrinking the compass and expanding the petals).
  </action>
  <verify>npm run lint</verify>
  <done>Compass and Petal Wheel visually render and interactively toggle state.</done>
</task>

<task type="auto">
  <name>Build Specific Emotion Selection & Context Panel</name>
  <files>
    - src/components/EmotionBloom.tsx
    - src/components/EmotionTooltip.tsx
    - src/components/ContextPanel.tsx
    - src/pages/MoodTracker.tsx
  </files>
  <action>
    - Build `EmotionBloom.tsx`: Renders specific emotions in concentric intensity rings when a petal is tapped.
    - Build `EmotionTooltip.tsx`: A beautiful popover containing definition, body signals, etc., shown on hover/hold.
    - Build `ContextPanel.tsx`: The triggers, 1-10 slider, and text area for saving the entry.
    - Integrate all pieces into Tab 1 of `MoodTracker.tsx` utilizing `useMoodStore.ts` to save the entry.
  </action>
  <verify>npm run build</verify>
  <done>User can navigate Compass -> Wheel -> Bloom -> save entry to local state.</done>
</task>

## Success Criteria
- [ ] Core interaction flow is unbroken.
- [ ] Beautiful animations guide the user from broad energy to specific emotions.
- [ ] Data saves correctly to the store.
