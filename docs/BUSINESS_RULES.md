# Business Rules Reference

All validation and business logic enforced by the backend services.
Errors are returned in the standard format from `GlobalExceptionHandler`:

```json
{ "status": 400, "message": "<reason>" }
```

---

## Projects

### Date validation
`endDate` cannot be before `startDate`.

- Applies to: `POST /api/projects`, `PUT /api/projects/{id}`
- Condition: `endDate != null && startDate != null && endDate.isBefore(startDate)`
- Response: **400** `End date cannot be before start date`
- Both dates are optional — the check only fires when both are provided.

### Delete protection
A project that still has tasks cannot be deleted.

- Applies to: `DELETE /api/projects/{id}`
- Condition: `taskRepository.findByProjectId(id)` returns a non-empty list
- Response: **409** `Cannot delete project with existing tasks`
- Resolution: delete or reassign all tasks first, then delete the project.

---

## Teams

### Duplicate membership prevention
A user cannot be added to a team they already belong to.

- Applies to: `POST /api/teams/{teamId}/members/{userId}`
- Condition: `team.getMembers().contains(user)`
- Response: **409** `User is already a member of this team`
- Resolution: no action needed — the user is already in the team.

### Non-member removal prevention
A user cannot be removed from a team they do not belong to.

- Applies to: `DELETE /api/teams/{teamId}/members/{userId}`
- Condition: `!team.getMembers().contains(user)`
- Response: **400** `User is not a member of this team`

### No delete restriction on non-empty teams
Deleting a team succeeds regardless of whether it has members.
Members are removed from the team but their user accounts are unaffected.

- Applies to: `DELETE /api/teams/{id}`
- Only protection: **404** `Team not found` if the ID does not exist.

---

## Tasks

### Project must exist
The `projectId` in the request body must reference an existing project.

- Applies to: `POST /api/tasks`, `PUT /api/tasks/{id}`
- Response: **404** `Project not found`

### Assigned users must exist
Every `userId` in `assignedUserIds` must reference an existing user.

- Applies to: `POST /api/tasks`, `PUT /api/tasks/{id}`
- Response: **404** `One or more assigned users not found`

---

## Time Entries

### End time ordering
`endTime` cannot be before `startTime`.

- Applies to: `POST /api/time-entries`, `PUT /api/time-entries/{id}`
- Condition: `endTime != null && endTime.isBefore(startTime)`
- Response: **400** `End time cannot be before start time`

### Active timer flag
Whether a timer is still running is derived automatically from `endTime`:

| `endTime` value | `isActive` | `durationMinutes` |
|-----------------|------------|-------------------|
| `null`          | `true`     | `null`            |
| provided        | `false`    | calculated        |

Duration is calculated as `Duration.between(startTime, endTime).toMinutes()`.

### Overlap validation (active timer conflict)
A user cannot have two active timers simultaneously.

- Applies to: `POST /api/time-entries` only (when `endTime` is `null`)
- Condition: user already has at least one entry where `isActive = true`
- Response: **409** `User already has an active time entry`
- Resolution: stop the existing active entry first (`PUT /api/time-entries/{id}` with an `endTime`), then start a new one.

### User and task must exist
Both `userId` and `taskId` must reference existing records.

- Applies to: `POST /api/time-entries`, `PUT /api/time-entries/{id}`
- Response: **404** `User not found` or **404** `Task not found`

---

## Reports

### Both dates required
`startDate` and `endDate` are required query parameters for all generation endpoints.

- Applies to: `GET /api/reports/summary`, `/detailed`, `/by-project`, `/by-team`
- Condition: either parameter is absent or null
- Response: **400** `Both startDate and endDate are required`

### Date order
`startDate` cannot be after `endDate`.

- Response: **400** `Start date cannot be after end date`

### Maximum range
The date range cannot span more than 366 days.

- Condition: `ChronoUnit.DAYS.between(startDate, endDate) > 366`
- Response: **400** `Date range cannot exceed 366 days`

### Active entries excluded
Time entries with `endTime = null` (active timers) are never included in any report.
Only completed entries (where `endTime` is set) are counted.

### Entry inclusion window
An entry is included in a report when its `startTime` falls within
`[startDate 00:00:00, endDate 23:59:59]`.

### Report metadata saved
Every successful call to a generation endpoint persists a `Report` record to the database.
The record stores the report type, date range, generation timestamp, and the first available
ADMIN user as `generatedBy` (or any user if no ADMIN exists).
This metadata is returned by `GET /api/reports`.

### Hours calculation
Hours are calculated as `toMinutes() / 60.0`, rounded to 2 decimal places.

---

## Authentication

### Token required
All endpoints except the following require a valid JWT in `Authorization: Bearer <token>`:

- `POST /api/auth/login`
- `POST /api/users` (registration)
- `GET /api/reports/**`

### Invalid or missing token
Returns **401 Unauthorized** (handled by Spring Security before reaching any controller).
