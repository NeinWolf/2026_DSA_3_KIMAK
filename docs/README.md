# Time Tracking System — Backend Documentation

A REST API backend for logging and reporting employee work time against project tasks.
Built with Spring Boot 3.4.1, secured with JWT, and backed by PostgreSQL.

---

## Tech Stack

| Component       | Version / Tool             |
|-----------------|----------------------------|
| Framework       | Spring Boot 3.4.1          |
| Language        | Java 21 (JDK toolchain)    |
| Database        | PostgreSQL 15              |
| Migrations      | Flyway                     |
| Security        | Spring Security + JWT      |
| Build tool      | Gradle (Wrapper included)  |
| Local DB        | Docker Compose             |

---

## Documentation Index

### Backend Documentation
| File | Contents |
|------|----------|
| [SETUP.md](SETUP.md) | Prerequisites, clone, start DB, run backend, troubleshooting |
| [API_PROJECTS.md](API_PROJECTS.md) | Projects CRUD endpoints |
| [API_TEAMS.md](API_TEAMS.md) | Teams CRUD + member management endpoints |
| [API_TIMEENTRIES.md](API_TIMEENTRIES.md) | Time entry logging and timer endpoints |
| [API_REPORTS.md](API_REPORTS.md) | Report generation endpoints |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Package structure, layer responsibilities, DB schema |
| [BUSINESS_RULES.md](BUSINESS_RULES.md) | All validation and business logic rules |

### Frontend Documentation (React / Next.js)
| File | Contents |
|------|----------|
| [FRONTEND_DOCUMENTATION.md](FRONTEND_DOCUMENTATION.md) | Technical stack, directory structure, SWR & caching, mapping layer |
| [FRONTEND_USE_CASES.md](FRONTEND_USE_CASES.md) | Full description of Employee and Admin functional use cases |
| [FRONTEND_USER_MANUAL.md](FRONTEND_USER_MANUAL.md) | User manual and step-by-step guides for logging time and managing teams |
| [FRONTEND_FLOWCHARTS.md](FRONTEND_FLOWCHARTS.md) | Visual Mermaid flowcharts for auth, logging, and reporting |

---

## Quick Start

```bash
# 1. Start the database
cd tts
docker-compose up -d

# 2. Run the backend
./gradlew bootRun

# 3. Verify it's up
curl http://localhost:8080/api/reports
```

The app is ready when you see:
```
Started TimeTrackingApplication in X.XXX seconds
```

> If `./gradlew` fails with "JAVA_HOME not set", see [SETUP.md](SETUP.md) for platform-specific instructions.

---

## API Base URL

```
http://localhost:8080
```

Most endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Obtain a token via `POST /api/auth/login`. Report endpoints (`/api/reports/**`) and
user registration (`POST /api/users`) are public and do not require authentication.

