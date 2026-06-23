# Teams API Reference

Base URL: `http://localhost:8080/api/teams`

All endpoints require authentication. Include the JWT token in every request:
```
Authorization: Bearer <token>
```

---

## Error Response Format

All errors use this structure (from `GlobalExceptionHandler`):

```json
{ "status": 404, "message": "Team not found" }
```

Validation errors (missing or blank required fields) use a different structure:

```json
{ "status": 400, "errors": { "name": "must not be blank" } }
```

---

## Response Shape

Every successful response that returns a team uses this structure:

```json
{
  "id": 1,
  "name": "Backend Team",
  "members": [
    { "id": 3, "username": "alice" },
    { "id": 7, "username": "bob" }
  ]
}
```

`members` is always present; it is an empty array `[]` when the team has no members.

---

## Endpoints

---

### GET /api/teams

Returns all teams.

**Response 200:**

```json
[
  {
    "id": 1,
    "name": "Backend Team",
    "members": [
      { "id": 3, "username": "alice" }
    ]
  },
  {
    "id": 2,
    "name": "Frontend Team",
    "members": []
  }
]
```

Returns `[]` if no teams exist.

**Example curl:**

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/api/teams
```

---

### GET /api/teams/{id}

Returns a single team by ID.

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| id | Long | Team ID |

**Response 200:**

```json
{
  "id": 1,
  "name": "Backend Team",
  "members": [
    { "id": 3, "username": "alice" },
    { "id": 7, "username": "bob" }
  ]
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Team not found` |

**Example curl:**

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/api/teams/1
```

---

### POST /api/teams

Creates a new team with no members.

**Request body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | String | yes | not blank |

**Example request body:**

```json
{
  "name": "Backend Team"
}
```

**Response 201:**

```json
{
  "id": 3,
  "name": "Backend Team",
  "members": []
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `{"name": "must not be blank"}` (validation error format) |

**Example curl:**

```bash
curl -X POST http://localhost:8080/api/teams \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"name":"Backend Team"}'
```

---

### PUT /api/teams/{id}

Updates a team's name. Members are not affected.

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| id | Long | Team ID |

**Request body:** same fields as `POST /api/teams`.

**Response 200:** updated team object (same structure as GET).

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `{"name": "must not be blank"}` (validation error format) |
| 404 | `Team not found` |

**Example curl:**

```bash
curl -X PUT http://localhost:8080/api/teams/1 \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"name":"Core Backend Team"}'
```

---

### DELETE /api/teams/{id}

Deletes a team. Members are removed from the team but their user accounts are not deleted.

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| id | Long | Team ID |

**Response 204:** no body.

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Team not found` |

**Example curl:**

```bash
curl -X DELETE http://localhost:8080/api/teams/1 \
     -H "Authorization: Bearer <token>"
```

---

### POST /api/teams/{teamId}/members/{userId}

Adds a user to a team.

**Path parameters:**

| Name | Type | Description |
|------|------|-------------|
| teamId | Long | ID of the team |
| userId | Long | ID of the user to add |

**Request body:** none.

**Response 200:** updated team object with the new member included in `members`.

```json
{
  "id": 1,
  "name": "Backend Team",
  "members": [
    { "id": 3, "username": "alice" },
    { "id": 5, "username": "carol" }
  ]
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Team not found` |
| 404 | `User not found` |
| 409 | `User is already a member of this team` |

**Example curl:**

```bash
curl -X POST http://localhost:8080/api/teams/1/members/5 \
     -H "Authorization: Bearer <token>"
```

---

### DELETE /api/teams/{teamId}/members/{userId}

Removes a user from a team.

**Path parameters:**

| Name | Type | Description |
|------|------|-------------|
| teamId | Long | ID of the team |
| userId | Long | ID of the user to remove |

**Response 204:** no body.

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Team not found` |
| 404 | `User not found` |
| 400 | `User is not a member of this team` |

**Example curl:**

```bash
curl -X DELETE http://localhost:8080/api/teams/1/members/5 \
     -H "Authorization: Bearer <token>"
```
