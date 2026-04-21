# Tempo: Development Roadmap

## Phase 1: Data Integrity & History (The "Foundations")
- [x] **Entry Management:** UI to Delete existing entries.
- [x] **Google Sheet Import:** A script to migrate your 700+ hours into the local database. (Implemented)
- [x] **Data Export:** Export your data back to CSV or JSON. (Implemented)

## Phase 2: Deep Analytics (The "Researcher's Insight")
- [x] **Comprehensive Data Views:** View total hours and breakdowns by week, month, 3m, 6m, 1y, and all-time. (Implemented)
- [x] **Weekly "Flow" Heatmap:** A visual grid (like GitHub's) showing your daily intensity. (Implemented)
- [x] **Productivity Tendencies:** A chart showing which hours of the day you actually log the most research time. (Implemented)
- [x] **Daily & Weekly Targets:** Visual progress bars for research/work goals. (Implemented)

## Phase 3: System Integration (The "Native Feel")
- [x] **Linux Desktop Launcher:** Making the app searchable via the Ubuntu activities menu. (Implemented)
- [ ] **Tray Icon:** A small persistent timer in the top bar of your Ubuntu desktop.
- [x] **Active Timer Persistence:** Ensure the timer survives app restarts or crashes. (Implemented)

## Phase 4: Advanced UX
- [x] **Category Editor:** Add/Remove/Color-code categories without touching code. (Implemented)
- [x] **Dark Mode:** A research-friendly dark theme with persistence. (Implemented)
- [ ] **Idle Detection:** Prompting to stop the timer if no activity is detected.

## Phase 5: Visual Polish & Delighters (New!)
- [x] **Premium Design System:** Refined typography, spacing, and shadows for a "native app" feel. (Implemented)
- [x] **Quick Start Flow:** Start timers directly from the Dashboard with one click. (Implemented)
- [x] **Animated Transitions:** Smooth transitions between tabs and hover states. (Implemented)
- [x] **Dashboard Command Center:** Re-designed layout with high-level stats (This Week, Total Logs, Main Project). (Implemented)

## Phase 6: The Dopamine Engine (Gamification)
- [ ] **XP & Leveling System:** Convert hours into "Focus XP" with unlockable rank titles.
- [x] **Flow Streaks:** Visual fire icon and counter for consecutive days meeting goals. (Implemented)
- [x] **The "Zen" Sound Library:** High-quality audio feedback for Start/Stop/Goal-reached events. (Implemented)
- [ ] **Focus Soundscapes:** Integrated white/pink/brown noise generator active only during timers.
- [ ] **Milestone Celebrations:** 
    - [x] **Golden State:** Progress bars glow/breathe when weekly target is 100% met. (Implemented)
    - [ ] **Achievement Badges:** (Optional) Unlockable trophies for hours/time-of-day milestones.
    - [ ] **Monday Victory Lap:** (Optional) A "Week in Review" summary screen.

## Phase 7: Project Hierarchy (Sub-Tasks & Nested Goals)
- [x] **Parent-Child Projects:** Link sub-projects (e.g., "Reading") to a parent (e.g., "Research") in Settings. (Implemented)
- [x] **Aggregated Progress:** Time logged to a sub-project automatically counts toward the Parent's total goal. (Implemented)
- [x] **Nested Dashboard UI:** Progress bars indented under their parents for a clear project breakdown. (Implemented)

## Phase 8: Architectural Refinement (Scaling & Maintainability)
- [ ] **Decouple Business Logic:** Extract complex calculations (Streaks, Duration Distribution, Goals) from UI components into testable service layers.
- [ ] **Type-Safe SQL:** Transition from raw SQL strings in `db.ts` to a type-safe query builder like **Kysely** to prevent runtime schema errors.
- [ ] **Data Fetching Strategy:** Implement **TanStack Query** for efficient data synchronization, caching, and to reduce "prop drilling" from `App.tsx`.
- [ ] **Component Granularity:** Refactor "God Components" (Dashboard, Insights) into smaller, focused feature directories for easier navigation and testing.

