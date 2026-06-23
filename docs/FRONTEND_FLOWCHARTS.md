# Frontend Flowcharts

This document visualizes the main user flows and component state lifecycles in the Time Tracking System frontend using Mermaid diagrams.

---

## 1. Authentication & Session Restoration Flow

This diagram shows how `app/page.tsx` routes between `LoginPage` and `TimeTrackingLayout` during initialization and user interactions.

```mermaid
graph TD
    Start([App Initialized]) --> CheckStorage{Check localStorage<br>for token & user}
    
    CheckStorage -- Missing --> ShowLogin[Render LoginPage]
    CheckStorage -- Found --> ValidateToken{Is token valid?<br>isTokenValid}
    
    ValidateToken -- No / Expired --> ClearStorage[Clear localStorage]
    ClearStorage --> ShowLogin
    
    ValidateToken -- Yes --> RestoreSession[Set currentUser state]
    RestoreSession --> ShowLayout[Render TimeTrackingLayout]
    
    ShowLogin --> UserInput[User submits credentials]
    UserInput --> SendRequest[POST /api/auth/login]
    
    SendRequest --> Success{API Response success?}
    Success -- No --> ShowError[Display credentials error]
    ShowError --> ShowLogin
    
    Success -- Yes --> SaveStorage[Save token & user to localStorage]
    SaveStorage --> SetState[Set currentUser state]
    SetState --> ShowLayout
    
    ShowLayout --> ClickLogout[User clicks Logout]
    ClickLogout --> WipeStorage[Wipe localStorage]
    WipeStorage --> ResetState[Clear currentUser state]
    ResetState --> ShowLogin
```

---

## 2. Work Time Logging Flow (Stopwatch vs. Manual)

This flowchart illustrates the dual logging pathways: real-time stopwatch logging and manual retrospective logging.

```mermaid
graph TD
    Start([User is in dashboard/views]) --> ChooseMethod{Choose logging method}
    
    %% Stopwatch Flow
    ChooseMethod -- Stopwatch (Real-time) --> FindTask[Find assigned task card]
    FindTask --> ClickStart[Click Play/Start]
    ClickStart --> SetTimerState[isTimerRunning = true]
    SetTimerState --> ActiveState[Stopwatch increments every second]
    ActiveState --> ClickStop[Click Stop button]
    ClickStop --> StopTimer[isTimerRunning = false]
    StopTimer --> CalcTimes[Calculate startTime & endTime<br>based on duration]
    CalcTimes --> OpenModalPrefilled[Open TimeEntryModal<br>pre-filled with dates & times]
    
    %% Manual Flow
    ChooseMethod -- Manual Entry --> ClickAdd[Click 'Dodaj wpis' button]
    ClickAdd --> OpenModalEmpty[Open empty TimeEntryModal]
    OpenModalEmpty --> SelectProject[Select Project]
    SelectProject --> SelectTask[Select Task]
    SelectTask --> EnterDateTimes[Enter Date, Start & End times]
    
    %% Common Modal Flow
    OpenModalPrefilled --> EnterDesc[Type work description]
    EnterDateTimes --> EnterDesc
    EnterDesc --> ClickSave[Click Save/Submit]
    
    ClickSave --> Validate{Validate inputs &<br>overlapping time logs}
    Validate -- Errors found --> ShowAlert[Show form error alerts]
    ShowAlert --> EnterDesc
    
    Validate -- OK --> CheckTaskId{Is Task ID resolved?}
    CheckTaskId -- No (Typed manually) --> CreateTask[POST /api/tasks to create task]
    CreateTask --> GetTaskId[Retrieve new task ID]
    GetTaskId --> SendSaveEntry
    
    CheckTaskId -- Yes (Selected) --> SendSaveEntry[POST or PUT /api/time-entries]
    
    SendSaveEntry --> ReloadSWR[Trigger SWR mutate / refresh]
    ReloadSWR --> UpdateCalendar[Calendar grid redraws with new logs]
    UpdateCalendar --> CloseModal[Close Modal]
```

---

## 3. Report Generation & PDF Export Flow

This diagram illustrates how an Administrator queries the backend for reports and prints them to a PDF document client-side.

```mermaid
graph TD
    Start([Admin enters Reports View]) --> ClickGenerate[Click 'Generuj Raport' button]
    ClickGenerate --> OpenReportModal[Open GenerateReportModal]
    OpenReportModal --> SelectParams[Select Type, Date Range, Projects & Users]
    SelectParams --> ClickSubmit[Click 'Generuj' button]
    
    ClickSubmit --> SendQuery[GET /api/reports/{type} with params]
    SendQuery --> ShowLoader[Render loading spinner]
    
    SendQuery --> GetResponse{API returns data?}
    GetResponse -- Failure --> ShowError[Display query error alert]
    ShowError --> SelectParams
    
    GetResponse -- Success --> SetState[Update reports list and view report modal]
    SetState --> ShowTable[Render paginated reports data table]
    
    ShowTable --> ClickDownload[Click 'Pobierz PDF' button]
    ClickDownload --> GenerateDoc[Initialize jsPDF instance]
    GenerateDoc --> FormatTable[Parse HTML/JSON rows with AutoTable]
    FormatTable --> AddPageDecor[Inject company header, titles & footer pagination]
    AddPageDecor --> TriggerDownload[Trigger client browser file save]
    TriggerDownload --> End([PDF Downloaded])
```
