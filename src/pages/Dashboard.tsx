import {
  Target,
  FolderOpen,
  Repeat2,
  StickyNote,
  ChevronRight,
  Zap,
  TrendingUp,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { NavPage } from '../types'
import type { NavState } from '../App'
import { todayStr } from '../utils/id'

interface DashboardProps {
  navigate: (page: NavPage, filter?: NavState['filter']) => void
}

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-green',
  completed: 'badge-blue',
  paused: 'badge-muted',
  'on-hold': 'badge-yellow',
}

export default function Dashboard({ navigate }: DashboardProps) {
  const {
    state,
    getGoalProgress,
    getHabitStreak,
    isHabitDoneToday,
    toggleHabit,
    getTodayHabits,
  } = useApp()

  const activeGoals = state.goals.filter((g) => g.status === 'active')
  const activeProjects = state.projects.filter((p) => p.status === 'active')
  const todayHabits = getTodayHabits()
  const doneToday = todayHabits.filter((h) => isHabitDoneToday(h.id)).length
  const today = todayStr()

  const completionRate =
    todayHabits.length > 0
      ? Math.round((doneToday / todayHabits.length) * 100)
      : 0

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2>Dashboard</h2>
          <span
            className="badge badge-green"
            style={{ fontSize: 10, letterSpacing: 2 }}
          >
            LIVE
          </span>
        </div>
        <p className="subtitle">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }).toUpperCase()}
        </p>
      </div>

      <div className="page-content">
        {/* ── Stat Row ── */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <div
            className="stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('goals')}
          >
            <Target size={14} color="var(--accent-primary)" />
            <div className="stat-value" style={{ marginTop: 8 }}>
              {activeGoals.length}
            </div>
            <div className="stat-label">Active Goals</div>
          </div>
          <div
            className="stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('projects')}
          >
            <FolderOpen size={14} color="var(--accent-blue)" />
            <div className="stat-value" style={{ marginTop: 8, color: 'var(--accent-blue)' }}>
              {activeProjects.length}
            </div>
            <div className="stat-label">Active Projects</div>
          </div>
          <div
            className="stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('habits')}
          >
            <Repeat2 size={14} color="var(--accent-secondary)" />
            <div className="stat-value" style={{ marginTop: 8, color: 'var(--accent-secondary)' }}>
              {doneToday}/{todayHabits.length}
            </div>
            <div className="stat-label">Habits Today</div>
          </div>
          <div
            className="stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('notes')}
          >
            <StickyNote size={14} color="var(--accent-yellow)" />
            <div className="stat-value" style={{ marginTop: 8, color: 'var(--accent-yellow)' }}>
              {state.notes.length}
            </div>
            <div className="stat-label">Notes</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* ── Today's Habits ── */}
          <div>
            <div className="section-header">
              <h3 className="section-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Today's Check-In
                  {todayHabits.length > 0 && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: completionRate === 100 ? 'var(--accent-primary)' : 'var(--text-muted)',
                      }}
                    >
                      {completionRate}%
                    </span>
                  )}
                </span>
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('habits')}
              >
                <ChevronRight size={12} />
              </button>
            </div>

            {todayHabits.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                NO HABITS CONFIGURED
                <br />
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={() => navigate('habits')}
                >
                  Add first habit →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayHabits.map((habit) => {
                  const done = isHabitDoneToday(habit.id)
                  const streak = getHabitStreak(habit.id)
                  const linkedProject = state.projects.find(
                    (p) => p.id === habit.projectId
                  )
                  return (
                    <div
                      key={habit.id}
                      className="card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderColor: done ? 'rgba(126,255,160,0.2)' : undefined,
                        cursor: 'pointer',
                        opacity: done ? 0.7 : 1,
                      }}
                      onClick={() => toggleHabit(habit.id, today)}
                    >
                      <div style={{ color: done ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0 }}>
                        {done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="card-title"
                          style={{
                            fontSize: 13,
                            textDecoration: done ? 'line-through' : 'none',
                            color: done ? 'var(--text-muted)' : undefined,
                          }}
                        >
                          {habit.title}
                        </div>
                        {linkedProject && (
                          <div
                            className="card-meta"
                            style={{ color: habit.color }}
                          >
                            ↳ {linkedProject.title}
                          </div>
                        )}
                      </div>
                      {streak > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            color: 'var(--accent-secondary)',
                          }}
                        >
                          <Zap size={10} fill="var(--accent-secondary)" />
                          {streak}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Progress bar */}
                {todayHabits.length > 0 && (
                  <div className="progress-bar" style={{ height: 4, marginTop: 4 }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Active Goals ── */}
          <div>
            <div className="section-header">
              <h3 className="section-title">Goal Progress</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('goals')}
              >
                <ChevronRight size={12} />
              </button>
            </div>

            {activeGoals.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                NO ACTIVE GOALS
                <br />
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={() => navigate('goals')}
                >
                  Add first goal →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeGoals.map((goal) => {
                  const progress = getGoalProgress(goal.id)
                  const projectCount = goal.projectIds.length
                  return (
                    <div
                      key={goal.id}
                      className="card"
                      style={{
                        borderLeft: `3px solid ${goal.color}`,
                        padding: '12px 14px',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate('goals')}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div className="card-title" style={{ fontSize: 13 }}>
                          {goal.title}
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                            color: goal.color,
                            flexShrink: 0,
                            marginLeft: 8,
                          }}
                        >
                          {progress}%
                        </span>
                      </div>
                      <div className="card-meta" style={{ marginBottom: 8 }}>
                        {goal.category} · {projectCount} project
                        {projectCount !== 1 ? 's' : ''}
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${progress}%`,
                            background: goal.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Connection Map ── */}
        <div style={{ marginTop: 24 }}>
          <div className="section-header">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={14} color="var(--accent-primary)" />
              Connection Map
            </h3>
            <span
              className="badge badge-muted"
              style={{ fontSize: 9, letterSpacing: 2 }}
            >
              GOAL → PROJECT → HABIT
            </span>
          </div>

          {activeGoals.length === 0 ? (
            <div
              className="card"
              style={{ padding: 24, textAlign: 'center' }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  letterSpacing: 1,
                }}
              >
                START ADDING GOALS, PROJECTS & HABITS
                <br />
                THE SYSTEM WILL MAP THEIR CONNECTIONS HERE
              </p>
            </div>
          ) : (
            <div
              className="card"
              style={{ padding: '16px 20px' }}
            >
              {activeGoals.map((goal, gi) => {
                const linkedProjects = goal.projectIds
                  .map((pid) => state.projects.find((p) => p.id === pid))
                  .filter(Boolean) as typeof state.projects
                return (
                  <div
                    key={goal.id}
                    style={{ marginBottom: gi < activeGoals.length - 1 ? 16 : 0 }}
                  >
                    {/* Goal node */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        marginBottom: 6,
                      }}
                      onClick={() => navigate('goals')}
                    >
                      <Target size={12} color={goal.color} />
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 13,
                          fontWeight: 700,
                          color: goal.color,
                        }}
                      >
                        {goal.title}
                      </span>
                      <span
                        className={`badge ${STATUS_COLORS[goal.status]}`}
                      >
                        {goal.status}
                      </span>
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--text-muted)',
                        }}
                      >
                        {getGoalProgress(goal.id)}%
                      </span>
                    </div>

                    {linkedProjects.length === 0 && (
                      <div
                        style={{
                          paddingLeft: 20,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--text-muted)',
                        }}
                      >
                        └─ no projects linked
                      </div>
                    )}

                    {linkedProjects.map((project, pi) => {
                      const isLastProject = pi === linkedProjects.length - 1
                      const linkedHabits = project.habitIds
                        .map((hid) => state.habits.find((h) => h.id === hid))
                        .filter(Boolean) as typeof state.habits

                      return (
                        <div
                          key={project.id}
                          style={{ paddingLeft: 20 }}
                        >
                          {/* Project node */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginBottom: 4,
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              navigate('projects', { goalId: goal.id })
                            }
                          >
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 10,
                                color: 'var(--text-muted)',
                              }}
                            >
                              {isLastProject ? '└─' : '├─'}
                            </span>
                            <FolderOpen size={11} color="var(--accent-blue)" />
                            <span
                              style={{
                                fontSize: 12,
                                color: 'var(--text-primary)',
                                fontWeight: 500,
                              }}
                            >
                              {project.title}
                            </span>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 9,
                                color: 'var(--accent-blue)',
                              }}
                            >
                              {project.tasks.length} tasks
                            </span>
                          </div>

                          {/* Habit nodes */}
                          {linkedHabits.map((habit, hi) => {
                            const isLastHabit = hi === linkedHabits.length - 1
                            const streak = getHabitStreak(habit.id)
                            const doneNow = isHabitDoneToday(habit.id)
                            return (
                              <div
                                key={habit.id}
                                style={{
                                  paddingLeft: 20,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  marginBottom: hi < linkedHabits.length - 1 ? 2 : 6,
                                  cursor: 'pointer',
                                }}
                                onClick={() =>
                                  navigate('habits', { projectId: project.id })
                                }
                              >
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 10,
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  {isLastHabit ? '└─' : '├─'}
                                </span>
                                <Repeat2
                                  size={10}
                                  color={habit.color || 'var(--accent-secondary)'}
                                />
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: doneNow
                                      ? 'var(--text-muted)'
                                      : 'var(--text-secondary)',
                                    textDecoration: doneNow
                                      ? 'line-through'
                                      : 'none',
                                  }}
                                >
                                  {habit.title}
                                </span>
                                {streak > 0 && (
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: 9,
                                      color: 'var(--accent-secondary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 2,
                                    }}
                                  >
                                    <Zap
                                      size={8}
                                      fill="var(--accent-secondary)"
                                    />
                                    {streak}d
                                  </span>
                                )}
                                {doneNow && (
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: 9,
                                      color: 'var(--accent-primary)',
                                    }}
                                  >
                                    ✓ done
                                  </span>
                                )}
                              </div>
                            )
                          })}

                          {linkedHabits.length === 0 && (
                            <div
                              style={{
                                paddingLeft: 20,
                                fontFamily: 'var(--font-mono)',
                                fontSize: 10,
                                color: 'var(--text-muted)',
                                marginBottom: 4,
                              }}
                            >
                              └─ no habits linked
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
