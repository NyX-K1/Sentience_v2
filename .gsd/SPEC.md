# Mood Tracker Feature Specification

**Status:** FINALIZED

## Overview
Build a new full-page feature called "Mood Tracking" for the existing mental wellness website "Sentience". This page replaces the "Neural Insights" nav item in the CBT Studio navigation bar. Keep the existing nav structure, theme system, layout patterns, and design language of the site intact.

## Navigation Change
- In the CBT Studio section of the main nav bar, replace/rename "Neural Insights" with "Mood Tracker".
- The page route should be `/mood-tracker` or equivalent.
- Must feel native to the existing Sentience design system.

## Page Structure
Three main zones, laid out as a single-page scrollable experience with a sticky tab bar at the top:
1. **Tab 1: Log** (default) — Emotion logging flow
2. **Tab 2: Trends** — Visualizations and timeline
3. **Tab 3: Patterns** — Insights, nudges, vocabulary growth

## Tab 1 — Log (Core Emotion Logging Flow)
### Step 1: The Mood Compass
- Circular interactive gradient dial divided into 4 quadrants (high/low energy, unpleasant/pleasant).
- Soft gradient colors: Tense (orange/amber), Energized (gold/coral), Low (indigo/slate), Calm (teal/sage).
- Tooltips and selection animations.
- Background shader transitions to the selected quadrant's color over 1.5s.

### Step 2: Emotion Family Wheel (Petals)
- Reveal a petal layout representing emotion families (Plutchik's model).
- Colors mapped directly to families (e.g., Joy=yellow, Trust=green, Fear=purple).
- Blooms/expands to reveal specific emotions when tapped.

### Step 3: Specific Emotion Selection
- Concentric rings/cards representing 4 tiers of intensity.
- **CRITICAL**: Every emotion requires a tooltip (definition, "you might feel this when...", body signals, cognitive pattern).
- Allow multiple selections; selected emotions glow.
- Support compound emotions combinations (e.g., Joy + Trust = Love).
- Include "Layer 3" complex/nuanced feelings section.
- Shader morphs based on selected emotions' valence and arousal.

### Step 4: Context Panel
- Trigger Tags (scrollable pills, multi-select, custom add).
- Intensity Slider (1-10 smooth slider).
- Quick Note text area (500 chars).
- Actions: Save, Save & Journal.

### Post-Save
- Beautiful "Did you know?" insight card.

## Tab 2 — Trends
- **Mood Timeline**: 30-day scrollable timeline of valence (-1 to +1).
- **Emotion Heatmap Calendar**: GitHub-style contribution graph colored by composite valence.
- **Family Distribution**: Donut chart of logs per emotion family.
- **Top Emotions**: Ranked list.
- **Trigger Correlation**: Horizontal bar chart of triggers vs. valence.
- **Time-of-Day Patterns**: Radial clock chart of mood averages.

## Tab 3 — Patterns & Insights
- **Pattern Detection**: Spirals, high arousal, crisis keyword detection.
- **Insight Tiers**: Insight (Green), Nudge (Amber), Concern (Orange), Crisis (Red - non-dismissible).
- **Crisis card** must include helplines: iCall (9152987821), Vandrevala (1860-2662-345), AASRA (9820466726).
- **Vocabulary Growth Tracker**: Word cloud or line graph of unique emotion words over time.
- **Weekly Summary Card**: Auto-generated trends.

## Background Shader
- WebGL or highly-performant CSS animated gradient.
- Maps to compositeValence and compositeArousal.
- Hue: valence (negative=blue/purple, neutral=teal, positive=gold/amber).
- Saturation: |valence| * 40 + 20.
- Animation speed affected by arousal.

## State Management & Architecture
- Follow existing Sentience patterns (e.g., `localStorage`).
- Lazy-load emotion taxonomy data.
- Do not use LLMs for this feature; everything is rule-based pattern detection.
- No new robust backend required unless Sentience already has one; use local state.
