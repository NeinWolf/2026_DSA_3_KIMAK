# Setup Guide

Full instructions to get the Time Tracking System backend running locally.

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|-----------------|-------|
| Git | any | |
| Docker | 20+ | Required to run PostgreSQL |
| Docker Compose | v2 (`docker compose`) or v1 (`docker-compose`) | Bundled with Docker Desktop |
| JDK | 21+ | See notes below |

**JDK options:**
- IntelliJ IDEA can download a JDK automatically (Settings → SDKs → +).
  Common download locations: `~/.jdks/ms-21.0.x` or `~/.jdks/openjdk-26.0.x`.
- Or install manually: `sdk install java 21-tem` (SDKMAN), `brew install openjdk@21`, etc.

---

## 1. Clone the Repository

```bash
git clone https://github.com/NeinWolf/2026_DSA_3_KIMAK.git
cd 2026_DSA_3_KIMAK
```

---

## 2. Start the Database

The `docker-compose.yml` is located inside the `tts/` subdirectory.

```bash
cd tts
docker-compose up -d
```

Verify it is running:

```bash
docker ps
```

You should see `tts_postgres` listed with port `5432` mapped.

---

## 3. Run the Backend

From the `tts/` directory:

```bash
./gradlew bootRun
```

If `JAVA_HOME` is not set, specify it explicitly (adjust the path to your JDK):

```bash
JAVA_HOME=~/.jdks/ms-21.0.11 PATH=~/.jdks/ms-21.0.11/bin:$PATH ./gradlew bootRun
```

Check available JDKs with: `ls ~/.jdks/`

The app is ready when you see:

```
Started TimeTrackingApplication in X.XXX seconds
```

---

## 4. Verify Setup

Check that the API responds:

```bash
curl http://localhost:8080/api/reports
```

Expected response: `[]` (empty list — no reports generated yet).

Connect to the database and inspect tables:

```bash
docker exec -it tts_postgres psql -U postgres -d timetracking
```

Inside psql:

```sql
\dt
\q
```

You should see: `flyway_schema_history`, `projects`, `reports`, `task_assignments`,
`tasks`, `team_members`, `teams`, `time_entries`, `users`.

---

## Environment Variables Reference

All settings are in `tts/src/main/resources/application.properties`.

| Property | Default | Description |
|----------|---------|-------------|
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/timetracking` | JDBC URL |
| `spring.datasource.username` | `postgres` | DB username |
| `spring.datasource.password` | `postgres` | DB password |
| `spring.jpa.hibernate.ddl-auto` | `none` | Flyway owns the schema — do not change to `update` |
| `spring.flyway.enabled` | `true` | Runs migrations on startup |
| `spring.flyway.locations` | `classpath:db/migration` | Migration scripts path |

### Database credentials (Docker default)

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `timetracking` |
| Username | `postgres` |
| Password | `postgres` |

---

## Platform Notes

### Windows

Replace `./gradlew` with `gradlew.bat`. Set `JAVA_HOME` from Command Prompt:

```cmd
set JAVA_HOME=%USERPROFILE%\.jdks\ms-21.0.11
set PATH=%JAVA_HOME%\bin;%PATH%
gradlew.bat bootRun
```

Use `docker-compose` (with hyphen) if you have Compose v1.

### Arch-based Linux (CachyOS, Manjaro, etc.)

Add your user to the `docker` group to avoid `permission denied` on the Docker socket:

```bash
sudo usermod -aG docker $USER
```

Log out and back in for it to take effect. Until then, prefix docker commands with `sudo`.

### Ubuntu / Debian

```bash
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
```

Log out and back in, then proceed from Step 2.

---

## Troubleshooting

**Port 5432 already in use:**

```bash
sudo ss -tlnp | grep 5432
```

Stop whatever is using it (another Docker container, a local PostgreSQL install, etc.),
then retry `docker-compose up -d`.

**Permission denied on Docker socket:**

```bash
sudo usermod -aG docker $USER
newgrp docker   # applies in the current session immediately
```

**App crashes on startup with connection error:**

Make sure the Docker container is running *before* starting the app.
PostgreSQL must be fully up (check `docker ps` — state should be `Up`).

**Tables not created / Flyway errors:**

The project uses Flyway for schema management. `ddl-auto` is intentionally set to `none` —
Hibernate does *not* create tables. If you see Flyway migration errors, check:

```bash
docker exec -it tts_postgres psql -U postgres -d timetracking -c "SELECT * FROM flyway_schema_history;"
```

A failed migration will block the app. Fix the migration file or reset with:

```bash
docker-compose down -v   # deletes all data
docker-compose up -d
```

---

## Stopping Everything

Stop the app: `Ctrl+C` in the terminal running `bootRun`.

Stop the database (keep data):

```bash
docker-compose down
```

Stop the database and delete all stored data:

```bash
docker-compose down -v
```
