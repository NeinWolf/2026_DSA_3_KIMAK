# Frontend Technical Documentation

This document describes the technical architecture, directory structure, state management, and API integration design for the Time Tracking System (LW2) frontend application.

---

## 1. Technology Stack

The frontend is built using a modern React framework stack:

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16 (App Router)** | Framework for routing, server components, and production builds. |
| **React 19** | Component-driven UI library. |
| **TypeScript 5** | Static typing and interfaces for API contracts. |
| **TailwindCSS 4** | Utility-first CSS styling and layout. |
| **SWR (Stale-While-Revalidate)** | Remote data fetching, local caching, and state synchronization. |
| **Lucide React** | Icon library. |
| **jsPDF & jsPDF-AutoTable** | Client-side PDF generation for reports. |

---

## 2. Directory Structure

```
frontend/
├── app/                      # Next.js App Router root
│   ├── globals.css           # Global CSS variables and tailwind rules
│   ├── layout.tsx            # HTML shell & font definitions
│   └── page.tsx              # Application root entry point (handles session restore)
├── components/               # React Components
│   ├── login-page.tsx        # Login screen and authentication handler
│   ├── time-tracking-layout.tsx # Core layout wrapper (View Router and Modals)
│   ├── modals/               # Form modals for adding/editing records
│   │   ├── AssignEmployeeModal.tsx
│   │   ├── GenerateReportModal.tsx
│   │   ├── ProjectModal.tsx
│   │   ├── TaskModal.tsx
│   │   ├── TimeEntryModal.tsx
│   │   ├── UserModal.tsx
│   │   └── ViewReportModal.tsx
│   ├── views/                # Views switched by sidebar routing
│   │   ├── DashboardView.tsx
│   │   ├── MyTimeView.tsx
│   │   ├── ProjectsView.tsx
│   │   ├── ReportsView.tsx
│   │   └── TeamView.tsx
│   └── ui/                   # Shared UI primitives (dialogs, tooltips, etc.)
├── hooks/                    # Custom SWR React hooks for API interaction
│   ├── use-projects.ts       # Projects CRUD SWR hook
│   ├── use-reports.ts        # Reports list SWR hook
│   ├── use-tasks.ts          # Tasks CRUD SWR hook
│   ├── use-time-entries.ts   # Time Entries CRUD SWR hook
│   └── use-users.ts          # Users CRUD SWR hook
└── lib/                      # Helper libraries and API client
    ├── api.ts                # Fetch client, endpoints configuration, JWT decoder
    └── pdf-helper.ts         # PDF generation helper using jsPDF
```

---

## 3. Architecture & Core Concepts

### 3.1. Client-Side Routing (View Router)
Instead of using physical routes for each panel, the application utilizes a unified Dashboard Layout (`TimeTrackingLayout`) that acts as a view router. The active view is controlled by a local state (`currentView`):
- `dashboard`: General statistics and progress.
- `my-time`: The monthly work log calendar.
- `projects`: Project and task planning (Admin).
- `reports`: Detailed query reporting and exports (Admin).
- `team`: User list, active work status, and stopwatch monitors (Admin).

### 3.2. Authentication & Session Persistence
The authentication flow is client-driven and secured by JSON Web Tokens (JWT):
1. **Login**: User inputs credentials in `LoginPage`. A POST request is made to `/api/auth/login`.
2. **Token Storage**: On success, the JWT token and basic user details (ID, name, role) are saved to `localStorage`.
3. **Session Restore**: When the application loads, `app/page.tsx` checks for the presence of `token` in `localStorage` and validates it against expiration rules using the `isTokenValid(token)` helper.
4. **Logout**: Logging out wipes the `token` and `user` keys from `localStorage` and reloads the page to restore state.

### 3.3. Remote Data Fetching & Caching (SWR)
To ensure optimal performance and eliminate the need for global state managers (like Redux), the frontend uses **SWR**:
- **Stale-While-Revalidate**: SWR first returns data from the cache (stale), then sends the fetch request (revalidate), and finally updates with the latest data.
- **Optimistic Mutations**: When adding, editing, or deleting items (e.g., projects, tasks, or time entries), mutations are called locally to refresh the UI immediately while the API call finishes.
- **Dependency Tracking**: Views automatically reload data when their dependencies change. For example, changing the selected project in the calendar dropdown triggers SWR to fetch and re-filter tasks and entries.

---

## 4. API Client & Mapping Layer

### 4.1. Core API Functions
All endpoints require authentication (except `/api/auth/login` and `POST /api/users`). The fetch wrapper `apiFetch` in `lib/api.ts` automatically attaches the token:
```typescript
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### 4.2. Time Entry Data Mapping
Because the backend stores dates and times as database timestamps (`LocalDateTime`), whereas the frontend UI handles calendar views using simple time strings (`"09:00"`, `"10:30"`) and formatted durations (`"1h 30m"`), a mapping layer runs when loading and saving time entries in `TimeTrackingLayout`:

- **Response Mapping (Backend -> UI)**:
  - `startTime`: `2026-06-22T09:00:00` -> `date: "2026-06-22"`, `startTime: "09:00"`
  - `endTime`: `2026-06-22T10:30:00` -> `endTime: "10:30"`
  - `durationMinutes`: `90` -> `duration: "1h 30m"`

- **Request Mapping (UI -> Backend)**:
  - Combined `date` ("2026-06-22") + `startTime` ("09:00") -> `startTime: "2026-06-22T09:00:00"`
  - Combined `date` ("2026-06-22") + `endTime` ("10:30") -> `endTime: "2026-06-22T10:30:00"`
