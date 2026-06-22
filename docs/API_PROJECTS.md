# Projects API Reference

Base URL: `http://localhost:8080/api/projects`

All endpoints require authentication. Include the JWT token in every request:
```
Authorization: Bearer <token>
```

---

## Error Response Format

All errors use this structure (from `GlobalExceptionHandler`):

```json
{ "status": 404, "message": "Project not found" }
```

---

## Endpoints

---

### GET /api/projects

Returns all projects.

**Response 200:**

```json
[
  {
    "id": 1,
    "name": "Time Tracking System",
    "description": "Internal employee time logging platform",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31"
  },
  {
    "id": 2,
    "name": "Mobile App Redesign",
    "description": null,
    "startDate": "2026-03-01",
    "endDate": null
  }
]
```

Returns `[]` if no projects exist.

**Example curl:**

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/api/projects
```

---

### GET /api/projects/{id}

Returns a single project by ID.

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| id | Long | Project ID |

**Response 200:**

```json
{
  "id": 1,
  "name": "Time Tracking System",
  "description": "Internal employee time logging platform",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Project not found` |

**Example curl:**

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/api/projects/1
```

---

### POST /api/projects

Creates a new project.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | String | yes | not blank |
| description | String | no | — |
| startDate | String (LocalDate) | no | format `YYYY-MM-DD` |
| endDate | String (LocalDate) | no | format `YYYY-MM-DD`; cannot be before `startDate` |

**Example request body:**

```json
{
  "name": "Time Tracking System",
  "description": "Internal employee time logging platform",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

Minimal valid request (dates optional):

```json
{
  "name": "Quick Project"
}
```

**Response 201:**

```json
{
  "id": 3,
  "name": "Time Tracking System",
  "description": "Internal employee time logging platform",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `End date cannot be before start date` |
| 400 | `{"name": "must not be blank"}` (validation error format) |

**Example curl:**

```bash
curl -X POST http://localhost:8080/api/projects \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"name":"Time Tracking System","startDate":"2026-01-01","endDate":"2026-12-31"}'
```

---

### PUT /api/projects/{id}

Replaces an existing project. All writable fields are overwritten with the request body values.

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| id | Long | Project ID |

**Request Body:** same fields as `POST /api/projects`.

**Response 200:** updated project (same structure as GET).

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `End date cannot be before start date` |
| 400 | Validation error for missing/invalid fields |
| 404 | `Project not found` |

**Example curl:**

```bash
curl -X PUT http://localhost:8080/api/projects/1 \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"name":"TTS v2","startDate":"2026-01-01","endDate":"2027-06-30"}'
```

---

### DELETE /api/projects/{id}

Deletes a project. Fails if the project has any tasks.

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| id | Long | Project ID |

**Response 204:** no body.

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Project not found` |
| 409 | `Cannot delete project with existing tasks` |

To delete a project that has tasks: delete or reassign all its tasks first.

**Example curl:**

```bash
curl -X DELETE http://localhost:8080/api/projects/1 \
     -H "Authorization: Bearer <token>"
```
