import { useState } from 'react'
import {
  Plus,
  StickyNote,
  Pencil,
  Trash2,
  Target,
  FolderOpen,
  Search,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import type { Note, NavPage } from '../types'
import type { NavState } from '../App'
import { formatDate } from '../utils/id'

interface NotesPageProps {
  navigate: (page: NavPage, filter?: NavState['filter']) => void
  filter?: NavState['filter']
}

type FormState = {
  title: string
  content: string
  linkedGoalId: string
  linkedProjectId: string
  tagInput: string
  tags: string[]
}

const emptyForm: FormState = {
  title: '',
  content: '',
  linkedGoalId: '',
  linkedProjectId: '',
  tagInput: '',
  tags: [],
}

export default function NotesPage({ navigate }: NotesPageProps) {
  const { state, addNote, updateNote, deleteNote } = useApp()

  const [showModal, setShowModal] = useState(false)
  const [editNote, setEditNote] = useState<Note | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [search, setSearch] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  const openAdd = () => {
    setEditNote(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (note: Note) => {
    setEditNote(note)
    setForm({
      title: note.title,
      content: note.content,
      linkedGoalId: note.linkedGoalId ?? '',
      linkedProjectId: note.linkedProjectId ?? '',
      tagInput: '',
      tags: [...note.tags],
    })
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const data = {
      title: form.title,
      content: form.content,
      linkedGoalId: form.linkedGoalId || undefined,
      linkedProjectId: form.linkedProjectId || undefined,
      tags: form.tags,
    }
    if (editNote) {
      updateNote({ ...editNote, ...data })
      if (selectedNote?.id === editNote.id) {
        setSelectedNote({ ...editNote, ...data })
      }
    } else {
      addNote(data)
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this note?')) {
      deleteNote(id)
      if (selectedNote?.id === id) setSelectedNote(null)
    }
  }

  const addTag = () => {
    const tag = form.tagInput.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag], tagInput: '' })
    }
  }

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })
  }

  const filtered = state.notes.filter((n) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.includes(q))
    )
  })

  const allTags = [...new Set(state.notes.flatMap((n) => n.tags))]

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
            <h2>Notes</h2>
            <p className="subtitle">CAPTURE, CONNECT, RECALL</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={14} />
            New Note
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tag filter chips */}
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {allTags.map((tag) => (
              <button
                key={tag}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11, padding: '3px 10px' }}
                onClick={() => setSearch(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: selectedNote ? '1fr 1.6fr' : '1fr',
            gap: 16,
          }}
        >
          {/* Note list */}
          <div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <StickyNote size={32} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                <div>{search ? 'NO NOTES MATCH YOUR SEARCH' : 'NO NOTES YET'}</div>
                {!search && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 12 }}
                    onClick={openAdd}
                  >
                    Create your first note →
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map((note) => {
                  const linkedGoal = state.goals.find(
                    (g) => g.id === note.linkedGoalId
                  )
                  const linkedProject = state.projects.find(
                    (p) => p.id === note.linkedProjectId
                  )
                  const isSelected = selectedNote?.id === note.id

                  return (
                    <div
                      key={note.id}
                      className="card"
                      style={{
                        cursor: 'pointer',
                        borderColor: isSelected
                          ? 'var(--accent-primary)'
                          : undefined,
                      }}
                      onClick={() =>
                        setSelectedNote(isSelected ? null : note)
                      }
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            className="card-title"
                            style={{ marginBottom: 4 }}
                          >
                            {note.title}
                          </div>
                          <p
                            style={{
                              fontSize: 12,
                              color: 'var(--text-muted)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              marginBottom: 8,
                            }}
                          >
                            {note.content || 'No content'}
                          </p>

                          {/* Links and tags */}
                          <div
                            style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
                          >
                            {linkedGoal && (
                              <span
                                className="badge"
                                style={{
                                  background: `${linkedGoal.color}18`,
                                  color: linkedGoal.color,
                                }}
                              >
                                <Target size={8} style={{ marginRight: 2 }} />
                                {linkedGoal.title}
                              </span>
                            )}
                            {linkedProject && (
                              <span className="badge badge-blue">
                                <FolderOpen
                                  size={8}
                                  style={{ marginRight: 2 }}
                                />
                                {linkedProject.title}
                              </span>
                            )}
                            {note.tags.map((tag) => (
                              <span key={tag} className="tag">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div
                            className="card-meta"
                            style={{ marginTop: 8 }}
                          >
                            {formatDate(note.updatedAt.split('T')[0])}
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: 4,
                            flexShrink: 0,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="btn-icon"
                            onClick={() => openEdit(note)}
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            className="btn-icon"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleDelete(note.id)}
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

          {/* Note detail panel */}
          {selectedNote && (
            <div
              className="card"
              style={{
                position: 'sticky',
                top: 0,
                alignSelf: 'start',
                maxHeight: 'calc(100vh - 180px)',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {selectedNote.title}
                </h3>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn-icon"
                    onClick={() => openEdit(selectedNote)}
                    title="Edit"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              </div>

              {/* Links */}
              {(selectedNote.linkedGoalId || selectedNote.linkedProjectId) && (
                <div
                  style={{ display: 'flex', gap: 8, marginBottom: 12 }}
                >
                  {selectedNote.linkedGoalId &&
                    (() => {
                      const g = state.goals.find(
                        (g) => g.id === selectedNote.linkedGoalId
                      )
                      return g ? (
                        <span
                          className="badge"
                          style={{
                            background: `${g.color}18`,
                            color: g.color,
                            cursor: 'pointer',
                          }}
                          onClick={() => navigate('goals')}
                        >
                          <Target size={8} style={{ marginRight: 2 }} />
                          {g.title}
                        </span>
                      ) : null
                    })()}
                  {selectedNote.linkedProjectId &&
                    (() => {
                      const p = state.projects.find(
                        (p) => p.id === selectedNote.linkedProjectId
                      )
                      return p ? (
                        <span
                          className="badge badge-blue"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate('projects')}
                        >
                          <FolderOpen size={8} style={{ marginRight: 2 }} />
                          {p.title}
                        </span>
                      ) : null
                    })()}
                </div>
              )}

              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedNote.content || (
                  <em style={{ color: 'var(--text-muted)' }}>No content</em>
                )}
              </p>

              {selectedNote.tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    marginTop: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  {selectedNote.tags.map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div
                className="card-meta"
                style={{ marginTop: 12 }}
              >
                Created {formatDate(selectedNote.createdAt.split('T')[0])}
                {selectedNote.updatedAt !== selectedNote.createdAt && (
                  <> · Updated {formatDate(selectedNote.updatedAt.split('T')[0])}</>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <Modal
          title={editNote ? 'Edit Note' : 'New Note'}
          onClose={() => setShowModal(false)}
          width={600}
          footer={
            <>
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editNote ? 'Save Changes' : 'Create Note'}
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
              placeholder="Note title"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-textarea"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your thoughts..."
              rows={8}
              style={{ minHeight: 160 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Link to Goal</label>
              <select
                className="form-select"
                value={form.linkedGoalId}
                onChange={(e) =>
                  setForm({ ...form, linkedGoalId: e.target.value })
                }
              >
                <option value="">— None —</option>
                {state.goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Link to Project</label>
              <select
                className="form-select"
                value={form.linkedProjectId}
                onChange={(e) =>
                  setForm({ ...form, linkedProjectId: e.target.value })
                }
              >
                <option value="">— None —</option>
                {state.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                placeholder="Add a tag"
                value={form.tagInput}
                onChange={(e) =>
                  setForm({ ...form, tagInput: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <button
                className="btn btn-ghost btn-sm"
                onClick={addTag}
                style={{ flexShrink: 0 }}
              >
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="tag"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                    }}
                    onClick={() => removeTag(tag)}
                  >
                    #{tag}
                    <span style={{ fontSize: 10, opacity: 0.6 }}>×</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
