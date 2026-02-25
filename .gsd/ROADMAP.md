# Project Roadmap: Mood Tracker

## Phase 1: Foundation & Data Taxonomy
**Objective:** Set up the page structure, routing, navigation, and the core emotion data model.
- Update global navigation (replace "Neural Insights").
- Create the base `/mood-tracker` page with the sticky 3-tab layout.
- Implement the comprehensive Emotion Taxonomy (`emotions.ts`) containing all 150+ emotions and definitions.
- Implement standard TS interfaces for `MoodEntry` and base state management hooks (`useMoodStore.ts`).

## Phase 2: The Log Tab (Compass & Selection Flow)
**Objective:** Implement the highly interactive emotion logging UI.
- Build the "Mood Compass" quadrant selector.
- Build the "Emotion Family Wheel / Petals" layout.
- Build the "Specific Emotion Selection" (Bloom) with educational tooltips.
- Add compound emotion detection.
- Add the Context Panel (Triggers, Intensity, Note) and Save flow.
- Ensure transitions between these steps are fully animated and feel meditative.

## Phase 3: Dynamic Background Shader
**Objective:** Implement the signature ambient state-driven background shader.
- Create the WebGL/CSS shader background component.
- Connect shader parameters (hue, saturation, animation speed) to the active composite valence and arousal state.
- Ensure performance limits (pause when hidden, cap FPS) and proper reduced-motion fallbacks.

## Phase 4: Trends View
**Objective:** Implement data visualizations for historical mood logs.
- Build the scrollable Mood Timeline (valence over time).
- Build the Emotion Heatmap Calendar (GitHub style).
- Build Donut chart (Family Distribution) and Top Emotions list.
- Build the Trigger Correlation and Time-of-Day radial charts.

## Phase 5: Patterns, Insights & Crisis Engine
**Objective:** Implement the rule-based insight engine and vocabulary tracking.
- Build the Pattern Detection Engine (detecting spirals, streaks, crisis keywords).
- Build the Insight Tiers UI (Insight, Nudge, Concern, Crisis cards).
- Build the Vocabulary Growth Tracker (Word cloud / chart).
- Final end-to-end polish, responsive review, and empty-state handling.
