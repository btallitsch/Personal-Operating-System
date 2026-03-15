import { useState } from 'react'
import {
  Plus,
  FolderOpen,
  Pencil,
  Trash2,
  Target,
  Repeat2,
  CheckSquare,
  Square,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import type { Project, ProjectStatus, NavPage } from '../types'
import type { NavState } from '../App'
import { formatDate } from '../utils/id'

interface ProjectsPageProps {
  navigate: (page: NavPage, filter?: NavState['filter']) => void
  filter?: NavState['filter']
}

type FormState = {
  title: string
  description: string
  goalId: string
  status: ProjectStatus
  dueDate: string
}

const emptyForm: FormState = {
  title: '',
  description: '',
  goalId: '',
  status: 'active',
  dueDate: '',
}

export default function ProjectsPage({ navigate, filter }: ProjectsPageProps) {
  const {
    state,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    deleteTask,
    toggleTask,
    getProjectProgress,
  } = useApp()

  const [showModal, setShowModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newTaskText, setNewTaskText] = useState<Record<string, string>>({})
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all')

  const openAdd = () => {
    setEditProject(null)
    setForm({ ...emptyForm, goalId: filter?.goalId ?? '' })
    setShowModal(true)
  }

  const openEdit = (p: Project) => {
    setEditProject(p)
    setForm({
      title: p.title,
      description: p.description,
      goalId: p.goalId ?? '',
      status: p.status,
      dueDate: p.dueDate ?? '',
    })
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const data = {
      title: form.title,
      description: form.description,
      goalId: form.goalId || undefined,
      status: form.status,
      dueDate: form.dueDate || undefined,
    }
    if (editProject) {
      updateProject({ ...editProject, ...data })
    } else {
      addProject(data)
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this project? Tasks and links will be removed.')) {
      deleteProject(id)
    }
  }

  const handleAddTask = (projectId: string) => {
    const text = newTaskText[projectId]?.trim()
    if (!text) return
    addTask(projectId, text)
    setNewTaskText((prev) => ({ ...prev, [projectId]: '' }))
  }

  let displayed = filterStatus === 'all'
    ? state.projects
    : state.projects.filter((p) => p.status === filterStatus)

  if (filter?.goalId) {
    displayed = displayed.filter((p) => p.goalId === filter.goalId)
  }

  const statusBadge: Record<ProjectStatus, string> = {
    active: 'badge-green',
    completed: 'badge-blue',
    'on-hold': 'badge-yellow',
  }

  const activeGoals = state.goals.filter((g) => g.status !== 'completed')

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
            <h2>Projects</h2>
            <p className="subtitle">
              {filter?.goalId
                ? `FILTERED BY: ${state.goals.find((g) => g.id === filter.goalId)?.title ?? 'GOAL'}`
                : 'THE WORK THAT DRIVES YOUR GOALS'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {filter?.goalId && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('projects')}
              >
                <X size={12} />
                Clear filter
              </button>
            )}
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={14} />
              New Project
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {(['all', 'active', 'on-hold', 'completed'] as const).map((s) => (
            <button
              key={s}
              className="btn btn-ghost btn-sm"
              style={{
                borderColor: filterStatus === s ? 'var(--accent-primary)' : undefined,
                color: filterStatus === s ? 'var(--accent-primary)' : undefined,
              }}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'on-hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content">
        {displayed.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={32} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <div>NO PROJECTS FOUND</div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 12 }}
              onClick={openAdd}
            >
              Create your first project →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayed.map((project) => {
              const progress = getProjectProgress(project.id)
              const linkedGoal = state.goals.find(
                (g) => g.id === project.goalId
              )
              const linkedHabits = project.habitIds
                .map((hid) => state.habits.find((h) => h.id === hid))
                .filter(Boolean) as typeof state.habits
              const isExpanded = expandedId === project.id
              const doneTasks = project.tasks.filter((t) => t.completed).length

              return (
                <div key={project.id} className="card">
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Title row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                          cursor: 'pointer',
                        }}
                        onClick={() =>
                          setExpandedId(isExpanded ? null : project.id)
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown size={13} color="var(--text-muted)" />
                        ) : (
                          <ChevronRight size={13} color="var(--text-muted)" />
                        )}
                        <FolderOpen size={13} color="var(--accent-blue)" />
                        <span className="card-title">{project.title}</span>
                      </div>

                      {/* Meta */}
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                          marginBottom: 8,
                          paddingLeft: 21,
                        }}
                      >
                        <span className={`badge ${statusBadge[project.status]}`}>
                          {project.status}
                        </span>
                        {linkedGoal && (
                          <span
                            className="badge"
                            style={{
                              background: `${linkedGoal.color}18`,
                              color: linkedGoal.color,
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              navigate('goals')
                            }
                          >
                            <Target size={8} style={{ marginRight: 3 }} />
                            {linkedGoal.title}
                          </span>
                        )}
                        {project.dueDate && (
                          <span className="badge badge-muted">
                            due {formatDate(project.dueDate)}
                          </span>
                        )}
                        {project.tasks.length > 0 && (
                          <span className="badge badge-muted">
                            {doneTasks}/{project.tasks.length} tasks
                          </span>
                        )}
                        {linkedHabits.length > 0 && (
                          <span
                            className="badge badge-orange"
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              navigate('habits', { projectId: project.id })
                            }
                          >
                            <Repeat2 size={8} style={{ marginRight: 3 }} />
                            {linkedHabits.length} habit
                            {linkedHabits.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Progress */}
                      {project.tasks.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            paddingLeft: 21,
                          }}
                        >
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div
                              className="progress-fill"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 10,
                              color: 'var(--accent-primary)',
                            }}
                          >
                            {progress}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button
                        className="btn-icon"
                        onClick={() => openEdit(project)}
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(project.id)}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: description + tasks */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      {project.description && (
                        <p
                          style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            marginBottom: 12,
                          }}
                        >
                          {project.description}
                        </p>
                      )}

                      {/* Linked habits */}
                      {linkedHabits.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div
                            className="form-label"
                            style={{ marginBottom: 6 }}
                          >
                            Supporting Habits
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {linkedHabits.map((h) => (
                              <span
                                key={h.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '3px 8px',
                                  background: 'var(--bg-elevated)',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: 11,
                                  color: h.color || 'var(--accent-secondary)',
                                  cursor: 'pointer',
                                }}
                                onClick={() =>
                                  navigate('habits', { projectId: project.id })
                                }
                              >
                                <Repeat2 size={9} />
                                {h.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tasks */}
                      <div className="form-label" style={{ marginBottom: 8 }}>
                        Tasks ({doneTasks}/{project.tasks.length})
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          marginBottom: 8,
                        }}
                      >
                        {project.tasks.map((task) => (
                          <div
                            key={task.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '6px 8px',
                              background: 'var(--bg-elevated)',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: task.completed
                                  ? 'var(--accent-primary)'
                                  : 'var(--text-muted)',
                                display: 'flex',
                                padding: 0,
                              }}
                              onClick={() =>
                                toggleTask(project.id, task.id)
                              }
                            >
                              {task.completed ? (
                                <CheckSquare size={14} />
                              ) : (
                                <Square size={14} />
                              )}
                            </button>
                            <span
                              style={{
                                flex: 1,
                                fontSize: 12,
                                color: task.completed
                                  ? 'var(--text-muted)'
                                  : 'var(--text-primary)',
                                textDecoration: task.completed
                                  ? 'line-through'
                                  : 'none',
                              }}
                            >
                              {task.title}
                            </span>
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                padding: 0,
                              }}
                              onClick={() => deleteTask(project.id, task.id)}
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}

                        {project.tasks.length === 0 && (
                          <p
                            style={{
                              fontSize: 11,
                              color: 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)',
                              padding: '8px 0',
                            }}
                          >
                            NO TASKS YET
                          </p>
                        )}
                      </div>

                      {/* Add task */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          className="form-input"
                          style={{ fontSize: 12, padding: '6px 10px' }}
                          placeholder="Add a task..."
                          value={newTaskText[project.id] ?? ''}
                          onChange={(e) =>
                            setNewTaskText((prev) => ({
                              ...prev,
                              [project.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              handleAddTask(project.id)
                          }}
                        />
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleAddTask(project.id)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <Modal
          title={editProject ? 'Edit Project' : 'New Project'}
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
                {editProject ? 'Save Changes' : 'Create Project'}
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
              placeholder="Project name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What are you building?"
              rows={2}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ProjectStatus })
                }
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
