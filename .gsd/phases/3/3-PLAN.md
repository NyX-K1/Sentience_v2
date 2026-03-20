---
phase: 3
plan: 1
wave: 1
---
# Plan 3.1: Dynamic Background Shader

## Objective
Implement the signature ambient state-driven background shader.

## Context
- .gsd/SPEC.md

## Tasks
<task type="auto">
  <name>Build the Shader Component and Hooks</name>
  <files>
    - src/hooks/useShaderColors.ts
    - src/components/BackgroundShader.tsx
    - src/pages/MoodTracker.tsx
  </files>
  <action>
    - Create `useShaderColors.ts` to compute HSL target values based on compositeValence and compositeArousal of selected emotions.
    - Build `BackgroundShader.tsx` using either WebGL (`@react-three/fiber` / `three`) or a highly performant animated CSS gradient. Ensure it interpolates smoothly (LERP) over 1.5 seconds.
    - Integrate it as the lowest z-index background in `MoodTracker.tsx`.
    - Apply `prefers-reduced-motion` fallbacks to disable or massively simplify the animation.
  </action>
  <verify>npm run lint</verify>
  <done>Background smoothly transitions colors based on dynamic valence/arousal state without blocking the main browser thread.</done>
</task>

## Success Criteria
- [ ] Shader correctly maps emotion selections to expected color palettes (warm positive, ambient neutral, cool negative).
- [ ] Remains performant on standard devices.
