# Frontend User Manual

Welcome to the **LW2 Time Tracking Tracker** User Manual. This guide will walk you through logging in, recording your working hours, and using administrator features (managing projects, tasks, and reports).

---

## 1. Getting Started

### 1.1. Login Screen
To access the system, navigate to the web application URL:
1. Enter your **username** (Nazwa użytkownika) and **password** (Hasło).
2. (Optional) Check **Remember me** (Zapamiętaj mnie) to persist your session even after closing the browser.
3. Click **Zaloguj się** (Log In).

*Note: Your account must be created beforehand by an Administrator.*

---

## 2. Main Interface Layout

Once logged in, you will see a two-column layout:
- **Sidebar (Navigation)**: Displays the logo, active user details (role and team), and navigation buttons to switch views.
- **Main View Area**: Shows the content of the selected panel (Dashboard, Calendar, Projects, Reports, or Team).
- **Topbar**: Shows current status, active timer/stopwatch controls, and a logout button.

---

## 3. Employee Instructions (Logging Time)

There are two ways to track your work time: using the **Stopwatch** or **Manual Entry**.

### 3.1. Logging Time via the Stopwatch (Recommended)
1. Go to **Projekty i Zadania** (Projects and Tasks) or look at the **Twoje zadania** (Your tasks) sidebar panel.
2. Find the task you are about to start.
3. Click **Loguj czas** (Log time) or the play button next to it.
4. The stopwatch in the topbar will start running.
5. When you finish working on the task, click the **Stop button** (red square) in the topbar.
6. A modal window will open with the date, start time, and end time automatically populated.
7. Enter a brief description of what you did and click **Dodaj wpis** (Add entry).

### 3.2. Logging Time Manually
If you forgot to start the stopwatch, you can add your time block manually:
1. Go to the **Mój Czas** (My Time) calendar panel.
2. Click the **Dodaj wpis** (Add entry) button at the top right.
3. Choose the **Project** and **Task** from the dropdown menus.
4. Set the **Date**, **Start Time**, and **End Time**.
5. Type a description and click **Dodaj wpis** (Add entry).

### 3.3. Reviewing and Editing Your Calendar
In the **Mój Czas** view:
- You will see a monthly calendar with color-coded blocks representing your logged entries.
- Click any entry block to open the edit modal. You can modify the hours, descriptions, or click **Usuń** (Delete) to remove the entry.
- The stats row above the calendar displays your hours logged Today, this Week, and this Month, alongside your weekly progress towards the 40-hour goal.

---

## 4. Administrator Instructions

If you are logged in as an Administrator, you will have additional views in the sidebar.

### 4.1. Project & Task Management
Navigate to **Projekty i Zadania**:
- **Create a Project**: Click **Nowy Projekt**, type the project name and client/description, choose a highlight color, and click save.
- **Create a Task**: Click **Dodaj zadanie** inside any project card. Enter the task name and description, select status (`TODO`, `IN_PROGRESS`, `DONE`), and save.
- **Assign Employees**: Click **Przypisz pracownika** (Assign employee) on a task, select an employee from the dropdown list, and save.

### 4.2. Reporting and PDF Export
Navigate to **Raporty**:
1. Click **Generuj Raport** (Generate Report).
2. Choose the type:
   - **Podsumowanie** (Summary): Total hours worked per employee.
   - **Szczegółowy** (Detailed): Exact list of time entries with dates, tasks, and descriptions.
   - **Według projektów** (By Projects): Total hours spent on each project.
   - **Według zespołów** (By Teams): Total hours logged by backend/frontend teams.
3. Set the date range (From / To).
4. Click **Generuj** to view the report in a table.
5. Click **Pobierz PDF** (Download PDF) to download a clean printable report page.

### 4.3. Team Monitoring
Navigate to **Zarządzanie Zespołem** (Team Management):
- View a table of all employees.
- Monitor active work status: if an employee is currently running a stopwatch, the table shows the task name, project, and duration counter in real-time.
- Manage user profiles: click **Nowy Użytkownik** to add new employees, or edit/delete existing accounts.
