# System Architecture

---

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                     HTTP Clients                     │
│            (browser, curl, Postman, frontend)        │
└───────────────────────┬─────────────────────────────┘
                        │  HTTP/REST (port 8080)
┌───────────────────────▼─────────────────────────────┐
│                Spring Security Filter                │
│          (JWT validation on every request)           │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│                  Controller Layer                    │
│  AuthController  ProjectController  TaskController   │
│  UserController  TimeEntryController ReportController│
└───────────────────────┬─────────────────────────────┘
                        │  method calls
┌───────────────────────▼─────────────────────────────┐
│                   Service Layer                      │
│  AuthService  ProjectService   TaskService           │
│  UserService  TimeEntryService ReportService         │
│               JwtService                             │
└───────────────────────┬─────────────────────────────┘
                        │  Spring Data JPA
┌───────────────────────▼─────────────────────────────┐
│                 Repository Layer                     │
│  UserRepository     ProjectRepository               │
│  TaskRepository     TimeEntryRepository             │
│  TeamRepository     ReportRepository                │
└───────────────────────┬─────────────────────────────┘
                        │  JDBC (PostgreSQL driver)
┌───────────────────────▼─────────────────────────────┐
│              PostgreSQL 15 Database                  │
│           (Docker container: tts_postgres)           │
│         Schema managed by Flyway migrations          │
└─────────────────────────────────────────────────────┘
```

---

## Package Structure

```
com.timetracking/
│
├── TimeTrackingApplication.java       — @SpringBootApplication entry point
│
├── config/
│   ├── GlobalExceptionHandler.java    — @RestControllerAdvice, maps exceptions to HTTP
│   ├── JwtAuthenticationFilter.java   — reads JWT from Authorization header
│   └── SecurityConfig.java            — Spring Security filter chain, public routes
│
├── controller/
│   ├── AuthController.java            — POST /api/auth/login
│   ├── ProjectController.java         — /api/projects CRUD
│   ├── TaskController.java            — /api/tasks CRUD + assign endpoint
│   ├── TimeEntryController.java       — /api/time-entries CRUD
│   ├── UserController.java            — /api/users CRUD
│   └── ReportController.java          — /api/reports generation
│
├── service/
│   ├── AuthService.java               — login, password verification
│   ├── JwtService.java                — token generation and validation
│   ├── ProjectService.java            — project CRUD + date validation
│   ├── TaskService.java               — task CRUD + user assignment
│   ├── TimeEntryService.java          — timer logic, overlap check, duration calc
│   ├── UserService.java               — user CRUD + password hashing
│   └── ReportService.java             — report aggregation and persistence
│
├── repository/
│   ├── UserRepository.java
│   ├── ProjectRepository.java
│   ├── TaskRepository.java
│   ├── TimeEntryRepository.java
│   ├── TeamRepository.java
│   └── ReportRepository.java
│
├── entity/
│   ├── User.java                      — users table
│   ├── Role.java                      — ADMIN | EMPLOYEE enum
│   ├── Team.java                      — teams table
│   ├── Project.java                   — projects table
│   ├── Task.java                      — tasks table
│   ├── TaskStatus.java                — TODO | IN_PROGRESS | DONE enum
│   ├── TimeEntry.java                 — time_entries table
│   ├── Report.java                    — reports table
│   └── ReportType.java                — SUMMARY | DETAILED | PER_PROJECT | PER_TEAM enum
│
└── dto/
    ├── LoginRequestDTO.java
    ├── AuthResponseDTO.java
    ├── UserRequestDTO.java / UserResponseDTO.java
    ├── ProjectRequestDTO.java / ProjectResponseDTO.java
    ├── TaskRequestDTO.java / TaskResponseDTO.java
    ├── TimeEntryRequestDTO.java / TimeEntryResponseDTO.java
    └── report/
        ├── ReportResponseDTO.java     — generic wrapper <T>
        ├── SummaryReportItemDTO.java
        ├── DetailedReportItemDTO.java
        ├── ProjectReportItemDTO.java
        └── TeamReportItemDTO.java
