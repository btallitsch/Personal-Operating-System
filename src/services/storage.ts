import type { AppState } from '../types'

const STORAGE_KEY = 'personal-os-v1'

const defaultState: AppState = {
  goals: [],
  projects: [],
  habits: [],
  notes: [],
  weeklyFocuses: [],
}

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state', e)
  }
}

export const clearState = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}
