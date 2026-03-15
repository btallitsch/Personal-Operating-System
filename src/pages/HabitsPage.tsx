import { useState } from 'react'
import {
  Plus,
  Repeat2,
  Pencil,
  Trash2,
  Zap,
  X,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import type { Habit, HabitFrequency, NavPage } from '../types'
import type { NavState } from '../App'
import { todayStr, getLast30Days, formatShortDate } from '../utils/id'

const COLORS = [
  '#7effa0', '#ff7c2a', '#4db8ff', '#ffd700', '#ff6eb4', '#c084fc',
]

interface HabitsPageProps {
  navigate: (page: NavPage, filter?: NavState['filter']) => void
  filter?: NavState['filter']
}

type FormState = {
  title: string
  description: string
  frequency: HabitFrequency
  projectId: string
  goalId: string
  color: string
}

const emptyForm: FormState = {
  title: '',
  description: '',
  frequency: 'daily',
  projectId: '',
  goalId: '',
  color: COLORS[1],
}

export default function HabitsPage({ navigate, filter }: HabitsPageProps) {
  const {
    state,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    getHabitStreak,
    isHabitDoneToday,
  } = useApp()

  const [showModal, setShowModal] = useState(false)
  const [editHabit, setEditHabit] = useState<Habit | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [filterFreq, setFilterFreq] = useState<HabitFrequency | 'all'>('all')

  const openAdd = () => {
    setEditHabit(null)
    setForm({ ...emptyForm, projectId: filter?.projectId ?? '' })
    setShowModal(true)
  }

  const openEdit = (h: Habit) => {
    setEditHabit(h)
    setForm({
      title: h.title,
      description: h.description,
      frequency: h.frequency,
      projectId: h.projectId ?? '',
      goalId: h.goalId ?? '',
      color: h.color,
    })
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const data = {
      title: form.title,
      description: form.description,
      frequency: form.frequency,
      projectId: form.projectId || undefined,
      goalId: form.goalId || undefined,
      color: form.color,
    }
    if (editHabit) {
      updateHabit({ ...editHabit, ...data })
    } else {
      addHabit(data)
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this habit? All completion history will be lost.')) {
      deleteHabit(id)
    }
  }

  const today = todayStr()
  const last30 = getLast30Days()

  let displayed = filterFreq === 'all'
    ? state.habits
    : state.habits.filter((h) => h.frequency === filterFreq)

  if (filter?.projectId) {
    displayed = displayed.filter((h) => h.projectId === filter.projectId)
  }

  const activeProjects = state.projects.filter((p) => p.status === 'active')
  const activeGoals = state.goals.filter((g) => g.status === 'active')

  const allDailyDoneToday =
    displayed.filter((h) => h.frequency === 'daily').length > 0 &&
    displayed.filter((h) => h.frequency === 'daily').every((h) => isHabitDoneToday(h.id))

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
            <h2>Habits</h2>
            <p className="subtitle">
              {filter?.projectId
                ? `FILTERED BY: ${state.projects.find((p) => p.id === filter.projectId)?.title ?? 'PROJECT'}`
                : 'THE SMALL ACTIONS COMPOUNDING DAILY'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {filter?.projectId && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('habits')}
              >
                <X size={12} />
                Clear filter
              </button>
            )}
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={14} />
              New Habit
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {(['all', 'daily', 'weekly'] as const).map((f) => (
            <button
              key={f}
              className="btn btn-ghost btn-sm"
              style={{
                borderColor: filterFreq === f ? 'var(--accent-primary)' : undefined,
                color: filterFreq === f ? 'var(--accent-primary)' : undefined,
              }}
              onClick={() => setFilterFreq(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content">
        {/* Today's summary bar */}
        {displayed.some((h) => h.frequency === 'daily') && (
          <div
            className="card"
            style={{
              marginBottom: 20,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderColor: allDailyDoneToday ? 'rgba(126,255,160,0.3)' : undefined,
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2 }}>
              TODAY
            </div>
            <div style={{ display: 'flex', gap: 6, flex: 1 }}>
              {displayed.filter((h) => h.frequency === 'daily').map((habit) => {
                const done = isHabitDoneToday(habit.id)
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id, today)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      background: done ? `${habit.color}22` : 'var(--bg-elevated)',
                      border: `1px solid ${done ? habit.color : 'var(--border)'}`,
                      borderRadius: 20,
                      cursor: 'pointer',
                      fontSize: 11,
                      color: done ? habit.color : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {done ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                    {habit.title}
                  </button>
                )
              })}
            </div>
            {allDailyDoneToday && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--accent-primary)',
                  letterSpacing: 1,
                }}
              >
                ALL DONE ✓
              </span>
            )}
          </div>
        )}

        {displayed.length === 0 ? (
          <div className="empty-state">
            <Repeat2 size={32} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <div>NO HABITS FOUND</div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 12 }}
              onClick={openAdd}
            >
              Create your first habit →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayed.map((habit) => {
              const streak = getHabitStreak(habit.id)
              const linkedProject = state.projects.find(
                (p) => p.id === habit.projectId
              )
              const linkedGoal = state.goals.find((g) => g.id === habit.goalId)
              const completionMap = new Set(
                habit.completions
                  .filter((c) => c.completed)
                  .map((c) => c.date)
              )
              const totalCompletions = completionMap.size
              const doneToday = isHabitDoneToday(habit.id)

              return (
                <div
                  key={habit.id}
                  className="card"
                  style={{ borderLeft: `3px solid ${habit.color}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Header row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <Repeat2 size={13} color={habit.color} />
                        <span className="card-title">{habit.title}</span>
                        <span
                          className="badge"
                          style={{
                            background: `${habit.color}18`,
                            color: habit.color,
                            marginLeft: 4,
                          }}
                        >
                          {habit.frequency}
                        </span>
                      </div>

                      {/* Meta */}
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          marginBottom: habit.description ? 8 : 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        {linkedProject && (
                          <span
                            className="badge badge-blue"
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              navigate('projects')
                            }
                          >
                            ↳ {linkedProject.title}
                          </span>
                        )}
                        {linkedGoal && (
                          <span
                            className="badge"
                            style={{
                              background: `${linkedGoal.color}18`,
                              color: linkedGoal.color,
                              cursor: 'pointer',
                            }}
                            onClick={() => navigate('goals')}
                          >
                            ◎ {linkedGoal.title}
                          </span>
                        )}
                        <span className="badge badge-muted">
                          {totalCompletions} total completions
                        </span>
                      </div>

                      {habit.description && (
                        <p
                          style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            marginBottom: 12,
                          }}
                        >
                          {habit.description}
                        </p>
                      )}

                      {/* 30-day grid */}
                      <div style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            color: 'var(--text-muted)',
                            letterSpacing: 1,
                            marginBottom: 5,
                          }}
                        >
                          LAST 30 DAYS
                        </div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {last30.map((day) => {
                            const isToday = day === today
                            const done = completionMap.has(day)
                            return (
                              <button
                                key={day}
                                title={`${formatShortDate(day)}${done ? ' ✓' : ''}`}
                                onClick={() => toggleHabit(habit.id, day)}
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: 2,
                                  background: done ? habit.color : 'var(--bg-elevated)',
                                  border: `1px solid ${isToday ? habit.color : done ? habit.color : 'var(--border)'}`,
                                  cursor: 'pointer',
                                  opacity: isToday ? 1 : done ? 0.9 : 0.5,
                                  padding: 0,
                                  transition: 'all 0.1s',
                                }}
                              />
                            )
                          })}
                        </div>
                      </div>

                      {/* Streak + today button */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                      >
                        {streak > 0 && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontFamily: 'var(--font-mono)',
                              fontSize: 12,
                              color: 'var(--accent-secondary)',
                            }}
                          >
                            <Zap size={12} fill="var(--accent-secondary)" />
                            <strong>{streak}</strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                              day streak
                            </span>
                          </div>
                        )}

                        {habit.frequency === 'daily' && (
                          <button
                            onClick={() => toggleHabit(habit.id, today)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 12px',
                              background: doneToday
                                ? `${habit.color}22`
                                : 'var(--bg-elevated)',
                              border: `1px solid ${doneToday ? habit.color : 'var(--border)'}`,
                              borderRadius: 20,
                              cursor: 'pointer',
                              fontSize: 11,
                              color: doneToday ? habit.color : 'var(--text-muted)',
                              marginLeft: 'auto',
                              transition: 'all 0.15s',
                            }}
                          >
                            {doneToday ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <Circle size={12} />
                            )}
                            {doneToday ? 'Done today' : 'Mark done'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button
                        className="btn-icon"
                        onClick={() => openEdit(habit)}
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(habit.id)}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <Modal
          title={editHabit ? 'Edit Habit' : 'New Habit'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editHabit ? 'Save Changes' : 'Create Habit'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Habit Name *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Morning run, Read 30 min"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Details or context"
              rows={2}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select
                className="form-select"
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value as HabitFrequency })
                }
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: color,
                      border:
                        form.color === color
                          ? '2px solid var(--text-primary)'
                          : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'transform 0.1s',
                      transform:
                        form.color === color ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Linked Project</label>
              <select
                className="form-select"
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">— None —</option>
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Linked Goal</label>
              <select
                className="form-select"
                value={form.goalId}
                onChange={(e) => setForm({ ...form, goalId: e.target.value })}
              >
                <option value="">— None —</option>
                {activeGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
