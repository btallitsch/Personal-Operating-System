import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Layout/Sidebar'
import LoginPage from './components/Auth/LoginPage'
import Dashboard from './pages/Dashboard'
import GoalsPage from './pages/GoalsPage'
import ProjectsPage from './pages/ProjectsPage'
import HabitsPage from './pages/HabitsPage'
import NotesPage from './pages/NotesPage'
import WeeklyPage from './pages/WeeklyPage'
import type { NavPage } from './types'
import { Cpu } from 'lucide-react'

export interface NavState {
  page: NavPage
  filter?: {
    goalId?: string
    projectId?: string
    habitId?: string
  }
}

// ─── Inner shell (requires auth) ──────────────────────────────────────────────

function AppShell() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [nav, setNav] = useState<NavState>({ page: 'dashboard' })

  // While Firebase resolves the auth session
  if (authLoading) {
    return (
      <div className="boot-screen">
        <Cpu size={28} color="var(--accent-primary)" className="boot-icon" />
        <div className="boot-label">INITIALIZING...</div>
      </div>
    )
  }

  // Not signed in → show login
  if (!user) return <LoginPage />

  const navigate = (page: NavPage, filter?: NavState['filter']) => {
    setNav({ page, filter })
  }

  return (
    <AppProvider uid={user.uid}>
      <div className="app-layout">
        <Sidebar nav={nav} navigate={(page) => navigate(page)} user={user} onSignOut={signOut} />

        <main className="main-content">
          <div className="content-inner">
            {nav.page === 'dashboard' && <Dashboard navigate={navigate} />}
            {nav.page === 'goals'     && <GoalsPage navigate={navigate} filter={nav.filter} />}
            {nav.page === 'projects'  && <ProjectsPage navigate={navigate} filter={nav.filter} />}
            {nav.page === 'habits'    && <HabitsPage navigate={navigate} filter={nav.filter} />}
            {nav.page === 'notes'     && <NotesPage navigate={navigate} filter={nav.filter} />}
            {nav.page === 'weekly'    && <WeeklyPage navigate={navigate} />}
          </div>
        </main>
      </div>
    </AppProvider>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
