import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Layout/Sidebar'
import Dashboard from './pages/Dashboard'
import GoalsPage from './pages/GoalsPage'
import ProjectsPage from './pages/ProjectsPage'
import HabitsPage from './pages/HabitsPage'
import NotesPage from './pages/NotesPage'
import WeeklyPage from './pages/WeeklyPage'
import type { NavPage } from './types'

export interface NavState {
  page: NavPage
  filter?: {
    goalId?: string
    projectId?: string
    habitId?: string
  }
}

export default function App() {
  const [nav, setNav] = useState<NavState>({ page: 'dashboard' })

  const navigate = (page: NavPage, filter?: NavState['filter']) => {
    setNav({ page, filter })
  }

  return (
    <AppProvider>
      <div className="app-layout">
        <Sidebar nav={nav} navigate={(page) => navigate(page)} />

        <main className="main-content">
          <div className="content-inner">
            {nav.page === 'dashboard' && (
              <Dashboard navigate={navigate} />
            )}
            {nav.page === 'goals' && (
              <GoalsPage navigate={navigate} filter={nav.filter} />
            )}
            {nav.page === 'projects' && (
              <ProjectsPage navigate={navigate} filter={nav.filter} />
            )}
            {nav.page === 'habits' && (
              <HabitsPage navigate={navigate} filter={nav.filter} />
            )}
            {nav.page === 'notes' && (
              <NotesPage navigate={navigate} filter={nav.filter} />
            )}
            {nav.page === 'weekly' && (
              <WeeklyPage navigate={navigate} />
            )}
          </div>
        </main>
      </div>
    </AppProvider>
  )
}
