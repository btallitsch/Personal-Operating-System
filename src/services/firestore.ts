import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc as firestoreDelete,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import type { AppState, Goal, Project, Habit, Note, WeeklyFocus } from '../types'

// ─── Path helpers ─────────────────────────────────────────────────────────────

type CollectionName = 'goals' | 'projects' | 'habits' | 'notes' | 'weeklyFocuses'

const userCol = (uid: string, col: CollectionName) =>
  collection(db, 'users', uid, col)

const userDoc = (uid: string, col: CollectionName, id: string) =>
  doc(db, 'users', uid, col, id)

// ─── Load all data for a user ─────────────────────────────────────────────────

export async function loadUserData(uid: string): Promise<AppState> {
  const [goals, projects, habits, notes, weeklyFocuses] = await Promise.all([
    getDocs(userCol(uid, 'goals')),
    getDocs(userCol(uid, 'projects')),
    getDocs(userCol(uid, 'habits')),
    getDocs(userCol(uid, 'notes')),
    getDocs(userCol(uid, 'weeklyFocuses')),
  ])

  return {
    goals:         goals.docs.map((d)         => d.data() as Goal),
    projects:      projects.docs.map((d)      => d.data() as Project),
    habits:        habits.docs.map((d)        => d.data() as Habit),
    notes:         notes.docs.map((d)         => d.data() as Note),
    weeklyFocuses: weeklyFocuses.docs.map((d) => d.data() as WeeklyFocus),
  }
}

// ─── Individual writes ────────────────────────────────────────────────────────

export const upsertGoal = (uid: string, goal: Goal) =>
  setDoc(userDoc(uid, 'goals', goal.id), goal)

export const removeGoal = (uid: string, id: string) =>
  firestoreDelete(userDoc(uid, 'goals', id))

export const upsertProject = (uid: string, project: Project) =>
  setDoc(userDoc(uid, 'projects', project.id), project)

export const removeProject = (uid: string, id: string) =>
  firestoreDelete(userDoc(uid, 'projects', id))

export const upsertHabit = (uid: string, habit: Habit) =>
  setDoc(userDoc(uid, 'habits', habit.id), habit)

export const removeHabit = (uid: string, id: string) =>
  firestoreDelete(userDoc(uid, 'habits', id))

export const upsertNote = (uid: string, note: Note) =>
  setDoc(userDoc(uid, 'notes', note.id), note)

export const removeNote = (uid: string, id: string) =>
  firestoreDelete(userDoc(uid, 'notes', id))

export const upsertWeeklyFocus = (uid: string, focus: WeeklyFocus) =>
  setDoc(userDoc(uid, 'weeklyFocuses', focus.id), focus)

// ─── Batch write multiple docs (used for cascade updates) ─────────────────────

export async function batchUpsert(
  uid: string,
  writes: Array<
    | { col: 'goals';         data: Goal }
    | { col: 'projects';      data: Project }
    | { col: 'habits';        data: Habit }
    | { col: 'notes';         data: Note }
    | { col: 'weeklyFocuses'; data: WeeklyFocus }
  >
) {
  const batch = writeBatch(db)
  for (const w of writes) {
    batch.set(userDoc(uid, w.col, w.data.id), w.data)
  }
  return batch.commit()
}
