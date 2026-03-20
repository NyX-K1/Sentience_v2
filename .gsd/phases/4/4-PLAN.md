---
phase: 4
plan: 1
wave: 1
---
# Plan 4.1: Trends View

## Objective
Implement data visualizations for historical mood logs.

## Context
- .gsd/SPEC.md
- Use an existing chart library like `recharts` (already a dependency) if applicable.

## Tasks
<task type="auto">
  <name>Build Analytical Utils and Timeline</name>
  <files>
    - src/utils/trendCalculations.ts
    - src/components/MoodTimeline.tsx
    - src/components/FamilyDistribution.tsx
  </files>
  <action>
    - Implement `trendCalculations.ts` algorithms to shape data for charts (date grouping, valence averaging).
    - Build `MoodTimeline.tsx`: A horizontally scrollable timeline showing valence/arousal dots over customized date ranges.
    - Build `FamilyDistribution.tsx`: A donut chart summarizing emotion family usage.
  </action>
  <verify>npm run build</verify>
  <done>Charts parse state data into visual aggregations without crashing.</done>
</task>

<task type="auto">
  <name>Build Heatmap and Correlations</name>
  <files>
    - src/components/EmotionHeatmap.tsx
    - src/components/TriggerCorrelation.tsx
    - src/pages/MoodTracker.tsx
  </files>
  <action>
    - Build `EmotionHeatmap.tsx`: A monthly/weekly GitHub-style grid colored by composite valence.
    - Build `TriggerCorrelation.tsx`: Bar charts showing the relationship between trigger tags and resulting valence.
    - Assemble charts in Tab 2 panel in `MoodTracker.tsx`. Include clear empty states (e.g. "Needs more data").
  </action>
  <verify>npm run lint</verify>
  <done>Trends tab fully populated with reactive charts handling both data and empty states gracefully.</done>
</task>

## Success Criteria
- [ ] User can see a clear visual representation of their mood history on the Trends tab.
- [ ] Layout matches the overall aesthetic scale and design system.
