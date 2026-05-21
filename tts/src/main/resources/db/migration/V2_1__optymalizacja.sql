-- 1. Indeksy dla tabel łączących - szybkie JOINy między użytkownikami, zespołami i projektami
CREATE INDEX idx_team_members_user_id ON Team_Members(user_id);
CREATE INDEX idx_team_members_team_id ON Team_Members(team_id);

CREATE INDEX idx_project_teams_project_id ON Project_Teams(project_id);
CREATE INDEX idx_project_teams_team_id ON Project_Teams(team_id);

CREATE INDEX idx_task_assignments_task_id ON Task_Assignments(task_id);
CREATE INDEX idx_task_assignments_user_id ON Task_Assignments(user_id);

-- 2. Indeksy dla tabel głównych - Przyspieszają filtrowanie zadań w projektach i wpisów czasu
CREATE INDEX idx_tasks_project_id ON Tasks(project_id);

CREATE INDEX idx_time_entries_user_id ON Time_Entries(user_id);
CREATE INDEX idx_time_entries_task_id ON Time_Entries(task_id);

-- 3. Indeks częściowy – Optymalizacja pod UC-08
-- Przyspiesza wyszukiwanie osób, które aktualnie mają włączony stoper, ignorując zamknięte wpisy
CREATE INDEX idx_time_entries_active ON Time_Entries(user_id) 
WHERE is_active = TRUE;
