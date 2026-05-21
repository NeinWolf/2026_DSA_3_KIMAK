-- 1. Walidacja dat projektu: data zakończenia nie może być wcześniejsza niż startu
ALTER TABLE Projects 
DROP CONSTRAINT IF EXISTS check_project_dates;

ALTER TABLE Projects 
ADD CONSTRAINT check_project_dates 
    CHECK (end_date IS NULL OR end_date >= start_date);


-- 2. Walidacja czasu pracy: Nadpisujemy stary constraint z V1 na wypadek zmian (bezpieczny DROP)
ALTER TABLE Time_Entries 
DROP CONSTRAINT IF EXISTS check_times;

ALTER TABLE Time_Entries 
ADD CONSTRAINT check_times 
    CHECK (end_time IS NULL OR end_time > start_time);


-- 3. Walidacja zakresu dat generowanego raportu
ALTER TABLE Reports 
DROP CONSTRAINT IF EXISTS check_report_dates;

ALTER TABLE Reports 
ADD CONSTRAINT check_report_dates 
    CHECK (end_date >= start_date);


-- 4. Bezpieczna relacja dla raportów (ZMIANA Z RESTRICT NA ON DELETE SET NULL)
-- Najpierw usuwamy stary klucz obcy wygenerowany przez Postgresa w V1
ALTER TABLE Reports DROP CONSTRAINT IF EXISTS reports_generated_by_fkey;
ALTER TABLE Reports DROP CONSTRAINT IF EXISTS fk_reports_generated_by;

ALTER TABLE Reports
ADD CONSTRAINT fk_reports_generated_by 
    FOREIGN KEY (generated_by) REFERENCES Users(id) ON DELETE SET NULL;


-- 5. Nazwa projektu nie może być pustym stringiem ani samymi spacjami
ALTER TABLE Projects 
DROP CONSTRAINT IF EXISTS chk_project_name_not_empty;

ALTER TABLE Projects 
ADD CONSTRAINT chk_project_name_not_empty 
    CHECK (TRIM(name) <> '');


-- 6. Nazwa zadania nie może być pusta
ALTER TABLE Tasks 
DROP CONSTRAINT IF EXISTS chk_task_name_not_empty;

ALTER TABLE Tasks 
ADD CONSTRAINT chk_task_name_not_empty 
    CHECK (TRIM(name) <> '');