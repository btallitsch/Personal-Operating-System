import {
  LayoutDashboard,
  Target,
  FolderOpen,
  Repeat2,
  StickyNote,
  CalendarDays,
  Cpu,
  LogOut,
} from 'lucide-react'
import type { User } from 'firebase/auth'
import type { NavPage } from '../../types'
import { useApp } from '../../context/AppContext'
import type { NavState } from '../../App'

interface SidebarProps {
  nav:       NavState
  navigate:  (page: NavPage) => void
  user:      User
  onSignOut: () => void
}

const NAV_ITEMS: { id: NavPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'goals',     label: 'Goals',     icon: Target },
  { id: 'projects',  label: 'Projects',  icon: FolderOpen },
  { id: 'habits',    label: 'Habits',    icon: Repeat2 },
  { id: 'notes',     label: 'Notes',     icon: StickyNote },
  { id: 'weekly',    label: 'Weekly',    icon: CalendarDays },
]

export default function Sidebar({ nav, navigate, user, onSignOut }: SidebarProps) {
  const { state, getTodayHabits, isHabitDoneToday, loading } = useApp()

  const counts: Record<NavPage, number | null> = {
    dashboard: null,
    goals:    state.goals.filter((g) => g.status === 'active').length,
    projects: state.projects.filter((p) => p.status === 'active').length,
    habits: (() => {
      const today = getTodayHabits()
      const done  = today.filter((h) => isHabitDoneToday(h.id)).length
      return today.length > 0 ? today.length - done : today.length
    })(),
    notes:  state.notes.length,
    weekly: null,
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Cpu size={18} color="var(--accent-primary)" />
          <h1>Personal OS</h1>
        </div>
        <span>command center v1</span>
      </div>

      {/* Nav */}
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

      {/* Stats */}
      {!loading && (
        <div className="sidebar-stats-row">
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{state.goals.length}</span>
            <span className="sidebar-stat-label">goals</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{state.projects.length}</span>
            <span className="sidebar-stat-label">proj</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{state.habits.length}</span>
            <span className="sidebar-stat-label">habits</span>
          </div>
        </div>
      )}

      {/* User footer */}
      <div className="sidebar-user">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'User'}
            className="sidebar-avatar"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="sidebar-avatar-fallback">
            {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
          </div>
        )}
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">
            {user.displayName?.split(' ')[0] ?? 'User'}
          </span>
          <span className="sidebar-user-email">{user.email}</span>
        </div>
        <button
          className="btn-icon"
          onClick={onSignOut}
          title="Sign out"
          style={{ flexShrink: 0 }}
        >
          <LogOut size={13} />
        </button>
      </div>
    </aside>
  )
}
