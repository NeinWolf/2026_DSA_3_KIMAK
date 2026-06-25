# Frontend Use Cases (UC)

This document describes the functional use cases implemented in the Time Tracking System frontend, divided by actor roles.

---

## 1. Actors

| Actor | Description |
| :--- | :--- |
| **Employee (Pracownik)** | Logs time against tasks, views assigned projects and tasks, and edits/deletes their own logs. |
| **Administrator (Admin)** | Has complete access to all panels. Manages projects, tasks, users, and generates summaries and reports. |

---

## 2. General Use Cases

### UC-01: User Login
- **Primary Actor**: Employee, Administrator
- **Preconditions**: User has an active account.
- **Main Flow**:
  1. User enters username and password on the Login Page.
  2. Frontend sends login payload to `/api/auth/login`.
  3. Frontend receives JWT token, User ID, and Role.
  4. Frontend stores token and user in `localStorage`.
  5. UI routes to the appropriate view (`DashboardView`).

  ![UC-01: User Login](screenshots/1_Login.png)

### UC-02: Session Restore
- **Primary Actor**: Employee, Administrator
- **Preconditions**: A token is stored in the browser's `localStorage`.
- **Main Flow**:
  1. Frontend initializes and reads the token.
  2. Decodes payload and checks the expiration (`exp` timestamp).
  3. If token is valid, restores login session and routes to the Dashboard immediately.
  4. If token is expired or corrupted, wipes `localStorage` and remains on the Login Page.

### UC-03: User Logout
- **Primary Actor**: Employee, Administrator
- **Preconditions**: User is logged in.
- **Main Flow**:
  1. User clicks the Logout button in the sidebar or top bar.
  2. Frontend removes `token` and `user` keys from `localStorage`.
  3. UI redirects to the login screen.

---

## 3. Employee Use Cases

### UC-04: View Dashboard (Employee)
- **Primary Actor**: Employee
- **Main Flow**:
  1. Employee navigates to Dashboard.
  2. System shows aggregated statistics for the employee:
     - Logged hours for today.
     - Logged hours for the current week.
     - Logged hours for the current month.
     - Progress bar showing current weekly hours vs. the weekly goal (40h).
  3. System displays a chart/list of recent tasks worked on.

  ![UC-04: View Dashboard (Employee)](screenshots/4_Dashboard.png)

### UC-05: Log Time Manually
- **Primary Actor**: Employee
- **Preconditions**: Employee is assigned to a project/task.
- **Main Flow**:
  1. Employee clicks "Dodaj wpis" (Add time entry) on the calendar view.
  2. System displays the time logging modal.
  3. Employee selects the project.
  4. Employee selects a task (the dropdown shows tasks assigned to the user).
  5. Employee selects the date, start time, and end time.
  6. Employee enters description (optional).
  7. System validates that the end time is after the start time, and that the new entry does not overlap with existing entries.
  8. Employee submits, and the frontend sends a POST request to `/api/time-entries`.
  9. Calendar updates with the new time block.

  ![UC-05: Log Time Manually](screenshots/5_LogTime.png)

### UC-06: Use Stopwatch (Real-time Timer)
- **Primary Actor**: Employee
- **Main Flow**:
  1. Employee navigates to "Projekty i Zadania" or clicks the Quick-access panel.
  2. Employee clicks "Loguj czas" (Log time) or the play icon next to an assigned task to start the timer.
  3. Frontend starts an active timer showing hours, minutes, and seconds elapsed in the top bar.
  4. Employee clicks the stop button.
  5. Frontend stops the timer, calculates the start and end times, and pre-populates the "Dodaj wpis" modal automatically.
  6. Employee reviews details and clicks save to persist.

### UC-07: Edit / Delete Personal Time Entry
- **Primary Actor**: Employee
- **Main Flow**:
  1. Employee clicks on their time entry block in the calendar.
  2. System shows the edit modal with current details.
  3. Employee modifies fields (project, task, times, description) and clicks save (PUT request to `/api/time-entries/{id}`), OR clicks "Usuń" (Delete) (DELETE request to `/api/time-entries/{id}`).
  4. Calendar refetches and updates.

  ![UC-07: Edit / Delete Personal Time Entry](screenshots/7_EditEntry.png)

---

## 4. Administrator Use Cases

### UC-08: View Dashboard (Admin)
- **Primary Actor**: Administrator
- **Main Flow**:
  1. Admin logs in and views the Dashboard.
  2. System displays total parameters for the entire organization:
     - Total logged hours across all projects.
     - Active projects count.
     - Total employees registered.
     - Quick list of active stopwatches running in real-time.

  ![UC-08: View Dashboard (Admin)](screenshots/8_AdminDashboard.png)

### UC-09: Create / Edit / Delete Projects
- **Primary Actor**: Administrator
- **Main Flow**:
  1. Admin navigates to the Projects View.
  2. Admin clicks "Nowy Projekt" (New Project).
  3. Admin enters project name, description, start date, and end date, and assigns a calendar highlight color.
  4. Admin saves the project (POST request to `/api/projects`).
  5. Admin can also select an existing project to edit (PUT) or delete it (DELETE).

  ![UC-09: Create / Edit / Delete Projects](screenshots/9_CreateProject.png)

### UC-10: Manage Project Tasks
- **Primary Actor**: Administrator
- **Main Flow**:
  1. Admin selects a project in the Projects View.
  2. Admin clicks "Dodaj Zadanie" (Add Task).
  3. Admin enters task name, description, status (`TODO`, `IN_PROGRESS`, `DONE`).
  4. Admin saves the task (POST request to `/api/tasks`).
  5. Admin can click "Edytuj" (Edit) or "Usuń" (Delete) on tasks.

  ![UC-10: Manage Project Tasks](screenshots/10_AddTask.png)

### UC-11: Assign Employee to Task
- **Primary Actor**: Administrator
- **Main Flow**:
  1. Admin clicks "Przypisz pracownika" (Assign employee) on a task card.
  2. System lists all registered employees.
  3. Admin selects an employee and saves (PUT request to `/api/tasks/{id}` with updated assignee lists).

### UC-12: Generate Reports
- **Primary Actor**: Administrator
- **Main Flow**:
  1. Admin navigates to the Reports panel.
  2. Admin clicks "Generuj Raport" (Generate Report).
  3. Admin selects parameters:
     - Report Type: Summary (Podsumowanie), Detailed (Szczegółowy), By Project, or By Team.
     - Date range (From / To).
  4. Admin submits, and the frontend queries `/api/reports/{type}` with query parameters.
  5. Frontend displays report data in a dynamic paginated table.

  ![UC-12: Generate Reports](screenshots/12_GenerateReport.png)

### UC-13: Export Report to PDF
- **Primary Actor**: Administrator
- **Preconditions**: Report data has been generated and is visible in the viewer modal.
- **Main Flow**:
  1. Admin clicks "Pobierz PDF" (Download PDF).
  2. System triggers the client-side PDF helper.
  3. System parses the table columns and data rows into a formatted report PDF (attaching title, parameters, headers, and footer pages).
  4. The PDF file is downloaded locally.

  ![UC-13: Export Report to PDF](screenshots/13_DownloadReport.png)
