import { useState, useEffect } from 'react'
import {
  CalendarDays,
  Target,
  FolderOpen,
  CheckCircle2,
  Circle,
  Save,
  ChevronLeft,
  ChevronRight,
  Repeat2,
  Zap,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { WeeklyFocus, NavPage } from '../types'
import type { NavState } from '../App'
import {
  getWeekStart,
  getDaysInWeek,
  getDayName,
  todayStr,
  generateId,
  formatShortDate,
} from '../utils/id'

interface WeeklyPageProps {
  navigate: (page: NavPage, filter?: NavState['filter']) => void
}

export default function WeeklyPage({ navigate }: WeeklyPageProps) {
  const {
    state,
    upsertWeekly,
    toggleHabit,
    isHabitDoneToday,
    getHabitStreak,
  } = useApp()

  const today = todayStr()
  const [weekOffset, setWeekOffset] = useState(0)

  const currentWeekStart = (() => {
    const base = new Date()
    base.setDate(base.getDate() + weekOffset * 7)
    return getWeekStart(base)
  })()

  const weekDays = getDaysInWeek(currentWeekStart)
  const isCurrentWeek = weekOffset === 0

  // Find or create focus for this week
  const existingFocus = state.weeklyFocuses.find(
    (w) => w.weekStart === currentWeekStart
  )

  const [focusGoalIds, setFocusGoalIds] = useState<string[]>(
    existingFocus?.focusGoalIds ?? []
  )
  const [topProjectIds, setTopProjectIds] = useState<string[]>(
    existingFocus?.topProjectIds ?? []
  )
  const [intention, setIntention] = useState(
    existingFocus?.intention ?? ''
  )
  const [reflection, setReflection] = useState(
    existingFocus?.reflection ?? ''
  )
  const [saved, setSaved] = useState(false)

  // Reset form when week changes
  useEffect(() => {
    const f = state.weeklyFocuses.find((w) => w.weekStart === currentWeekStart)
    setFocusGoalIds(f?.focusGoalIds ?? [])
    setTopProjectIds(f?.topProjectIds ?? [])
    setIntention(f?.intention ?? '')
    setReflection(f?.reflection ?? '')
    setSaved(false)
  }, [currentWeekStart, state.weeklyFocuses])

  const handleSave = () => {
    const focus: WeeklyFocus = {
      id: existingFocus?.id ?? generateId(),
      weekStart: currentWeekStart,
      focusGoalIds,
      topProjectIds,
      intention,
      reflection,
      createdAt: existingFocus?.createdAt ?? new Date().toISOString(),
    }
    upsertWeekly(focus)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleGoalFocus = (id: string) => {
    setFocusGoalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleProjectFocus = (id: string) => {
    setTopProjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const activeGoals = state.goals.filter((g) => g.status === 'active')
  const activeProjects = state.projects.filter((p) => p.status === 'active')
  const dailyHabits = state.habits.filter((h) => h.frequency === 'daily')

  const weekLabel = (() => {
    const start = new Date(currentWeekStart + 'T00:00:00')
    const end = new Date(currentWeekStart + 'T00:00:00')
    end.setDate(end.getDate() + 6)
    return `${formatShortDate(currentWeekStart)} – ${formatShortDate(end.toISOString().split('T')[0])}`
  })()

  return (
    <div className="fade-in">
      <div className="page-header">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2>Weekly Plan</h2>
            <p className="subtitle">DESIGN YOUR WEEK WITH INTENTION</p>
          </div>

          {/* Week nav */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <button
              className="btn-icon"
              onClick={() => setWeekOffset((o) => o - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: isCurrentWeek ? 'var(--accent-primary)' : 'var(--text-secondary)',
                minWidth: 140,
                textAlign: 'center',
              }}
            >
              {isCurrentWeek ? 'THIS WEEK' : weekLabel}
            </div>
            <button
              className="btn-icon"
              onClick={() => setWeekOffset((o) => o + 1)}
              disabled={weekOffset >= 0}
              style={{ opacity: weekOffset >= 0 ? 0.3 : 1 }}
            >
              <ChevronRight size={14} />
            </button>
            {weekOffset !== 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setWeekOffset(0)}
              >
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-content">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr',
            gap: 24,
          }}
        >
          {/* ── Left: Planning ── */}
          <div>
            {/* Intention */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div
                className="form-label"
                style={{ marginBottom: 8 }}
              >
                Weekly Intention
              </div>
              <textarea
                className="form-textarea"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="What does a successful week look like? What's the one thing you must accomplish?"
                rows={3}
                style={{ minHeight: 80 }}
              />
            </div>

            {/* Focus Goals */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div
                className="form-label"
                style={{ marginBottom: 10 }}
              >
                Focus Goals This Week
              </div>
              {activeGoals.length === 0 ? (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate('goals')}
                >
                  Add goals first →
                </button>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {activeGoals.map((goal) => {
                    const selected = focusGoalIds.includes(goal.id)
                    return (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoalFocus(goal.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          background: selected
                            ? `${goal.color}18`
                            : 'var(--bg-elevated)',
                          border: `1px solid ${selected ? goal.color : 'var(--border)'}`,
                          borderRadius: 'var(--radius)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ color: selected ? goal.color : 'var(--text-muted)' }}>
                          {selected ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <Circle size={13} />
                          )}
                        </div>
                        <Target size={11} color={goal.color} />
                        <span
                          style={{
                            fontSize: 12,
                            color: selected ? goal.color : 'var(--text-secondary)',
                            fontWeight: selected ? 500 : 400,
                          }}
                        >
                          {goal.title}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Top Projects */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div
                className="form-label"
                style={{ marginBottom: 10 }}
              >
                Projects in Focus
              </div>
              {activeProjects.length === 0 ? (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate('projects')}
                >
                  Add projects first →
                </button>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {activeProjects.map((project) => {
                    const selected = topProjectIds.includes(project.id)
                    const linkedGoal = state.goals.find(
                      (g) => g.id === project.goalId
                    )
                    return (
                      <button
                        key={project.id}
                        onClick={() => toggleProjectFocus(project.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          background: selected
                            ? 'rgba(77,184,255,0.1)'
                            : 'var(--bg-elevated)',
                          border: `1px solid ${selected ? 'var(--accent-blue)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div
                          style={{
                            color: selected
                              ? 'var(--accent-blue)'
                              : 'var(--text-muted)',
                          }}
                        >
                          {selected ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <Circle size={13} />
                          )}
                        </div>
                        <FolderOpen
                          size={11}
                          color={
                            selected ? 'var(--accent-blue)' : 'var(--text-muted)'
                          }
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: 12,
                              color: selected
                                ? 'var(--accent-blue)'
                                : 'var(--text-secondary)',
                              display: 'block',
                            }}
                          >
                            {project.title}
                          </span>
                          {linkedGoal && (
                            <span
                              style={{
                                fontSize: 10,
                                color: linkedGoal.color,
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              ↳ {linkedGoal.title}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Reflection (for past/current weeks) */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div
                className="form-label"
                style={{ marginBottom: 8 }}
              >
                {isCurrentWeek ? 'Mid-Week Notes' : 'Reflection'}
              </div>
              <textarea
                className="form-textarea"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder={
                  isCurrentWeek
                    ? "How is the week going? Any blockers?"
                    : "How did the week go? What did you learn?"
                }
                rows={3}
              />
            </div>

            {/* Save button */}
            <button
              className="btn btn-primary"
              onClick={handleSave}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={14} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Weekly Plan
                </>
              )}
            </button>
          </div>

          {/* ── Right: Habit Calendar for the week ── */}
          <div>
            <div className="section-header">
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarDays size={14} color="var(--accent-primary)" />
                Habit Tracking
              </h3>
            </div>

            {dailyHabits.length === 0 ? (
              <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    letterSpacing: 1,
                  }}
                >
                  NO DAILY HABITS SET UP
                </p>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={() => navigate('habits')}
                >
                  Add habits →
                </button>
              </div>
            ) : (
              <div className="card">
                {/* Day headers */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr repeat(7, 36px)',
                    gap: 4,
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div />
                  {weekDays.map((day) => {
                    const isToday = day === today
                    return (
                      <div
                        key={day}
                        style={{
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9,
                          letterSpacing: 0.5,
                          color: isToday
                            ? 'var(--accent-primary)'
                            : 'var(--text-muted)',
                          fontWeight: isToday ? 700 : 400,
                        }}
                      >
                        <div>{getDayName(day)}</div>
                        <div style={{ fontSize: 11, marginTop: 1 }}>
                          {new Date(day + 'T00:00:00').getDate()}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Habit rows */}
                {dailyHabits.map((habit) => {
                  const streak = getHabitStreak(habit.id)
                  return (
                    <div
                      key={habit.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr repeat(7, 36px)',
                        gap: 4,
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      {/* Habit name */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          minWidth: 0,
                        }}
                      >
                        <Repeat2 size={10} color={habit.color} />
                        <span
                          style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {habit.title}
                        </span>
                        {streak > 1 && (
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              fontFamily: 'var(--font-mono)',
                              fontSize: 9,
                              color: 'var(--accent-secondary)',
                              flexShrink: 0,
                            }}
                          >
                            <Zap size={8} fill="var(--accent-secondary)" />
                            {streak}
                          </span>
                        )}
                      </div>

                      {/* Day cells */}
                      {weekDays.map((day) => {
                        const done = habit.completions.some(
                          (c) => c.date === day && c.completed
                        )
                        const isToday = day === today
                        const isFuture = day > today
                        return (
                          <button
                            key={day}
                            disabled={isFuture}
                            onClick={() => toggleHabit(habit.id, day)}
                            title={`${getDayName(day)} ${formatShortDate(day)}`}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 'var(--radius-sm)',
                              background: done ? habit.color : 'var(--bg-elevated)',
                              border: `1px solid ${isToday ? habit.color : done ? habit.color : 'var(--border)'}`,
                              cursor: isFuture ? 'default' : 'pointer',
                              opacity: isFuture ? 0.2 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              transition: 'all 0.12s',
                              padding: 0,
                            }}
                          >
                            {done && (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: '#080b0f',
                                  fontWeight: 700,
                                }}
                              >
                                ✓
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}

                {/* Week completion summary */}
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  {weekDays.map((day) => {
                    if (day > today) return null
                    const dayDone = dailyHabits.filter((h) =>
                      h.completions.some((c) => c.date === day && c.completed)
                    ).length
                    const pct =
                      dailyHabits.length > 0
                        ? Math.round((dayDone / dailyHabits.length) * 100)
                        : 0
                    const isToday = day === today
                    return (
                      <div
                        key={day}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            color: isToday
                              ? 'var(--accent-primary)'
                              : 'var(--text-muted)',
                            width: 30,
                            flexShrink: 0,
                          }}
                        >
                          {getDayName(day)}
                        </span>
                        <div
                          className="progress-bar"
                          style={{ flex: 1, height: 4 }}
                        >
                          <div
                            className="progress-fill"
                            style={{
                              width: `${pct}%`,
                              background:
                                pct === 100
                                  ? 'var(--accent-primary)'
                                  : 'var(--accent-blue)',
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            color:
                              pct === 100
                                ? 'var(--accent-primary)'
                                : 'var(--text-muted)',
                            width: 24,
                            textAlign: 'right',
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* This week's focus summary */}
            {(focusGoalIds.length > 0 || topProjectIds.length > 0) && (
              <div
                className="card"
                style={{
                  marginTop: 16,
                  borderColor: 'rgba(126,255,160,0.2)',
                }}
              >
                <div
                  className="form-label"
                  style={{ marginBottom: 10 }}
                >
                  THIS WEEK'S FOCUS
                </div>

                {focusGoalIds.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        color: 'var(--text-muted)',
                        letterSpacing: 1,
                        marginBottom: 6,
                      }}
                    >
                      GOALS
                    </div>
                    {focusGoalIds.map((gid) => {
                      const g = state.goals.find((x) => x.id === gid)
                      if (!g) return null
                      return (
                        <div
                          key={gid}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 4,
                          }}
                        >
                          <Target size={10} color={g.color} />
                          <span
                            style={{
                              fontSize: 12,
                              color: g.color,
                            }}
                          >
                            {g.title}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {topProjectIds.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        color: 'var(--text-muted)',
                        letterSpacing: 1,
                        marginBottom: 6,
                      }}
                    >
                      PROJECTS
                    </div>
                    {topProjectIds.map((pid) => {
                      const p = state.projects.find((x) => x.id === pid)
                      if (!p) return null
                      return (
                        <div
                          key={pid}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 4,
                          }}
                        >
                          <FolderOpen
                            size={10}
                            color="var(--accent-blue)"
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {p.title}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {intention && (
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        color: 'var(--text-muted)',
                        letterSpacing: 1,
                        marginBottom: 4,
                      }}
                    >
                      INTENTION
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                      }}
                    >
                      "{intention}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
