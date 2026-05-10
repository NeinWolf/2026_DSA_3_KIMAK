-- 1. Tabela Użytkowników (UC-11, UC-15)
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE'))
);

-- 2. Tabela Zespołów (UC-11)
CREATE TABLE Teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- 3. Członkowie Zespołów (Relacja Many-to-Many między User a Team)
CREATE TABLE Team_Members (
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    team_id INT REFERENCES Teams(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, team_id)
);

-- 4. Tabela Projektów (UC-06)
CREATE TABLE Projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PLANNED',
    start_date DATE,
    end_date DATE
);

-- 5. Relacja Projekt-Team (Wymaganie: jeden projekt wiele teamów)
-- Pozwala członkom zespołu widzieć statusy zadań w ramach projektu (UC-02)
CREATE TABLE Project_Teams (
    project_id INT REFERENCES Projects(id) ON DELETE CASCADE,
    team_id INT REFERENCES Teams(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, team_id)
);

-- 6. Tabela Zadań (UC-06)
CREATE TABLE Tasks (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES Projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'TODO'
);

-- 7. Przypisanie konkretnych pracowników do zadań (UC-07)
CREATE TABLE Task_Assignments (
    task_id INT REFERENCES Tasks(id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)
);

-- 8. Logowanie Czasu (UC-01, UC-03, UC-08, UC-13)
CREATE TABLE Time_Entries (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    task_id INT REFERENCES Tasks(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL, -- Do walidacji nakładania się (UC-13)
    end_time TIMESTAMP,            -- NULL oznacza aktywny stoper (UC-08)
    is_active BOOLEAN DEFAULT FALSE, -- Monitorowanie w czasie rzeczywistym (UC-08)
    description TEXT,
    
    -- Walidacja: end_time musi być po start_time (UC-13)
    CONSTRAINT check_times CHECK (end_time IS NULL OR end_time > start_time)
);

-- 9. Raporty (UC-09, UC-10)
CREATE TABLE Reports (
    id SERIAL PRIMARY KEY,
    generated_by INT REFERENCES Users(id), -- Administrator
    type VARCHAR(50) NOT NULL,             -- daily/weekly/monthly
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
