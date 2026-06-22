# Reports API Reference

Base URL: `http://localhost:8080/api/reports`

All report endpoints are **public** — no authentication required.

The four generation endpoints (`/summary`, `/detailed`, `/by-project`, `/by-team`) also:
- Set the response header `X-Generated-By: ADMIN`
- Persist report metadata to the `reports` table

---

## Common Behaviour

**Date filtering** — entries are included when `startTime` falls in
`[startDate 00:00:00, endDate 23:59:59]`.

**Active timers excluded** — time entries with `endTime = null` are never counted.

**Hours calculation** — `floor(Duration.toMinutes() / 60.0)` rounded to 2 decimal places.

**Empty range** — if no entries match the date range, `data` is returned as `[]`;
the endpoint never returns 404.

**Shared error format** (from `GlobalExceptionHandler`):

```json
{ "status": 400, "message": "<reason>" }
```

---

## Validation (all generation endpoints)

All four generation endpoints share the same three rules, checked in this order:

| Rule | Condition | Status | Message |
|------|-----------|--------|---------|
| Missing params | Either `startDate` or `endDate` is absent | 400 | `Both startDate and endDate are required` |
| Reversed range | `startDate` is after `endDate` | 400 | `Start date cannot be after end date` |
| Range too wide | Difference > 366 days | 400 | `Date range cannot exceed 366 days` |

---

## Endpoints

---

### GET /api/reports

Returns metadata for all previously generated reports.
Does not recompute data — `data` is always an empty array in this response.

**Query parameters:** none

**Response 200:**

```json
[
  {
    "type": "SUMMARY",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "generatedAt": "2026-06-08T14:30:00",
    "data": []
  },
  {
    "type": "DETAILED",
    "startDate": "2026-05-01",
    "endDate": "2026-05-31",
    "generatedAt": "2026-06-08T15:12:44",
    "data": []
  }
]
```

Returns `[]` if no reports have been generated yet.

**Example curl:**

```bash
curl http://localhost:8080/api/reports
```

---

### GET /api/reports/summary

Returns total hours logged and entry count per user within a date range.
Results are sorted alphabetically by username.

**Query parameters:**

| Name | Type | Required | Format | Constraints |
|------|------|----------|--------|-------------|
| startDate | LocalDate | yes | `YYYY-MM-DD` | must not be after `endDate` |
| endDate | LocalDate | yes | `YYYY-MM-DD` | must not be before `startDate` |

**Response 200:**

```json
{
  "type": "SUMMARY",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "generatedAt": "2026-06-08T14:30:00",
  "data": [
    {
      "userId": 1,
      "username": "anna_kowalska",
      "totalHours": 42.5,
      "totalEntries": 15
    },
    {
      "userId": 2,
      "username": "jan_nowak",
      "totalHours": 18.0,
      "totalEntries": 7
    }
  ]
}
```

**Errors:** see [Validation](#validation-all-generation-endpoints) above.

**Example curl:**

```bash
curl "http://localhost:8080/api/reports/summary?startDate=2026-01-01&endDate=2026-12-31"
```

---

### GET /api/reports/detailed

Returns every completed time entry with a full breakdown (user, task, project, times, hours).
Results are sorted by date ascending, then by username.

**Query parameters:** same as `/summary`.

**Response 200:**

```json
{
  "type": "DETAILED",
  "startDate": "2026-05-01",
  "endDate": "2026-05-31",
  "generatedAt": "2026-06-08T14:30:00",
  "data": [
    {
      "userId": 1,
      "username": "anna_kowalska",
      "taskId": 3,
      "taskName": "Implement login page",
      "projectId": 1,
      "projectName": "Time Tracking System",
      "date": "2026-05-01",
      "startTime": "09:00",
      "endTime": "11:30",
      "hours": 2.5,
      "description": "Frontend work on auth flow"
    }
  ]
}
```

**Field notes:**
- `date` — derived from `startTime` (date part only), formatted `yyyy-MM-dd`
- `startTime` / `endTime` — wall-clock time formatted `HH:mm`
- `description` — may be `null`

**Errors:** see [Validation](#validation-all-generation-endpoints) above.

**Example curl:**

```bash
curl "http://localhost:8080/api/reports/detailed?startDate=2026-05-01&endDate=2026-05-31"
```

---

### GET /api/reports/by-project

Returns aggregated hours, entry count, and distinct contributor count per project.
Results are sorted alphabetically by project name.
Projects with no completed entries in the date range are omitted from `data`.

**Query parameters:** same as `/summary`.

**Response 200:**

```json
{
  "type": "PER_PROJECT",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "generatedAt": "2026-06-08T14:30:00",
  "data": [
    {
      "projectId": 1,
      "projectName": "Time Tracking System",
      "totalHours": 120.0,
      "totalEntries": 45,
      "contributorCount": 3
    }
  ]
}
```

**Field notes:**
- `contributorCount` — distinct users with at least one completed entry for this project

**Errors:** see [Validation](#validation-all-generation-endpoints) above.

**Example curl:**

```bash
curl "http://localhost:8080/api/reports/by-project?startDate=2026-01-01&endDate=2026-06-30"
```

---

### GET /api/reports/by-team

Returns aggregated hours, entry count, and team size per team.
Results are sorted alphabetically by team name.
**All teams are included** even if they have no entries — `totalHours` and `totalEntries`
will be `0` for inactive teams.

**Query parameters:** same as `/summary`.

**Response 200:**

```json
{
  "type": "PER_TEAM",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "generatedAt": "2026-06-08T14:30:00",
  "data": [
    {
      "teamId": 1,
      "teamName": "Backend Team",
      "totalHours": 80.0,
      "totalEntries": 30,
      "memberCount": 4
    },
    {
      "teamId": 2,
      "teamName": "Frontend Team",
      "totalHours": 55.5,
      "totalEntries": 21,
      "memberCount": 3
    }
  ]
}
```

**Field notes:**
- `memberCount` — total members in the team regardless of whether they logged time
- A user who belongs to multiple teams has their entries counted once per team

**Errors:** see [Validation](#validation-all-generation-endpoints) above.

**Example curl:**

```bash
curl "http://localhost:8080/api/reports/by-team?startDate=2026-01-01&endDate=2026-12-31"
```
