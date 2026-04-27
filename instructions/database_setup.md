# Time Tracking System — Database Setup Guide

## Prerequisites

Make sure you have the following installed before starting:

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Java 17+ (the project uses JDK 26, available via IntelliJ's JDK downloader)
- Git

---

## 1. Clone the repository

```bash
git clone https://github.com/NeinWolf/2026_DSA_3_KIMAK.git
cd 2026_DSA_3_KIMAK
```

---

## 2. Start the database

```bash
docker-compose up -d
```

Verify it's running:

```bash
docker ps
```

You should see a `postgres` container listed with port `5432` mapped.

---

## 3. Run the backend

```bash
./gradlew bootRun
```

> **Note:** If IntelliJ downloaded a JDK automatically (e.g. `openjdk-26.0.1`), you may need to specify it explicitly:
> ```bash
> JAVA_HOME=~/.jdks/openjdk-26.0.1 PATH=~/.jdks/openjdk-26.0.1/bin:$PATH ./gradlew bootRun
> ```
> Check your JDK folder name with `ls ~/.jdks/` and adjust accordingly.

The app is ready when you see:

```
Started TimeTrackingApplication in X.XXX seconds
```

---

## 4. Verify the database tables

```bash
docker exec -it $(docker ps -q) psql -U postgres -d timetracking
```

Inside psql:

```sql
\dt
```

You should see all tables: `users`, `teams`, `projects`, `tasks`, `time_entries`, etc.

Type `\q` to exit.

---

## Database credentials

| Field    | Value        |
|----------|--------------|
| Host     | localhost    |
| Port     | 5432         |
| Database | timetracking |
| Username | postgres     |
| Password | postgres     |

---

## Platform-specific notes

### Windows

Replace `./gradlew` with `gradlew.bat` and set JAVA_HOME like this if needed:

```cmd
set JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1
set PATH=%JAVA_HOME%\bin;%PATH%
gradlew.bat bootRun
```

### Arch-based Linux (CachyOS, Manjaro, etc.)

After installing Docker, make sure to add your user to the docker group to avoid `permission denied` errors:

```bash
sudo usermod -aG docker $USER
```

Then **log out and back in** for it to take effect. Until then, prefix docker commands with `sudo`.

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

Stop whatever is using it (another Docker container, local PostgreSQL, etc.) then retry `docker-compose up -d`.

**Permission denied on docker socket:**

```bash
sudo usermod -aG docker $USER
newgrp docker  # applies immediately in current session
```

**App crashes on startup:**

Make sure the Docker container is running before starting the app — PostgreSQL must be up first.

**Tables not created:**

Check `application.properties` contains:

```properties
spring.jpa.hibernate.ddl-auto=update
```

---

## Stopping everything

Stop the app: `Ctrl+C` in the terminal running `bootRun`

Stop the database:

```bash
docker-compose down
```

To also delete all stored data:

```bash
docker-compose down -v
```
