import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'
import type {
  AppState,
  Goal,
  Project,
  Habit,
  Note,
  WeeklyFocus,
  Task,
} from '../types'
import { loadState, saveState } from '../services/storage'
import { generateId, todayStr } from '../utils/id'

// ─── Action Types ────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_GOAL'; goal: Goal }
  | { type: 'UPDATE_GOAL'; goal: Goal }
  | { type: 'DELETE_GOAL'; id: string }
  | { type: 'ADD_PROJECT'; project: Project }
  | { type: 'UPDATE_PROJECT'; project: Project }
  | { type: 'DELETE_PROJECT'; id: string }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'UPDATE_HABIT'; habit: Habit }
  | { type: 'DELETE_HABIT'; id: string }
  | { type: 'TOGGLE_HABIT'; habitId: string; date: string }
  | { type: 'ADD_NOTE'; note: Note }
  | { type: 'UPDATE_NOTE'; note: Note }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'UPSERT_WEEKLY'; focus: WeeklyFocus }
  | { type: 'TOGGLE_TASK'; projectId: string; taskId: string }
  | { type: 'ADD_TASK'; projectId: string; task: Task }
  | { type: 'DELETE_TASK'; projectId: string; taskId: string }

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.goal] }

    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.goal.id ? action.goal : g
        ),
      }

    case 'DELETE_GOAL': {
      const goals = state.goals.filter((g) => g.id !== action.id)
      const projects = state.projects.map((p) =>
        p.goalId === action.id ? { ...p, goalId: undefined } : p
      )
      return { ...state, goals, projects }
    }

    case 'ADD_PROJECT': {
      const project = action.project
      let goals = state.goals
      if (project.goalId) {
        goals = goals.map((g) =>
          g.id === project.goalId
            ? { ...g, projectIds: [...g.projectIds, project.id] }
            : g
        )
      }
      return { ...state, projects: [...state.projects, project], goals }
    }

    case 'UPDATE_PROJECT': {
      const old = state.projects.find((p) => p.id === action.project.id)
      let goals = state.goals
      if (old && old.goalId !== action.project.goalId) {
        if (old.goalId) {
          goals = goals.map((g) =>
            g.id === old.goalId
              ? {
                  ...g,
                  projectIds: g.projectIds.filter(
                    (id) => id !== action.project.id
                  ),
                }
              : g
          )
        }
        if (action.project.goalId) {
          goals = goals.map((g) =>
            g.id === action.project.goalId
              ? { ...g, projectIds: [...g.projectIds, action.project.id] }
              : g
          )
        }
      }
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.project.id ? action.project : p
        ),
        goals,
      }
    }

    case 'DELETE_PROJECT': {
      const projects = state.projects.filter((p) => p.id !== action.id)
      const goals = state.goals.map((g) => ({
        ...g,
        projectIds: g.projectIds.filter((id) => id !== action.id),
      }))
      const habits = state.habits.map((h) =>
        h.projectId === action.id ? { ...h, projectId: undefined } : h
      )
      return { ...state, projects, goals, habits }
    }

    case 'ADD_HABIT': {
      const habit = action.habit
      let projects = state.projects
      if (habit.projectId) {
        projects = projects.map((p) =>
          p.id === habit.projectId
            ? { ...p, habitIds: [...p.habitIds, habit.id] }
            : p
        )
      }
      return { ...state, habits: [...state.habits, habit], projects }
    }

    case 'UPDATE_HABIT': {
      const old = state.habits.find((h) => h.id === action.habit.id)
      let projects = state.projects
      if (old && old.projectId !== action.habit.projectId) {
        if (old.projectId) {
          projects = projects.map((p) =>
            p.id === old.projectId
              ? {
                  ...p,
                  habitIds: p.habitIds.filter((id) => id !== action.habit.id),
                }
              : p
          )
        }
        if (action.habit.projectId) {
          projects = projects.map((p) =>
            p.id === action.habit.projectId
              ? { ...p, habitIds: [...p.habitIds, action.habit.id] }
              : p
          )
        }
      }
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.habit.id ? action.habit : h
        ),
        projects,
      }
    }

    case 'DELETE_HABIT': {
      const habits = state.habits.filter((h) => h.id !== action.id)
      const projects = state.projects.map((p) => ({
        ...p,
        habitIds: p.habitIds.filter((id) => id !== action.id),
      }))
      return { ...state, habits, projects }
    }

    case 'TOGGLE_HABIT': {
      const habits = state.habits.map((h) => {
        if (h.id !== action.habitId) return h
        const existing = h.completions.find((c) => c.date === action.date)
        const completions = existing
          ? h.completions.map((c) =>
              c.date === action.date
                ? { ...c, completed: !c.completed }
                : c
            )
          : [...h.completions, { date: action.date, completed: true }]
        return { ...h, completions }
      })
      return { ...state, habits }
    }

    case 'ADD_NOTE': {
      const note = action.note
      let projects = state.projects
      if (note.linkedProjectId) {
        projects = projects.map((p) =>
          p.id === note.linkedProjectId
            ? { ...p, noteIds: [...p.noteIds, note.id] }
            : p
        )
      }
      return { ...state, notes: [...state.notes, note], projects }
    }

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.note.id ? action.note : n
        ),
      }

    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.id),
      }

    case 'UPSERT_WEEKLY': {
      const exists = state.weeklyFocuses.find(
        (w) => w.weekStart === action.focus.weekStart
      )
      const weeklyFocuses = exists
        ? state.weeklyFocuses.map((w) =>
            w.weekStart === action.focus.weekStart ? action.focus : w
          )
        : [...state.weeklyFocuses, action.focus]
      return { ...state, weeklyFocuses }
    }

    case 'TOGGLE_TASK': {
      const projects = state.projects.map((p) => {
        if (p.id !== action.projectId) return p
        return {
          ...p,
          tasks: p.tasks.map((t) =>
            t.id === action.taskId ? { ...t, completed: !t.completed } : t
          ),
        }
      })
      return { ...state, projects }
    }

    case 'ADD_TASK': {
      const projects = state.projects.map((p) => {
        if (p.id !== action.projectId) return p
        return { ...p, tasks: [...p.tasks, action.task] }
      })
      return { ...state, projects }
    }

    case 'DELETE_TASK': {
      const projects = state.projects.map((p) => {
        if (p.id !== action.projectId) return p
        return {
          ...p,
          tasks: p.tasks.filter((t) => t.id !== action.taskId),
        }
      })
      return { ...state, projects }
    }

    default:
      return state
  }
}

