export type GoalStatus = 'active' | 'completed' | 'paused'
export type ProjectStatus = 'active' | 'completed' | 'on-hold'
export type HabitFrequency = 'daily' | 'weekly'
export type NavPage = 'dashboard' | 'goals' | 'projects' | 'habits' | 'notes' | 'weekly'

export interface Goal {
  id: string
  title: string
  description: string
  status: GoalStatus
  category: string
  targetDate?: string
  projectIds: string[]
  color: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: string
}

export interface Project {
  id: string
  title: string
  description: string
  goalId?: string
  status: ProjectStatus
  tasks: Task[]
  habitIds: string[]
  noteIds: string[]
  dueDate?: string
  createdAt: string
}

export interface HabitCompletion {
  date: string // YYYY-MM-DD
  completed: boolean
}

export interface Habit {
  id: string
  title: string
  description: string
  frequency: HabitFrequency
  projectId?: string
  goalId?: string
  completions: HabitCompletion[]
  color: string
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  linkedGoalId?: string
  linkedProjectId?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface WeeklyFocus {
  id: string
  weekStart: string // YYYY-MM-DD (Monday)
  focusGoalIds: string[]
  topProjectIds: string[]
  intention: string
  reflection: string
  createdAt: string
}

export interface AppState {
  goals: Goal[]
  projects: Project[]
  habits: Habit[]
  notes: Note[]
  weeklyFocuses: WeeklyFocus[]
}
