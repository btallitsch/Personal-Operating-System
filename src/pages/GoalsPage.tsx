import { useState } from 'react'
import { Plus, Target, Pencil, Trash2, FolderOpen, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import type { Goal, GoalStatus, NavPage } from '../types'
import type { NavState } from '../App'
import { formatDate } from '../utils/id'

const COLORS = [
  '#7effa0', '#ff7c2a', '#4db8ff', '#ffd700', '#ff6eb4', '#c084fc',
]

const CATEGORIES = [
  'Career', 'Health', 'Finance', 'Learning', 'Relationships', 'Personal',
  'Creative', 'Side Project', 'Other',
]

interface GoalsPageProps {
  navigate: (page: NavPage, filter?: NavState['filter']) => void
  filter?: NavState['filter']
}

type FormState = {
  title: string
  description: string
  status: GoalStatus
  category: string
  targetDate: string
  color: string
}

const emptyForm: FormState = {
  title: '',
  description: '',
  status: 'active',
  category: 'Personal',
  targetDate: '',
  color: COLORS[0],
}

export default function GoalsPage({ navigate }: GoalsPageProps) {
  const { state, addGoal, updateGoal, deleteGoal, getGoalProgress } = useApp()

  const [showModal, setShowModal] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all')

  const openAdd = () => {
    setEditGoal(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (goal: Goal) => {
    setEditGoal(goal)
    setForm({
      title: goal.title,
      description: goal.description,
      status: goal.status,
      category: goal.category,
      targetDate: goal.targetDate ?? '',
      color: goal.color,
    })
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return
    if (editGoal) {
      updateGoal({ ...editGoal, ...form, targetDate: form.targetDate || undefined })
    } else {
      addGoal({ ...form, targetDate: form.targetDate || undefined })
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this goal? Linked projects will be unlinked.')) {
      deleteGoal(id)
    }
  }

  const filtered =
    filterStatus === 'all'
      ? state.goals
      : state.goals.filter((g) => g.status === filterStatus)

  const statusBadge: Record<GoalStatus, string> = {
    active: 'badge-green',
    completed: 'badge-blue',
    paused: 'badge-muted',
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Goals</h2>
            <p className="subtitle">WHAT YOU'RE WORKING TOWARD</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={14} />
            New Goal
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {(['all', 'active', 'paused', 'completed'] as const).map((s) => (
            <button
              key={s}
              className={`btn btn-ghost btn-sm ${filterStatus === s ? 'active-tab' : ''}`}
              style={{
                borderColor: filterStatus === s ? 'var(--accent-primary)' : undefined,
                color: filterStatus === s ? 'var(--accent-primary)' : undefined,
              }}
              onClick={() => setFilterStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Target size={32} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <div>NO GOALS FOUND</div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 12 }}
              onClick={openAdd}
            >
              Create your first goal →
            </button>
          </div>
        ) : (
          <div className="grid-2">
            {filtered.map((goal) => {
              const progress = getGoalProgress(goal.id)
              const linkedProjects = state.projects.filter((p) =>
                goal.projectIds.includes(p.id)
              )
              return (
                <div
                  key={goal.id}
                  className="card"
                  style={{ borderLeft: `3px solid ${goal.color}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Target size={13} color={goal.color} />
                        <span className="card-title">{goal.title}</span>
                      </div>
                      <div
                        className="card-meta"
                        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}
                      >
                        <span className={`badge ${statusBadge[goal.status]}`}>
                          {goal.status}
                        </span>
                        <span className="badge badge-muted">{goal.category}</span>
                        {goal.targetDate && (
                          <span className="badge badge-muted">
                            → {formatDate(goal.targetDate)}
                          </span>
                        )}
                      </div>
                      {goal.description && (
                        <p
                          style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            marginBottom: 8,
                          }}
                        >
                          {goal.description}
                        </p>
                      )}

                      {/* Progress */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div
                            className="progress-fill"
                            style={{ width: `${progress}%`, background: goal.color }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            color: goal.color,
                          }}
                        >
                          {progress}%
                        </span>
                      </div>

                      {/* Linked Projects */}
                      {linkedProjects.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {linkedProjects.map((p) => (
                            <div
                              key={p.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 8px',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                              }}
                              onClick={() =>
                                navigate('projects', { goalId: goal.id })
                              }
                            >
                              <FolderOpen
                                size={10}
                                color="var(--accent-blue)"
                              />
                              <span
                                style={{ fontSize: 11, color: 'var(--text-secondary)' }}
                              >
                                {p.title}
                              </span>
                              <ChevronRight
                                size={10}
                                color="var(--text-muted)"
                                style={{ marginLeft: 'auto' }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {linkedProjects.length === 0 && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ width: '100%', justifyContent: 'center', fontSize: 11 }}
                          onClick={() => navigate('projects')}
                        >
                          + Link a project
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button
                        className="btn-icon"
                        onClick={() => openEdit(goal)}
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(goal.id)}
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
          title={editGoal ? 'Edit Goal' : 'New Goal'}
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
                {editGoal ? 'Save Changes' : 'Create Goal'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What's your goal?"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Why does this matter?"
              rows={2}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as GoalStatus })
                }
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Date</label>
            <input
              type="date"
              className="form-input"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: color,
                    border: form.color === color
                      ? '2px solid var(--text-primary)'
                      : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'transform 0.1s',
                    transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
