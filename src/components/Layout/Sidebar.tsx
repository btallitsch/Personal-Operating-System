import {
  LayoutDashboard,
  Target,
  FolderOpen,
  Repeat2,
  StickyNote,
  CalendarDays,
  Cpu,
} from 'lucide-react'
import type { NavPage } from '../../types'
import { useApp } from '../../context/AppContext'
import type { NavState } from '../../App'

interface SidebarProps {
  nav: NavState
  navigate: (page: NavPage) => void
}

const NAV_ITEMS: {
  id: NavPage
  label: string
  icon: typeof LayoutDashboard
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'habits', label: 'Habits', icon: Repeat2 },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'weekly', label: 'Weekly', icon: CalendarDays },
]

export default function Sidebar({ nav, navigate }: SidebarProps) {
  const { state, getTodayHabits, isHabitDoneToday } = useApp()

  const counts: Record<NavPage, number | null> = {
    dashboard: null,
    goals: state.goals.filter((g) => g.status === 'active').length,
    projects: state.projects.filter((p) => p.status === 'active').length,
    habits: (() => {
      const today = getTodayHabits()
      const done = today.filter((h) => isHabitDoneToday(h.id)).length
      return today.length > 0 ? today.length - done : today.length
    })(),
    notes: state.notes.length,
    weekly: null,
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Cpu size={18} color="var(--accent-primary)" />
          <h1>Personal OS</h1>
        </div>
        <span>command center v1</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Modules</div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${nav.page === id ? 'active' : ''}`}
            onClick={() => navigate(id)}
          >
            <Icon className="icon" size={15} />
            <span>{label}</span>
            {counts[id] !== null && counts[id]! > 0 && (
              <span className="count">{counts[id]}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-stats">
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{state.goals.length}</span>
            <span className="sidebar-stat-label">goals</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{state.projects.length}</span>
            <span className="sidebar-stat-label">projects</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{state.habits.length}</span>
            <span className="sidebar-stat-label">habits</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
