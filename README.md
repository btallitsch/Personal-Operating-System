# Personal OS

A personal command center for life — a dashboard that connects your goals, projects, habits, notes, and weekly planning into a unified system.

## Features

### Modules

| Module | Description |
|---|---|
| **Dashboard** | Live connection map showing Goal → Project → Habit chains + today's check-in |
| **Goals** | Define what matters, assign a category, color, and target date |
| **Projects** | Task-based projects that link to goals |
| **Habits** | Daily/weekly habit tracking with 30-day grid + streak counter |
| **Notes** | Tagged notes that link to goals or projects |
| **Weekly** | Weekly planning: set intention, choose focus goals, track habits |

### The Connection System

Everything links together. When you create:
- A **Goal** — it automatically aggregates progress from linked projects
- A **Project** — links to a goal, tracks tasks, links to supporting habits
- A **Habit** — links to a project and/or goal, tracked daily with streak display
- A **Note** — can reference a goal or project for context
- A **Weekly Plan** — select which goals and projects to focus on this week

Progress propagates upward: task completion → project % → goal %

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** for dev/build
- **Lucide React** for icons
- **localStorage** for persistence (no backend needed)
- State managed via `useReducer` + `createContext`

## Architecture

```
src/
  types/         → All TypeScript interfaces
  utils/         → Pure utility functions (dates, IDs)
  services/      → localStorage read/write
  context/       → AppContext: single source of truth, all actions + computed values
  components/
    Layout/      → Sidebar
    UI/          → Modal
  pages/         → Dashboard, GoalsPage, ProjectsPage, HabitsPage, NotesPage, WeeklyPage
  App.tsx        → Root component with navigation state
  main.tsx       → Entry point
  index.css      → Design system + full CSS
```

## Getting Started

```bash
npm install
npm run dev
```

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. No environment variables needed — runs fully client-side

## Design

Industrial command-center aesthetic:
- **Bebas Neue** for display headings
- **JetBrains Mono** for data/meta
- **DM Sans** for body text
- Dark base with neon mint accent (#7effa0)
- Scanline texture on sidebar, noise overlay on main content
