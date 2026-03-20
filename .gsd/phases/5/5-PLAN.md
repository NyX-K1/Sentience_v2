---
phase: 5
plan: 1
wave: 1
---
# Plan 5.1: Patterns, Insights & Crisis Engine

## Objective
Implement the rule-based insight engine, nudges, and vocabulary tracker.

## Context
- .gsd/SPEC.md
- Requires the `data/helplines.ts` and pattern matching logic.

## Tasks
<task type="auto">
  <name>Implement Pattern Detection Engine</name>
  <files>
    - src/hooks/usePatternDetection.ts
    - src/data/helplines.ts
  </files>
  <action>
    - Create `helplines.ts` with required crisis contacts (iCall, Vandrevala, AASRA).
    - Build `usePatternDetection.ts` logic to comb through state logs:
      - Detect 3+ consecutive negative days (Nudge)
      - Detect 5+ negative days / High Arousal (Concern)
      - Detect Crisis Keywords in notes (Crisis).
    - Structure insights into tiered arrays.
  </action>
  <verify>npm run build</verify>
  <done>Engine reliably returns tiered insights depending on test data inputs.</done>
</task>

<task type="auto">
  <name>Build Insight UI and Vocabulary Tracking</name>
  <files>
    - src/components/InsightCard.tsx
    - src/components/CrisisCard.tsx
    - src/components/VocabularyTracker.tsx
    - src/pages/MoodTracker.tsx
  </files>
  <action>
    - Build `InsightCard.tsx` (variants: Green, Amber, Orange) and `CrisisCard.tsx` (Red, sticky, non-dismissible).
    - Build `VocabularyTracker.tsx`: A visual representation of unique emotions used over time ("Your emotional vocabulary has grown...").
    - Assemble these components into Tab 3 of `MoodTracker.tsx`.
    - Provide a footer link on all tabs accessing the crisis resources directly.
  </action>
  <verify>npm run lint</verify>
  <done>Insights display correctly, matching the generated warning level, and vocabulary growth is accurately depicted.</done>
</task>

## Success Criteria
- [ ] Insight tab highlights patterns and interventions immediately upon saving a new log.
- [ ] Crises are caught and handled gently but prominently.