```

---

## Layer Descriptions

### Controller Layer

Receives HTTP requests, delegates to the service, and returns HTTP responses.

**Does:** maps HTTP verbs and paths to service calls, validates request bodies with `@Valid`,
sets HTTP status codes.

**Does NOT do:** contain business logic, access repositories directly, or manipulate
database objects. Controllers only work with DTOs.

### Service Layer

Contains all business logic. Reads and writes data through repositories.
Throws `ResponseStatusException` for any business rule violation — `GlobalExceptionHandler`
converts these into JSON error responses.

**Business logic lives here:** date validation, overlap checks, duration calculation,
report aggregation, password hashing, JWT issuance.

### Repository Layer

Spring Data JPA interfaces that extend `JpaRepository<Entity, Long>`.
Provide standard CRUD out of the box plus custom derived queries declared by method name
(e.g. `findByUserId`, `findByUserIdAndIsActiveTrue`).

**Does NOT:** contain business logic. Only query methods.

### Entity Layer

JPA-annotated classes that map 1:1 to database tables.
Annotated with Lombok `@Getter @Setter` to reduce boilerplate.
Relationships are declared with `@ManyToOne`, `@OneToMany`, `@ManyToMany`.

`@JsonIgnore` is placed on collection fields to prevent circular serialization
(e.g. `User.timeEntries`, `Task.timeEntries`).

### DTO Layer

Plain Java classes used for HTTP request and response bodies.
DTOs decouple the API contract from the database schema, allowing each to evolve
independently. They also prevent accidental exposure of internal fields
(e.g. `passwordHash` is never in a response DTO).

Request DTOs carry `@NotNull` / `@NotBlank` annotations for Bean Validation.
Response DTOs have static `fromEntity(Entity)` factory methods.

---

## Database Schema

All tables are created and migrated by Flyway.

| Table | Purpose |
|-------|---------|
| `users` | User accounts; stores username, bcrypt password hash, and role (ADMIN/EMPLOYEE) |
| `teams` | Named groups of users |
| `team_members` | Join table: user ↔ team (many-to-many) |
| `projects` | Projects with optional start/end dates |
| `project_teams` | Join table: project ↔ team (many-to-many, DB only — no Java entity) |
| `tasks` | Tasks belonging to a project; each has a status (TODO/IN_PROGRESS/DONE) |
| `task_assignments` | Join table: task ↔ user (who is assigned to what) |
| `time_entries` | Work time logs; `end_time = NULL` means a running timer |
| `reports` | Metadata for generated reports (type, date range, who generated it) |

### Key constraints (from Flyway migrations)

- `time_entries.end_time > start_time` (when not null)
- `projects.end_date >= start_date` (when not null)
- Project and task names cannot be blank (`TRIM(name) <> ''`)
- `reports.generated_by` uses `ON DELETE SET NULL` — deleting a user does not delete report history

---

## Flyway and Hibernate

**Flyway** runs on startup before the application serves any requests.
It applies all pending SQL migration files from `src/main/resources/db/migration/`
in version order (`V1__`, `V2__`, `V2_1__`, etc.).

**Hibernate** is configured with `ddl-auto=none`, meaning it does **not** create
or alter tables. Hibernate only generates the SQL for `INSERT`, `SELECT`, `UPDATE`,
and `DELETE` operations at runtime.

The two tools have complementary roles: Flyway owns the schema lifecycle,
Hibernate owns the runtime data access.

### Migration files

| File | Contents |
|------|----------|
| `V1__initital_schema.sql` | Creates all 9 tables |
| `V1_1__test_data.sql` | Seeds initial test data |
| `V2__constraints.sql` | Adds check constraints and fixes FK for reports |
| `V2_1__optymalizacja.sql` | Adds indexes on join tables and `time_entries` |

---

## Docker

The `tts/docker-compose.yml` file defines a single service:

```yaml
postgres:
  image: postgres:15
  container_name: tts_postgres
  environment:
    POSTGRES_DB: timetracking
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

Data is persisted in a named Docker volume (`postgres_data`) so it survives container
restarts. Remove it with `docker-compose down -v` to start with a clean database.

The Spring Boot application runs outside Docker (via `./gradlew bootRun`) and connects
to the container over `localhost:5432`.
