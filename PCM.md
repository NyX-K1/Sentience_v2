# Project Consciousness Model (PCM) - Sentience

## Executive Summary
**Sentience** is a monolithic conceptual prototype for a highly visual, AI-driven mental health application. Built predominantly with React, Vite, and Tailwind CSS, the codebase leans heavily into rich interactive experiences using Framer Motion, GSAP, and Three.js (via `@react-three/fiber`). The architecture is pragmatic and feature-driven ("hackathon vibe"), prioritizing rapid UI assembly and AI feature integration (Groq, Google Generative AI) over strict architectural patterns or automated testing. Technical debt is accumulating in tightly coupled UI-and-logic components, mostly residing in the `pages/` and `components/ui/` directories.

## Core Vibe & Philosophy
- **Pragmatism vs. Dogma**: Highly practical. The goal was clearly rapid visual iteration. No TDD or strict OOP.
- **Verbosity & Naming**: Descriptive component names (`RevealWaveImage`, `AuroraBorealisShader`), but sometimes sparse logic encapsulation.
- **Core Abstractions**: The central abstractions are visually driven "Pages" (e.g., `EmotionalUnloading`, `SmartJournalling`, `MindInfo`) that orchestrate specific AI interactions or sensory experiences.
- **Developer Intent**: Speed, visual "wow" factor, and AI integration were paramount.

## Architecture & Data Flow
- **Pattern**: Component-based UI (React) with hook-based local state (`useState`, `useMemo`). 
- **Routing**: Client-side routing via `react-router-dom` in `App.tsx` handling 13+ distinct experience routes.
- **Data**: State is mostly transient or `localStorage`-bound (e.g., `hooks/useMoodData.ts`). External AI API calls are likely handled directly in components or lightweight utilities.

## Key Metrics Dashboard
- **Total Source Files (TS/TSX)**: ~47
- **Major External Dependencies**: 22+ (React, Three.js, Framer Motion, GSAP, Tailwind, Groq SDK, Google Generative AI)
- **Top Contributors**: bajpaidhruv2018 (11 commits), Dhruv Bajpai (5 commits)
- **Estimated Test Coverage**: 0% (No test files found)
- **Cyclomatic Complexity Hotspots**: `useMoodData.ts` (Analytics calculations), Multi-step AI Pages (`SmartJournalling`, `CognitiveReframing`).

## Identified 'Points of Interest'

### 1. Refactoring Candidates
- **`useMoodData.ts`**: Currently handles state management, local storage side-effects, AND heavy analytics processing (consistency scores, top emotions, heatmaps, "Spiral Detector") all in a single hook. Should be split into distinct utility functions and pure state management to improve testability.
- **Page Components (e.g., `Discover.tsx`)**: Heavy mix of styling (`<style>` blocks), timeout logic, and complex component rendering. Could be split into container vs. presentational components.
- **AI Integration**: Logic for Groq and Gemini is likely coupled to individual pages rather than centralized in a robust service layer.

### 2. Architectural Concerns
- **Absence of a Data/Service Layer**: API calls and local storage interactions are mixed directly into React hooks and components.
- **Hardcoded Prompts**: With multiple AI features, prompt management might become unwieldy without a centralized store.
- **Performance & Asset Loading**: The `App.tsx` routing file imports everything statically. No lazy loading (`React.lazy`) is currently implemented for the heavily animated/3D pages, which could severely impact initial TTI (Time to Interactive).

### 3. Code `Archaeology` Sites
- **`pages/Discover.tsx`**: The entry point animation, blending CSS keyframes, complex array spreading for endless scrolling "credits", and the custom `<RevealWaveImage/>`. A great example of the project's visual ambition.
- **`hooks/useMoodData.ts`**: The "brain" of the historical tracking, revealing what metrics the app actually tracks for users (Consistency, Triggers, "Spiral Detector").

---
**Status**: ACTIVE VIBE-CODING STATE ACHIEVED.
**Ready for Directives.**