// ─── Context Interface ────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState
  // Goals
  addGoal: (
    data: Omit<Goal, 'id' | 'createdAt' | 'projectIds'>
  ) => void
  updateGoal: (goal: Goal) => void
  deleteGoal: (id: string) => void
  // Projects
  addProject: (
    data: Omit<Project, 'id' | 'createdAt' | 'tasks' | 'habitIds' | 'noteIds'>
  ) => void
  updateProject: (project: Project) => void
  deleteProject: (id: string) => void
  addTask: (projectId: string, title: string) => void
  deleteTask: (projectId: string, taskId: string) => void
  toggleTask: (projectId: string, taskId: string) => void
  // Habits
  addHabit: (data: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => void
  updateHabit: (habit: Habit) => void
  deleteHabit: (id: string) => void
  toggleHabit: (habitId: string, date?: string) => void
  // Notes
  addNote: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (note: Note) => void
  deleteNote: (id: string) => void
  // Weekly
  upsertWeekly: (focus: WeeklyFocus) => void
  // Computed
  getGoalProgress: (goalId: string) => number
  getProjectProgress: (projectId: string) => number
  getHabitStreak: (habitId: string) => number
  isHabitDoneToday: (habitId: string) => boolean
  getTodayHabits: () => Habit[]
}

