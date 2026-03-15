# Personal OS

A personal command center for life — Goals, Projects, Habits, Notes, and Weekly Planning — all connected.

## Stack

- React 18 + TypeScript + Vite
- Firebase Auth (Google sign-in)
- Firestore (per-user isolated data)
- Lucide React icons
- Deployed on Vercel

## Architecture

```
src/
  types/           → All TypeScript interfaces
  utils/id.ts      → Pure functions: IDs, dates, week math
  services/
    firebase.ts    → Init: auth, db, googleProvider
    firestore.ts   → loadUserData, upsert/remove helpers, batchUpsert
  context/
    AuthContext.tsx → Google sign-in, onAuthStateChanged, signOut
    AppContext.tsx  → useReducer + Firestore sync, all actions + computed values
  components/
    Auth/LoginPage.tsx    → Google sign-in screen
    Layout/Sidebar.tsx    → Nav + user avatar + sign-out
    UI/Modal.tsx          → Reusable modal
  pages/           → Dashboard, GoalsPage, ProjectsPage, HabitsPage, NotesPage, WeeklyPage
```

## Firebase Setup

### 1. Create a Firebase project
Go to [console.firebase.google.com](https://console.firebase.google.com) → New project

### 2. Enable Authentication
- Authentication → Sign-in method → Google → Enable
- Add your production domain to Authorized domains (Settings → Authorized domains)

### 3. Enable Firestore
- Firestore Database → Create database → Start in production mode

### 4. Set Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Get your config
Project Settings → Your apps → Web app → Config object

### 6. Add environment variables
Copy `.env.example` to `.env.local` and fill in your values:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Local Development

```bash
npm install
npm run dev
```

## Vercel Deployment

1. Push to GitHub (`.env.local` is gitignored — never commit it)
2. Import repo in Vercel
3. Add all `VITE_FIREBASE_*` env vars in Vercel project settings
4. Deploy
5. Add your `.vercel.app` domain to Firebase Auth → Authorized domains

## Data Model

Firestore structure:
```
users/
  {uid}/
    goals/        {goalId}  → Goal document
    projects/     {projectId} → Project document
    habits/       {habitId}   → Habit document (includes completions array)
    notes/        {noteId}    → Note document
    weeklyFocuses/{focusId}   → WeeklyFocus document
```

All data is isolated per user — no user can read another user's data (enforced by security rules).
