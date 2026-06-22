# Time Entries API Reference

Base URL: `http://localhost:8080/api/time-entries`

All endpoints require authentication. Include the JWT token in every request:
```
Authorization: Bearer <token>
```

---

## Business Rules

### Active timer vs completed entry

Whether a timer is "running" is determined by the `endTime` field:

| `endTime` in request | Stored `isActive` | `durationMinutes` in response |
|----------------------|-------------------|-------------------------------|
| `null` (omitted)     | `true`            | `null`                        |
| provided             | `false`           | calculated automatically      |

Duration is `endTime - startTime` in whole minutes.

### Overlap validation

A user cannot have two active timers at the same time.
When creating a new entry with `endTime = null`, the system checks whether the user
already has any entry with `isActive = true`. If so, the request is rejected with **409**.

**To start a new timer:** stop the existing active entry first by calling
`PUT /api/time-entries/{id}` with an `endTime`, then create the new one.

### End time ordering

`endTime` must not be before `startTime`. Violating this returns **400**.

---

## DateTime Format

All `startTime` and `endTime` values use ISO 8601 local datetime:

```
"2026-05-11T09:00:00"
```

No timezone suffix. The server treats all timestamps as local server time.

---

## Error Response Format

```json
{ "status": 404, "message": "Time entry not found" }
```

---

## Endpoints

---

### GET /api/time-entries

Returns all time entries.

**Response 200:**

```json
[
  {
    "id": 1,
    "userId": 2,
    "username": "anna_kowalska",
    "taskId": 5,
    "taskName": "Implement login page",
    "projectId": 1,
    "projectName": "Time Tracking System",
    "startTime": "2026-05-11T09:00:00",
    "endTime": "2026-05-11T11:30:00",
    "isActive": false,
    "durationMinutes": 150,
    "description": "Frontend auth flow"
  },
  {
    "id": 2,
    "userId": 3,
    "username": "jan_nowak",
    "taskId": 6,
    "taskName": "Write unit tests",
    "projectId": 1,
    "projectName": "Time Tracking System",
    "startTime": "2026-05-11T10:00:00",
    "endTime": null,
    "isActive": true,
    "durationMinutes": null,
    "description": null
  }
]
```

Returns `[]` if no entries exist.

**Example curl:**

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/api/time-entries
```

---

### GET /api/time-entries/{id}

Returns a single time entry by ID.

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| id | Long | Time entry ID |

**Response 200:** single time entry object (same structure as above).

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Time entry not found` |

**Example curl:**

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/api/time-entries/1
```

---

### GET /api/time-entries/user/{userId}

Returns all time entries for a specific user.

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| userId | Long | User ID |

**Response 200:** array of time entry objects (same structure as GET /api/time-entries).

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `User not found` |

**Example curl:**

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/api/time-entries/user/2
```

---

### GET /api/time-entries/task/{taskId}

Returns all time entries for a specific task.

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| taskId | Long | Task ID |

**Response 200:** array of time entry objects.

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Task not found` |

**Example curl:**

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/api/time-entries/task/5
```

---

### POST /api/time-entries

Creates a new time entry. Use `endTime: null` to start an active timer.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| userId | Long | yes | must reference existing user |
| taskId | Long | yes | must reference existing task |
| startTime | String (LocalDateTime) | yes | format `YYYY-MM-DDTHH:mm:ss` |
| endTime | String (LocalDateTime) | no | if provided: must be after `startTime` |
| description | String | no | — |

**Example — completed entry:**

```json
{
  "userId": 2,
  "taskId": 5,
  "startTime": "2026-05-11T09:00:00",
  "endTime": "2026-05-11T11:30:00",
  "description": "Frontend auth flow"
}
```

**Example — start active timer (omit endTime):**

```json
{
  "userId": 2,
  "taskId": 5,
  "startTime": "2026-05-11T13:00:00"
}
```

**Response 201:**

```json
{
  "id": 3,
  "userId": 2,
  "username": "anna_kowalska",
  "taskId": 5,
  "taskName": "Implement login page",
  "projectId": 1,
  "projectName": "Time Tracking System",
  "startTime": "2026-05-11T09:00:00",
  "endTime": "2026-05-11T11:30:00",
  "isActive": false,
  "durationMinutes": 150,
  "description": "Frontend auth flow"
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `End time cannot be before start time` |
| 400 | Validation error for missing required fields |
| 404 | `User not found` |
| 404 | `Task not found` |
| 409 | `User already has an active time entry` |

**Example curl:**

```bash
curl -X POST http://localhost:8080/api/time-entries \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"userId":2,"taskId":5,"startTime":"2026-05-11T09:00:00","endTime":"2026-05-11T11:30:00","description":"Frontend auth flow"}'
```

---

### PUT /api/time-entries/{id}

Updates a time entry. Use this to stop an active timer by providing `endTime`.

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| id | Long | Time entry ID |

**Request Body:** same fields as `POST /api/time-entries`.

**Example — stop active timer:**

```json
{
  "userId": 2,
  "taskId": 5,
  "startTime": "2026-05-11T13:00:00",
  "endTime": "2026-05-11T15:45:00",
  "description": "Resolved blocking issue"
}
```

**Response 200:** updated time entry object.

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `End time cannot be before start time` |
| 404 | `Time entry not found` |
| 404 | `User not found` |
| 404 | `Task not found` |

**Example curl:**

```bash
curl -X PUT http://localhost:8080/api/time-entries/2 \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"userId":2,"taskId":5,"startTime":"2026-05-11T13:00:00","endTime":"2026-05-11T15:45:00"}'
```

---

### DELETE /api/time-entries/{id}

Deletes a time entry.

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| id | Long | Time entry ID |

**Response 204:** no body.

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Time entry not found` |

**Example curl:**

```bash
curl -X DELETE http://localhost:8080/api/time-entries/2 \
     -H "Authorization: Bearer <token>"
```