const AppContext = createContext<AppContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  // Goals
  const addGoal = useCallback(
    (data: Omit<Goal, 'id' | 'createdAt' | 'projectIds'>) => {
      dispatch({
        type: 'ADD_GOAL',
        goal: {
          ...data,
          id: generateId(),
          projectIds: [],
          createdAt: new Date().toISOString(),
        },
      })
    },
    []
  )
  const updateGoal = useCallback(
    (goal: Goal) => dispatch({ type: 'UPDATE_GOAL', goal }),
    []
  )
  const deleteGoal = useCallback(
    (id: string) => dispatch({ type: 'DELETE_GOAL', id }),
    []
  )

  // Projects
  const addProject = useCallback(
    (
      data: Omit<
        Project,
        'id' | 'createdAt' | 'tasks' | 'habitIds' | 'noteIds'
      >
    ) => {
      dispatch({
        type: 'ADD_PROJECT',
        project: {
          ...data,
          id: generateId(),
          tasks: [],
          habitIds: [],
          noteIds: [],
          createdAt: new Date().toISOString(),
        },
      })
    },
    []
  )
  const updateProject = useCallback(
    (project: Project) => dispatch({ type: 'UPDATE_PROJECT', project }),
    []
  )
  const deleteProject = useCallback(
    (id: string) => dispatch({ type: 'DELETE_PROJECT', id }),
    []
  )
  const addTask = useCallback((projectId: string, title: string) => {
    dispatch({
      type: 'ADD_TASK',
      projectId,
      task: { id: generateId(), title, completed: false },
    })
  }, [])
  const deleteTask = useCallback(
    (projectId: string, taskId: string) =>
      dispatch({ type: 'DELETE_TASK', projectId, taskId }),
    []
  )
  const toggleTask = useCallback(
    (projectId: string, taskId: string) =>
      dispatch({ type: 'TOGGLE_TASK', projectId, taskId }),
    []
  )

  // Habits
  const addHabit = useCallback(
    (data: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => {
      dispatch({
        type: 'ADD_HABIT',
        habit: {
          ...data,
          id: generateId(),
          completions: [],
          createdAt: new Date().toISOString(),
        },
      })
    },
    []
  )
  const updateHabit = useCallback(
    (habit: Habit) => dispatch({ type: 'UPDATE_HABIT', habit }),
    []
  )
  const deleteHabit = useCallback(
    (id: string) => dispatch({ type: 'DELETE_HABIT', id }),
    []
  )
  const toggleHabit = useCallback((habitId: string, date?: string) => {
    dispatch({ type: 'TOGGLE_HABIT', habitId, date: date ?? todayStr() })
  }, [])

  // Notes
  const addNote = useCallback(
    (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      dispatch({
        type: 'ADD_NOTE',
        note: { ...data, id: generateId(), createdAt: now, updatedAt: now },
      })
    },
    []
  )
  const updateNote = useCallback(
    (note: Note) =>
      dispatch({
        type: 'UPDATE_NOTE',
        note: { ...note, updatedAt: new Date().toISOString() },
      }),
    []
  )
  const deleteNote = useCallback(
    (id: string) => dispatch({ type: 'DELETE_NOTE', id }),
    []
  )

  // Weekly
  const upsertWeekly = useCallback(
    (focus: WeeklyFocus) => dispatch({ type: 'UPSERT_WEEKLY', focus }),
    []
  )

  // ── Computed ──────────────────────────────────────────────────────────────

  const getProjectProgress = useCallback(
    (projectId: string): number => {
      const project = state.projects.find((p) => p.id === projectId)
      if (!project || project.tasks.length === 0) return 0
      const done = project.tasks.filter((t) => t.completed).length
      return Math.round((done / project.tasks.length) * 100)
    },
    [state.projects]
  )

  const getGoalProgress = useCallback(
    (goalId: string): number => {
      const goal = state.goals.find((g) => g.id === goalId)
      if (!goal || goal.projectIds.length === 0) return 0
      const progresses = goal.projectIds.map((pid) => getProjectProgress(pid))
      return Math.round(
        progresses.reduce((a, b) => a + b, 0) / progresses.length
      )
    },
    [state.goals, getProjectProgress]
  )

  const getHabitStreak = useCallback(
    (habitId: string): number => {
      const habit = state.habits.find((h) => h.id === habitId)
      if (!habit) return 0
      let streak = 0
      for (let i = 0; i < 365; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const completion = habit.completions.find((c) => c.date === dateStr)
        if (completion?.completed) {
          streak++
        } else if (i > 0) {
          break
        }
      }
      return streak
    },
    [state.habits]
  )

  const isHabitDoneToday = useCallback(
    (habitId: string): boolean => {
      const habit = state.habits.find((h) => h.id === habitId)
      if (!habit) return false
      const today = todayStr()
      return habit.completions.some((c) => c.date === today && c.completed)
    },
    [state.habits]
  )

  const getTodayHabits = useCallback((): Habit[] => {
    return state.habits.filter((h) => h.frequency === 'daily')
  }, [state.habits])

  return (
    <AppContext.Provider
      value={{
        state,
        addGoal,
        updateGoal,
        deleteGoal,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        deleteTask,
        toggleTask,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabit,
        addNote,
        updateNote,
        deleteNote,
        upsertWeekly,
        getGoalProgress,
        getProjectProgress,
        getHabitStreak,
        isHabitDoneToday,
        getTodayHabits,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
