# Reports API Reference

Base URL: `http://localhost:8080/api/reports`

All endpoints are open (no authentication required). The four generation endpoints also set
the response header `X-Generated-By: ADMIN` and persist metadata to the `reports` table.

---

## Common behaviour

**Date filtering** — entries are included when `startTime` falls in
`[startDate 00:00:00, endDate 23:59:59]`.

**Active timers excluded** — time entries with `endTime = null` are never counted.

**Hours calculation** — `floor(Duration.toMinutes() / 60.0)` rounded to 2 decimal places.

**Empty range** — if no entries match the date range, `data` is returned as `[]`; the
endpoint never returns 404.

**Shared error format** (from `GlobalExceptionHandler`):
```json
{
  "status": 400,
  "message": "<reason>"
}
```

---

## Endpoints

---

### GET /api/reports/summary

Returns total hours logged and entry count per user within a date range.
Results are sorted alphabetically by username.

**Parameters:**

| Name      | Type      | Required | Format       | Constraints                    |
|-----------|-----------|----------|--------------|--------------------------------|
| startDate | LocalDate | yes      | `YYYY-MM-DD` | must not be after `endDate`    |
| endDate   | LocalDate | yes      | `YYYY-MM-DD` | must not be before `startDate` |

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

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `Both startDate and endDate are required` |
| 400 | `Start date cannot be after end date` |
| 400 | `Date range cannot exceed 366 days` |

**Example curl:**
```bash
curl "http://localhost:8080/api/reports/summary?startDate=2026-01-01&endDate=2026-12-31"
```

---

### GET /api/reports/detailed

Returns every completed time entry with a full breakdown (user, task, project, times, hours).
Results are sorted by date ascending, then by username.

**Parameters:**

| Name      | Type      | Required | Format       | Constraints                    |
|-----------|-----------|----------|--------------|--------------------------------|
| startDate | LocalDate | yes      | `YYYY-MM-DD` | must not be after `endDate`    |
| endDate   | LocalDate | yes      | `YYYY-MM-DD` | must not be before `startDate` |

**Response 200:**
```json
{
  "type": "DETAILED",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
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
- `date` — derived from `startTime` (date part only)
- `startTime` / `endTime` — wall-clock time formatted `HH:mm`
- `description` — may be `null` if the entry had no description

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `Both startDate and endDate are required` |
| 400 | `Start date cannot be after end date` |
| 400 | `Date range cannot exceed 366 days` |

**Example curl:**
```bash
curl "http://localhost:8080/api/reports/detailed?startDate=2026-05-01&endDate=2026-05-31"
```

---

### GET /api/reports/by-project

Returns aggregated hours, entry count, and distinct contributor count per project.
Results are sorted alphabetically by project name.

**Parameters:**

| Name      | Type      | Required | Format       | Constraints                    |
|-----------|-----------|----------|--------------|--------------------------------|
| startDate | LocalDate | yes      | `YYYY-MM-DD` | must not be after `endDate`    |
| endDate   | LocalDate | yes      | `YYYY-MM-DD` | must not be before `startDate` |

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
- `contributorCount` — count of distinct users who have at least one completed entry for
  this project in the date range
- Projects with no entries in the range are omitted from `data`

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `Both startDate and endDate are required` |
| 400 | `Start date cannot be after end date` |
| 400 | `Date range cannot exceed 366 days` |

**Example curl:**
```bash
curl "http://localhost:8080/api/reports/by-project?startDate=2026-01-01&endDate=2026-06-30"
```

---

### GET /api/reports/by-team

Returns aggregated hours, entry count, and team size per team.
Results are sorted alphabetically by team name. All teams are included even if they have
no entries; their `totalHours` and `totalEntries` will be `0`.

**Parameters:**

| Name      | Type      | Required | Format       | Constraints                    |
|-----------|-----------|----------|--------------|--------------------------------|
| startDate | LocalDate | yes      | `YYYY-MM-DD` | must not be after `endDate`    |
| endDate   | LocalDate | yes      | `YYYY-MM-DD` | must not be before `startDate` |

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

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `Both startDate and endDate are required` |
| 400 | `Start date cannot be after end date` |
| 400 | `Date range cannot exceed 366 days` |

**Example curl:**
```bash
curl "http://localhost:8080/api/reports/by-team?startDate=2026-01-01&endDate=2026-12-31"
```

---

### GET /api/reports

Returns metadata for all previously generated reports. Does not recompute data;
`data` is always an empty array in this response.

**Parameters:** none

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

**Errors:** none (always 200)

**Example curl:**
```bash
curl "http://localhost:8080/api/reports"
```

---

## Validation reference

All four generation endpoints share the same three validation rules, checked in this order:

| Rule | Condition | Status | Message |
|------|-----------|--------|---------|
| Missing params | Either `startDate` or `endDate` is absent | 400 | `Both startDate and endDate are required` |
| Reversed range | `startDate` is after `endDate` | 400 | `Start date cannot be after end date` |
| Range too wide | Difference > 366 days | 400 | `Date range cannot exceed 366 days` |
