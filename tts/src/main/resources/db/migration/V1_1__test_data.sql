-- V1_1__test_data.sql

-- 1. Dodanie podstawowych użytkowników
-- Hasła są wpisane tekstowo, Spring Security zajmie się ich weryfikacją później
INSERT INTO Users (username, password_hash, role) VALUES 
('admin_filip', 'hash_admin_123', 'ADMIN'),
('mikolaj_programista', 'hash_emp_789', 'EMPLOYEE'),
('oliwier_programista', 'hash_emp_456', 'EMPLOYEE');


-- 2. Dodanie zespołów
INSERT INTO Teams (name) VALUES 
('Zespół Backend'),
('Zespół Frontend');

-- 3. Przypisanie ludzi do zespołów (Team_Members)
INSERT INTO Team_Members (user_id, team_id) VALUES 
(2, 1), -- Mikołaj do Backendu
(3, 2); -- Oliwier do Frontendu

-- 4. Dodanie projektu
INSERT INTO Projects (name, description, status, start_date) VALUES 
('System Time Tracking', 'Projekt zaliczeniowy z Database Systems and Applications - aplikacja do logowania czasu.', 'IN_PROGRESS', CURRENT_DATE);

-- 5. POWIĄZANIE PROJEKTU Z DWOMA ZESPOŁAMI
INSERT INTO Project_Teams (project_id, team_id) VALUES 
(1, 1), -- Projekt widoczny dla Backendu
(1, 2); -- Projekt widoczny dla Frontendu

-- 6. Dodanie przykładowych zadań
INSERT INTO Tasks (project_id, name, description, status) VALUES 
(1, 'Zrobić zakupy w biedronce', 'Coś trzeba jeść.', 'DONE'),
(1, 'Zjeść obiad', 'Ciężko się uczy na pusty żołądek.', 'TODO');

-- 7. Przypisanie zadania do konkretnego pracownika (UC-07)
INSERT INTO Task_Assignments (task_id, user_id) VALUES 
(2, 2); -- Mikołaj przypisany do zjedzenia obiadu
