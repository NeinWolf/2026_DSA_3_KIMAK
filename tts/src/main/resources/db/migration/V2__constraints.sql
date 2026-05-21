-- 1. Walidacja dat projektu: data zakończenia nie może być wcześniejsza niż startu
ALTER TABLE Projects 
ADD CONSTRAINT check_project_dates 
    CHECK (end_date IS NULL OR end_date >= start_date);

-- 2. Walidacja czasu pracy: end_time musi być po start_time
ALTER TABLE Time_Entries 
ADD CONSTRAINT check_times 
    CHECK (end_time IS NULL OR end_time > start_time);

-- 3. Walidacja zakresu dat generowanego raportu
ALTER TABLE Reports 
ADD CONSTRAINT check_report_dates 
    CHECK (end_date >= start_date);

-- 4. Bezpieczna relacja dla raportów: 
-- Jeśli usuniemy admina, raport zostaje w bazie (nie usuwa się kaskadowo)
ALTER TABLE Reports
DROP CONSTRAINT IF EXISTS reports_generated_by_fkey,
ADD CONSTRAINT fk_reports_generated_by 
    FOREIGN KEY (generated_by) REFERENCES Users(id) ON DELETE SET NULL;

-- 5. Nazwa projektu nie może być pustym stringiem ani samymi spacjami
ALTER TABLE Projects 
ADD CONSTRAINT chk_project_name_not_empty 
    CHECK (TRIM(name) <> '');

-- 6. Nazwa zadania nie może być pusta
ALTER TABLE Tasks 
ADD CONSTRAINT chk_task_name_not_empty 
    CHECK (TRIM(name) <> '');
